"use client";

import { useId, type CSSProperties } from "react";

export interface TrendChartProps {
  data: number[];
  width?: number;
  height?: number;
  /** Area fill under the line. */
  area?: boolean;
  /** Min/max label formatter (mono, tabular). */
  format?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
}

/* Left gutter must clear the widest formatted label — 44px clipped "£12,480"
   to ".2,480". Sized for a currency figure at the label size. */
const PAD_L = 76;
const PAD = 8;
const GRID_LINES = 2; // intervals — 3 hairlines (min, mid, max). Five was a cage.

/**
 * TrendChart — SVG line/area chart: hairline grid (--chart-grid), min/max
 * labels in mono. No axes ceremony, no lib.
 */
export function TrendChart({
  data,
  width = 560,
  height = 200,
  area = true,
  format = String,
  className,
  style,
}: TrendChartProps) {
  // per-instance id — see Sparkline: a shared id makes every chart paint with
  // the first def's theme colours
  const fillId = useId();
  const cls = ["lg-trendchart", className].filter(Boolean).join(" ");
  if (data.length === 0) {
    return <svg className={cls} width={width} height={height} style={style} aria-hidden="true" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const innerW = width - PAD_L - PAD;
  const innerH = height - PAD * 2;
  const x = (i: number) => PAD_L + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD + (1 - (v - min) / range) * innerH;
  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d).toFixed(1)}`).join(" ");
  const areaPts = `${pts} ${x(data.length - 1).toFixed(1)},${PAD + innerH} ${PAD_L},${PAD + innerH}`;

  return (
    <svg
      className={cls}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={style}
      aria-hidden="true"
    >
      {Array.from({ length: GRID_LINES + 1 }, (_, t) => {
        const yy = y(min + (range * t) / GRID_LINES);
        return (
          <line
            key={t}
            className="lg-trendchart-grid"
            x1={PAD_L}
            y1={yy}
            x2={width - PAD}
            y2={yy}
          />
        );
      })}
      <text className="lg-trendchart-label" x={PAD_L - PAD} y={y(max) + 3} textAnchor="end">
        {format(max)}
      </text>
      <text className="lg-trendchart-label" x={PAD_L - PAD} y={y(min) + 3} textAnchor="end">
        {format(min)}
      </text>
      {area && (
        <>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop className="lg-trendchart-stop-top" offset="0%" />
              <stop className="lg-trendchart-stop-bottom" offset="100%" />
            </linearGradient>
          </defs>
          {/* inline: the id is per-instance, so the paint reference can't live in CSS */}
          <polygon className="lg-trendchart-area" points={areaPts} style={{ fill: `url(#${fillId})` }} />
        </>
      )}
      <polyline className="lg-trendchart-line" points={pts} strokeWidth={1.5} />
    </svg>
  );
}
