import type { CSSProperties } from "react";

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

// left gutter for the min/max labels, breathing room elsewhere
const PAD_L = 44;
const PAD = 8;
const GRID_LINES = 4; // intervals — 5 hairlines from min to max

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
            {/* ponytail: static gradient id — duplicates are identical by construction */}
            <linearGradient id="lg-trendchart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop className="lg-trendchart-stop-top" offset="0%" />
              <stop className="lg-trendchart-stop-bottom" offset="100%" />
            </linearGradient>
          </defs>
          <polygon className="lg-trendchart-area" points={areaPts} />
        </>
      )}
      <polyline className="lg-trendchart-line" points={pts} strokeWidth={2} />
    </svg>
  );
}
