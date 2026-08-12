"use client";

import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { scaleLinear, useChartHover } from "./chart-internals.js";
import { ChartTooltip } from "./ChartTooltip.js";

/** A bar is ink unless its bucket is a claim — an error run, a breach, a win. */
export type BarTone = "neutral" | "success" | "warning" | "danger";

export interface BarChartDatum {
  /** Bucket name — the tooltip's heading (e.g. "14:20–14:25"). */
  label: string;
  value: number;
  tone?: BarTone;
}

export interface BarChartProps {
  data: BarChartDatum[];
  /** Caps micro-label above the figure. */
  label?: ReactNode;
  /** Headline figure — the total the series sums to. */
  value?: ReactNode;
  /** Secondary counts, on the figure's baseline. */
  meta?: ReactNode;
  /** Tooltip value formatter. */
  format?: (value: number) => string;
  /** CSS length for the plot area — the width always comes from the container. */
  height?: string;
  xStartLabel?: ReactNode;
  xEndLabel?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/* The viewBox is unitless and stretched with preserveAspectRatio="none", so the
   chart fills any container without a measured width. Only axis-aligned rects
   live inside it — no strokes, no radii, nothing a non-uniform scale distorts.
   Every label is HTML outside the SVG for the same reason. */
const VB_H = 100;
const SLOT = 4; // one bucket
const BAR = 3; // the bar; the 1-unit remainder is the gutter
const GUTTER = SLOT - BAR;
const MIN_BAR = 1; // a bucket with traffic never renders as nothing

/**
 * BarChart — the log-panel series: caps micro-label, headline figure and
 * secondary counts, then a dense bar run with start/end labels beneath.
 *
 * Colour is semantic only. Ordinary buckets are ink; a `tone` bar is the
 * exception that should catch the eye, which is exactly what a red error spike
 * in a monochrome run does.
 */
export function BarChart({
  data,
  label,
  value,
  meta,
  format = String,
  height,
  xStartLabel,
  xEndLabel,
  className,
  style,
}: BarChartProps) {
  const hover = useChartHover(data.length, "band");
  // Measured on hover — the only moment the tooltip needs the box, so the
  // component carries no resize observer and no layout effect.
  const [plotW, setPlotW] = useState(0);
  const [plotH, setPlotH] = useState(0);

  const max = Math.max(0, ...data.map((d) => d.value));
  const y = scaleLinear([0, max || 1], [VB_H, 0]);
  const vbW = Math.max(data.length * SLOT - GUTTER, BAR);
  const index = hover.index !== null && hover.index < data.length ? hover.index : null;
  const active = index === null ? undefined : data[index];

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    hover.onPointerMove(e);
    const rect = e.currentTarget.getBoundingClientRect();
    setPlotW(rect.width);
    setPlotH(rect.height);
  };

  /* Once ANY bucket carries a health tone, the series is a health series, and
     an untoned bar no longer means "ordinary volume" — it means "this one was
     fine". Blue would then be the only colour on the chart that doesn't say
     anything, sitting among reds and ambers that do. So the plain bars go
     green. Derived from the data rather than asked of the caller: the same
     dataset always reads the same way, and there is no flag to get wrong. */
  const health = data.some((d) => d.tone && d.tone !== "neutral");
  const cls = ["lg-barchart", health && "lg-barchart--health", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={{ "--lg-bar-h": height, ...style } as CSSProperties}>
      {(label || value || meta) && (
        <div className="lg-barchart-head">
          {label && <span className="lg-barchart-label">{label}</span>}
          {(value || meta) && (
            <div className="lg-barchart-figures">
              {value && <span className="lg-barchart-value">{value}</span>}
              {meta && <span className="lg-barchart-meta">{meta}</span>}
            </div>
          )}
        </div>
      )}

      <div className="lg-chart lg-barchart-plot">
        <svg
          className="lg-chart-svg lg-barchart-svg"
          viewBox={`0 0 ${vbW} ${VB_H}`}
          preserveAspectRatio="none"
          onPointerMove={onPointerMove}
          onPointerLeave={hover.onPointerLeave}
          aria-hidden="true"
        >
          {data.map((d, i) => {
            const h = Math.max(VB_H - y(Math.max(d.value, 0)), d.value > 0 ? MIN_BAR : 0);
            const tone = d.tone && d.tone !== "neutral" ? `lg-barchart-bar--${d.tone}` : undefined;
            return (
              <rect
                key={i}
                className={["lg-barchart-bar", tone, i === index && "lg-barchart-bar--active"]
                  .filter(Boolean)
                  .join(" ")}
                x={i * SLOT}
                y={VB_H - h}
                width={BAR}
                height={h}
              />
            );
          })}
        </svg>
        <ChartTooltip
          x={index === null ? 0 : ((index * SLOT + BAR / 2) / vbW) * plotW}
          y={active ? (y(Math.max(active.value, 0)) / VB_H) * plotH : 0}
          label={active?.label}
          value={active ? format(active.value) : null}
          visible={active !== undefined}
        />
      </div>

      {(xStartLabel || xEndLabel) && (
        <div className="lg-barchart-axis">
          <span className="lg-chart-axis">{xStartLabel}</span>
          <span className="lg-chart-axis">{xEndLabel}</span>
        </div>
      )}
    </div>
  );
}
