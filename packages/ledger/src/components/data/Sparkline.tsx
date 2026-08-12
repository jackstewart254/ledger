"use client";

import { useId, type CSSProperties } from "react";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** Area fill under the line — --chart-fill fading to transparent. */
  fill?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Sparkline — tiny inline SVG polyline from a number[]. Stroke --chart-line,
 * optional --chart-fill area. No lib.
 */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  fill = false,
  strokeWidth = 1.5,
  className,
  style,
}: SparklineProps) {
  // per-instance id: url(#…) resolves to the FIRST matching def in the document,
  // whose stop colours are those of ITS theme subtree — a shared id repaints
  // every chart in the first instance's theme
  const fillId = useId();
  const cls = ["lg-sparkline", className].filter(Boolean).join(" ");
  if (data.length === 0) {
    return <svg className={cls} width={width} height={height} style={style} aria-hidden="true" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = strokeWidth + 1;
  const stepX = (width - pad * 2) / (data.length - 1 || 1);
  const points = data.map(
    (d, i) => [pad + i * stepX, height - pad - ((d - min) / range) * (height - pad * 2)] as const,
  );
  const pts = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const areaPts = `${pts} ${last[0].toFixed(1)},${height} ${first[0].toFixed(1)},${height}`;

  return (
    <svg
      className={cls}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={style}
      aria-hidden="true"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop className="lg-sparkline-stop-top" offset="0%" />
              <stop className="lg-sparkline-stop-bottom" offset="100%" />
            </linearGradient>
          </defs>
          {/* inline: the id is per-instance, so the paint reference can't live in CSS */}
          <polygon className="lg-sparkline-area" points={areaPts} style={{ fill: `url(#${fillId})` }} />
        </>
      )}
      <polyline className="lg-sparkline-line" points={pts} strokeWidth={strokeWidth} />
    </svg>
  );
}
