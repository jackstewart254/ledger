import type { CSSProperties, ReactNode } from "react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";
import type { MetricPolarity } from "./MetricDelta.js";
import { areaPath, linePath, scaleLinear, type ChartPoint } from "./chart-internals.js";

/**
 * A threshold to read the figure against — an SLA, a budget, an SLO floor.
 * `value` and `threshold` are the raw numbers on the same scale; the tile's
 * `value` prop stays the formatted string a human reads.
 */
export interface KpiTarget {
  value: number;
  threshold: number;
  /**
   * A soft threshold in the metric's OWN units — met, but close enough to warn.
   * "within 10% of the line" was tried as a default and is useless on anything
   * that lives near 100: it paints 99.98% uptime against a 99.9% floor amber.
   * No default; a caller who knows the scale says where attention starts.
   */
  near?: number;
  /** Which side of the threshold is good. Defaults to higher-is-better. */
  polarity?: MetricPolarity;
  /** Names the threshold under the bar, e.g. "SLA 1,000 ms". */
  label?: ReactNode;
}

export interface KpiTileBProps {
  label: ReactNode;
  value: ReactNode;
  /** MetricDelta slot — sits on the figure's baseline. */
  delta?: ReactNode;
  /** Glyph beside the label. */
  icon?: LucideIcon;
  /** Series for the bled trend strip. Fewer than two points draws nothing. */
  trend?: number[];
  /** Threshold slot — the bar under the figure. */
  target?: KpiTarget;
  className?: string;
  style?: CSSProperties;
}

/* The trend viewBox is unitless and stretched with preserveAspectRatio="none":
   the strip has to fill whatever column the tile lands in, and measuring per
   tile would put a ResizeObserver behind every cell of a KPI row. The only
   thing a non-uniform scale would distort is the line's weight, and
   vector-effect: non-scaling-stroke handles that. */
const VB = 100;
const TOP = 6; /* the peak sits just inside the top edge */
const FLOOR = 88; /* the trough, with fill still visible beneath it */

/* The threshold sits at the SAME position on every track, and the bar is scaled
   to it rather than to the data. Absolute scales would put each tile's mark
   somewhere different and a row of KPIs would need reading one at a time; with
   the marks aligned, "which of these has crossed" is one glance down a column.
   The cost is that the bar shows a ratio, not a magnitude — deliberate. */
const MARK = 75;

type Tone = "ok" | "near" | "breach";

function toneOf({ value, threshold, near, polarity }: KpiTarget): Tone {
  const lower = polarity === "lower-is-better";
  const met = lower ? value <= threshold : value >= threshold;
  if (!met) return "breach";
  if (near === undefined) return "ok";
  return (lower ? value >= near : value <= near) ? "near" : "ok";
}

function trendPaths(series: number[]): { area: string; line: string } {
  const x = scaleLinear([0, series.length - 1], [0, VB]);
  const y = scaleLinear([Math.min(...series), Math.max(...series)], [FLOOR, TOP]);
  const points: ChartPoint[] = series.map((v, i) => ({ x: x(i), y: y(v) }));
  /* the area drops to the viewBox floor, not to FLOOR: the strip is bled to the
     tile's edge and the fill has to reach it */
  return { area: areaPath(points, VB), line: linePath(points) };
}

/**
 * KpiTileB — the figure, plus the context that says whether the figure is fine.
 *
 * A number and a delta can only ever report that something moved. "p95 812 ms,
 * +4%" leaves the reader exactly where they started: is that normal? The two
 * optional slots answer the two questions a delta cannot.
 *
 *   trend  — a bled area strip: which way is it going, how sharply.
 *   target — a bar against a threshold: is it acceptable.
 *
 * One tone drives the whole tile. With no target there is no verdict to make,
 * so the trend draws in --chart-line, the neutral data colour. A target that is
 * met keeps it; approaching the line goes warning, past it goes danger, and the
 * figure itself turns red — the fire should be visible from across the room.
 *
 * Pass both slots, one, or neither. With neither it is a value tile.
 */
export function KpiTileB({
  label,
  value,
  delta,
  icon,
  trend,
  target,
  className,
  style,
}: KpiTileBProps) {
  /* a zero or negative threshold has no ratio to draw against, and a NaN
     value would render a bar of width NaN — drop the slot rather than the tile */
  const t =
    target && Number.isFinite(target.value) && target.threshold > 0 ? target : undefined;
  const tone = t && toneOf(t);
  /* one point is a dot, not a trend, and a series with a hole in it would
     scale against NaN */
  const series =
    trend && trend.length > 1 && trend.every((v) => Number.isFinite(v)) ? trend : undefined;
  const paths = series && trendPaths(series);

  return (
    <div className={cx("lg-kpi-b", tone && `lg-kpi-b--${tone}`, className)} style={style}>
      <div className="lg-kpi-b-top">
        <div className="lg-kpi-b-head">
          {icon && <Icon as={icon} className="lg-kpi-b-icon" />}
          <span className="lg-kpi-b-label">{label}</span>
        </div>
        <div className="lg-kpi-b-figures">
          <span className="lg-kpi-b-value">{value}</span>
          {delta}
        </div>
      </div>

      {paths && (
        <svg
          className="lg-kpi-b-trend"
          viewBox={`0 0 ${VB} ${VB}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className="lg-kpi-b-area" d={paths.area} />
          <path className="lg-kpi-b-line" d={paths.line} />
        </svg>
      )}

      {t && (
        <div className="lg-kpi-b-target">
          <div
            className="lg-kpi-b-track"
            style={
              {
                /* two decimals — the same precision chart-internals rounds its
                   coordinates to, and below a hairline on any real track */
                "--lg-kpi-b-fill": `${
                  Math.round(Math.min(100, Math.max(0, (t.value / t.threshold) * MARK)) * 100) / 100
                }%`,
                "--lg-kpi-b-mark": `${MARK}%`,
              } as CSSProperties
            }
          >
            <span className="lg-kpi-b-bar" />
            <span className="lg-kpi-b-mark" />
          </div>
          {t.label && <span className="lg-kpi-b-caption">{t.label}</span>}
        </div>
      )}
    </div>
  );
}
