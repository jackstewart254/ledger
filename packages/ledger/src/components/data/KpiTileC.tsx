"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "../../internal/cx.js";
import { Icon, type LucideIcon } from "../core/Icon.js";
import type { MetricPolarity } from "./MetricDelta.js";
import {
  areaPath,
  linePath,
  scaleLinear,
  useChartWidth,
  type ChartPoint,
} from "./chart-internals.js";

/** The line the value is judged against — an SLA, a budget, a headcount cap. */
export interface KpiTargetC {
  /** The threshold itself, in the same unit as `current`. */
  value: number;
  /** What the line is called, written out: "1 s SLA", "£2,000 budget". */
  label?: ReactNode;
  /**
   * Domain floor for the bar. Defaults to 0, which is right for latency and
   * queue depth and useless for a success rate — 96.2% and 99% are the same
   * pixel on a 0–100 track. Set it to the bottom of the range you actually
   * care about (95, for a 99% SLA) and the bar spends its width on that range.
   */
  min?: number;
  /** Formats the distance to the line. Defaults to the bare number. */
  format?: (value: number) => string;
}

export interface KpiTileCProps {
  label: ReactNode;
  /** The figure as it should read — "1.24 s", "£12,480.22", "96.2%". */
  value: ReactNode;
  /** MetricDelta slot — sits on the figure's baseline. */
  delta?: ReactNode;
  /** Optional glyph, left of the label. */
  icon?: LucideIcon;
  /**
   * The same figure as a number. Only the target bar needs it; without it a
   * `target` has nothing to compare and the bar is dropped.
   */
  current?: number;
  /** Context slot 1 — the threshold. Renders the bar and the verdict. */
  target?: KpiTargetC;
  /** Which direction is good. Latency and queue depth are lower-is-better. */
  polarity?: MetricPolarity;
  /** Context slot 2 — the series. Renders the bled trend strip. */
  trend?: number[];
  className?: string;
  style?: CSSProperties;
}

/* --- the bar ----------------------------------------------------------------
   The threshold sits at a FIXED 66% of the track for any value within ~1.5× of
   it, so a row of tiles marks its lines at the same place and you read the row
   by comparing fills against one vertical rule. Past that the domain stretches
   to the value instead and the mark slides left, which is the correct reading
   of a bad breach: the line is a long way behind us. HEADROOM keeps a breaching
   fill off the far edge, so "over" never looks like "maxed out". */
const MARK = 0.66;
const HEADROOM = 1.06;
/* Within a tenth of the track of the line is not comfortable — it is next. */
const NEAR = 0.1;

type GaugeState = "ok" | "near" | "breach";

/** Track fractions land in the DOM as percentages — two decimals is sub-pixel. */
const pctOf = (n: number) => Math.round(n * 10000) / 100;

function gauge(current: number, target: KpiTargetC, polarity: MetricPolarity) {
  const min = target.min ?? 0;
  const t = target.value - min;
  const v = current - min;
  const span = Math.max(t / MARK, v * HEADROOM) || 1;
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const fill = clamp(v / span);
  const mark = clamp(t / span);
  /* Slack is how much track sits between the fill and the line, on the good
     side of it. Negative means we are past it. */
  const slack = polarity === "lower-is-better" ? mark - fill : fill - mark;
  const state: GaugeState = slack < 0 ? "breach" : slack < NEAR ? "near" : "ok";
  return { fill, mark, state };
}

/* --- the trend strip --------------------------------------------------------
   Bleeds to the tile's edges rather than sitting in a box: a framed chart
   inside a framed tile is two frames, and the strip is a base for the figure,
   not a second figure. The floor stays clear of the tile's bottom corners so a
   series ending at its own minimum isn't clipped by the radius. */
const TREND_H = 44;
const TREND_TOP = 4;
const TREND_FLOOR = 28;
const TREND_W = 240;

/**
 * KpiTileC — a figure plus the context that says whether the figure is fine.
 *
 * The old tile named a number and stopped. A delta only ever says "it moved":
 * on `p95 812 ms` or `queue depth 177` the reader still cannot tell if that is
 * a Tuesday or an incident. Two optional slots answer the two questions worth
 * asking of a stat — `trend` for which way it is going, `target` for whether
 * where it is now is acceptable. Pass either, both or neither.
 *
 * Colour is the verdict and nothing else. The target decides one tone, and the
 * bar, the trend and the gap text all read it, so a tile is one colour with one
 * meaning. No target means no verdict, and the trend stays the neutral data
 * blue every other chart in the kit draws in.
 */
export function KpiTileC({
  label,
  value,
  delta,
  icon,
  current,
  target,
  polarity = "higher-is-better",
  trend,
  className,
  style,
}: KpiTileCProps) {
  /* per-instance id — a shared gradient id makes every tile paint with the
     first def's theme colours (see Sparkline) */
  const fillId = useId();
  const [trendRef, w] = useChartWidth(TREND_W);

  const g = target && current !== undefined ? gauge(current, target, polarity) : null;

  /* One point is not a trend, and a NaN in the series has nothing to scale
     against — both degrade to no strip rather than to an empty box. */
  const series =
    trend && trend.length > 1 && trend.every((n) => Number.isFinite(n)) ? trend : null;
  let points: ChartPoint[] = [];
  if (series) {
    const x = scaleLinear([0, series.length - 1], [0, w]);
    const y = scaleLinear([Math.min(...series), Math.max(...series)], [TREND_FLOOR, TREND_TOP]);
    points = series.map((v, i) => ({ x: x(i), y: y(v) }));
  }

  let gapText: string | null = null;
  if (target && current !== undefined) {
    const diff = current - target.value;
    /* 96.2 − 99 is −2.8000000000000007 in binary floating point */
    const gap = Math.round(Math.abs(diff) * 1e4) / 1e4;
    const format = target.format ?? String;
    gapText = diff === 0 ? "On target" : `${format(gap)} ${diff > 0 ? "over" : "under"}`;
  }

  return (
    <div
      className={cx("lg-kpi-c", g ? `lg-kpi-c--${g.state}` : undefined, className)}
      style={style}
    >
      <div className="lg-kpi-c-head">
        {icon && <Icon as={icon} className="lg-kpi-c-icon" />}
        <span className="lg-kpi-c-label">{label}</span>
      </div>

      <div className="lg-kpi-c-figure">
        <span className="lg-kpi-c-value">{value}</span>
        {delta}
      </div>

      {series && (
        <div ref={trendRef} className="lg-kpi-c-trend">
          <svg
            className="lg-chart-svg"
            width={w}
            height={TREND_H}
            viewBox={`0 0 ${w} ${TREND_H}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop className="lg-kpi-c-stop-top" offset="0%" />
                <stop className="lg-kpi-c-stop-bottom" offset="100%" />
              </linearGradient>
            </defs>
            {/* inline: the id is per-instance, so the paint reference can't live in CSS */}
            <path
              className="lg-kpi-c-area"
              d={areaPath(points, TREND_H)}
              style={{ fill: `url(#${fillId})` }}
            />
            <path className="lg-kpi-c-line" d={linePath(points)} />
          </svg>
        </div>
      )}

      {g && (
        <div className="lg-kpi-c-gauge">
          <div
            className="lg-kpi-c-track"
            aria-hidden="true"
            style={
              {
                "--lg-kpi-c-fill": `${pctOf(g.fill)}%`,
                "--lg-kpi-c-mark": `${pctOf(g.mark)}%`,
              } as CSSProperties
            }
          >
            <span className="lg-kpi-c-bar" />
            <span className="lg-kpi-c-mark" />
          </div>
          <div className="lg-kpi-c-caption">
            {target?.label && <span className="lg-kpi-c-threshold">{target.label}</span>}
            <span className="lg-kpi-c-gap">{gapText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
