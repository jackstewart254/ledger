"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";
import { areaPath, linePath, scaleLinear, type ChartPoint } from "./chart-internals.js";
import type { MetricPolarity } from "./MetricDelta.js";

/** The kit's tone vocabulary (same four as BarTone) — colour is a claim, never decoration. */
export type KpiTone = "neutral" | "success" | "warning" | "danger";

export interface KpiTileTarget {
  /** The threshold the reading is judged against, in `current`'s units. */
  value: number;
  /** What the threshold IS — "SLA 1s", "Budget £2,000". Sits under the bar. */
  label?: ReactNode;
}

export interface KpiTileAProps {
  label: ReactNode;
  /** The headline figure, already formatted — "812ms", "£642.10". */
  value: ReactNode;
  /** The number BEHIND `value`, in the target's units. `target` needs it to place the bar. */
  current?: number;
  /** MetricDelta slot — sits on the figure's baseline, not floating above it. */
  delta?: ReactNode;
  /** Optional glyph, left of the label. */
  icon?: LucideIcon;
  /** Series behind the figure, oldest first. Fewer than two points draws nothing. */
  trend?: number[];
  /** Threshold this reading is judged against. Needs `current`. */
  target?: KpiTileTarget;
  /** Which direction is good. Latency and queue depth are lower-is-better. */
  polarity?: MetricPolarity;
  /** Overrides the tone derived from `target` — the "close to breach" call is the caller's. */
  tone?: KpiTone;
  /** Formats the signed gap to the target, e.g. (n) => `${n > 0 ? "+" : ""}${n}ms`. */
  format?: (gap: number) => string;
  className?: string;
  style?: CSSProperties;
}

/* Trend geometry. The viewBox is unitless and stretched with
   preserveAspectRatio="none", so the shape fills any tile width without a
   measured width, a ResizeObserver or a layout effect — a KPI row is four to
   eight of these and none of them should be observing anything. The only
   stroked thing inside carries vector-effect: non-scaling-stroke, so the line
   keeps its weight under the non-uniform scale (see .lg-kpi-a-line). */
const VB_H = 100;
const VB_PAD = 14; /* headroom so the extremes aren't drawn on the box edge */

/* Where the threshold sits across the track — FIXED, not derived from the data.
   A row of tiles then has its gates on one vertical line, so "past it" and "well
   short of it" are comparable across metrics that share nothing else. The cost
   is a bar that runs out at 1.33x the target; the caption carries the magnitude
   past that. */
const GATE = 0.75;

/* Two decimals of a percentage is below a hairline on any tile width. */
const clamp = (n: number, lo: number, hi: number) =>
  Math.round(Math.min(hi, Math.max(lo, n)) * 100) / 100;

/* Only ever called with 2+ finite points. */
function trendPaths(data: number[]): { line: string; area: string } {
  const y = scaleLinear([Math.min(...data), Math.max(...data)], [VB_H - VB_PAD, VB_PAD]);
  const points: ChartPoint[] = data.map((v, i) => ({ x: i, y: y(v) }));
  return { line: linePath(points), area: areaPath(points, VB_H) };
}

/**
 * KpiTileA — a reading and the two things that say whether it is FINE or a FIRE.
 *
 * The old tile told you what the number was and nothing else: "812ms" and a
 * delta pill say the figure moved, not that it breached anything. Two optional
 * context slots fix that, and the tile is whatever you give it:
 *
 *   trend   — the series, bled to the tile's edges as its floor. Which way, how
 *             sharply. No axis, no grid, no hover readout: this is a shape, not
 *             a chart you take readings off. That is what TrendChart is for.
 *   target  — the threshold, as a track with the gate marked at a FIXED 75%
 *             across. Fill is the reading. Past the gate, the tile turns: the
 *             bar, the trend and the figure itself go --danger, so a breach in a
 *             row of tiles is a red number, seen from across the room.
 *
 * Neither slot given, it is a clean value tile. Both, and the chart sits above
 * the bar. Tone is derived — met or breached, per `polarity`. There is
 * deliberately no automatic "warning" band: how close to the line counts as
 * amber depends on burn rate and time of day, which is the caller's call, so
 * pass `tone="warning"` and mean it.
 */
export function KpiTileA({
  label,
  value,
  current,
  delta,
  icon,
  trend,
  target,
  polarity = "higher-is-better",
  tone,
  format = String,
  className,
  style,
}: KpiTileAProps) {
  /* per-instance id — a shared one makes every tile paint with the FIRST def's
     theme colours (see Sparkline) */
  const fillId = useId();

  const series = trend ?? [];
  const drawTrend = series.length > 1 && series.every(Number.isFinite);
  const paths = drawTrend ? trendPaths(series) : null;

  const reading = current ?? Number.NaN;
  const drawTarget = target !== undefined && Number.isFinite(reading);

  const met = !drawTarget
    ? false
    : polarity === "lower-is-better"
      ? reading <= target.value
      : reading >= target.value;
  const resolved: KpiTone = tone ?? (drawTarget ? (met ? "success" : "danger") : "neutral");

  /* The bar's domain runs to target/GATE, so the threshold lands on GATE every
     time. A zero or negative target has no scale to divide by — it is a
     "none of these" target, so anything above nothing fills the bar. */
  const span = drawTarget ? target.value / GATE : 0;
  const fill = !drawTarget
    ? 0
    : span > 0
      ? clamp(scaleLinear([0, span], [0, 100])(reading), 0, 100)
      : reading > 0
        ? 100
        : 0;

  return (
    <div className={cx("lg-kpi-a", `lg-kpi-a--${resolved}`, className)} style={style}>
      <div className="lg-kpi-a-head">
        {icon && (
          <span className="lg-kpi-a-icon">
            <Icon as={icon} />
          </span>
        )}
        <span className="lg-kpi-a-label">{label}</span>
      </div>

      <div className="lg-kpi-a-figure">
        <span className="lg-kpi-a-value">{value}</span>
        {delta}
      </div>

      {(drawTrend || drawTarget) && (
        <div className="lg-kpi-a-context">
          {paths && (
            <div className="lg-kpi-a-trend">
              <svg
                className="lg-kpi-a-trend-svg"
                viewBox={`0 0 ${series.length - 1} ${VB_H}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                    <stop className="lg-kpi-a-area-top" offset="0%" />
                    <stop className="lg-kpi-a-area-bottom" offset="100%" />
                  </linearGradient>
                </defs>
                {/* inline: the id is per-instance, so the paint reference can't live in CSS */}
                <path className="lg-kpi-a-area" d={paths.area} style={{ fill: `url(#${fillId})` }} />
                <path className="lg-kpi-a-line" d={paths.line} />
              </svg>
            </div>
          )}

          {drawTarget && (
            <div className="lg-kpi-a-target">
              <div
                className="lg-kpi-a-track"
                style={
                  { "--lg-kpi-a-fill": `${fill}%`, "--lg-kpi-a-gate": `${GATE * 100}%` } as CSSProperties
                }
              >
                <span className="lg-kpi-a-fill" />
                <span className="lg-kpi-a-gate" />
              </div>
              <div className="lg-kpi-a-caption">
                <span className="lg-kpi-a-threshold">{target.label}</span>
                <span className="lg-kpi-a-gap">{format(reading - target.value)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
