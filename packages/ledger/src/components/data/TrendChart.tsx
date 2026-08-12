"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { ChartTooltip } from "./ChartTooltip.js";
import {
  areaPath,
  linePath,
  niceTicks,
  scaleLinear,
  useChartHover,
  useChartWidth,
  type ChartPoint,
} from "./chart-internals.js";

export interface TrendChartProps {
  data: number[];
  /** Per-point labels. The ends are drawn on the x axis; all of them read out on hover. */
  labels?: string[];
  /** Drawing width before the container is measured (SSR / first paint). */
  width?: number;
  height?: number;
  /** Gradient area fill under the line. */
  area?: boolean;
  /** Tick + readout formatter (mono, tabular). */
  format?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
}

/* Three intervals of grid, no more. Five was a cage. */
const TICKS = 3;
const PAD_T = 10; /* half a tick label — the top label is centred on the top line */
const PAD_R = 8;
const PAD_B = 8;
const AXIS_H = 18; /* the x-label row, when there are labels */
/* Left gutter is sized from the widest tick label rather than fixed: 76px was
   set for "£12,480" and left a quarter of a narrow card empty for "40".
   ponytail: character-count estimate at the tabular advance of --text-xs;
   measure properly only if a proportional face ever ships. */
const CH_W = 7.5;
const GUTTER_MIN = 30;
const GUTTER_MAX = 88;

/**
 * TrendChart — area chart: gradient fill under a hairline-thin line, grid at
 * rounded tick values, y ticks in the left gutter, x labels at the ends. On
 * hover, a crosshair, a dot on the nearest point and a readout.
 *
 * Draws at its measured width (see useChartWidth), so it fills a fluid column
 * instead of scaling its own type up with a fixed viewBox.
 */
export function TrendChart({
  data,
  labels,
  width = 560,
  height = 200,
  area = true,
  format = String,
  className,
  style,
}: TrendChartProps) {
  /* per-instance id — see Sparkline: a shared id makes every chart paint with
     the first def's theme colours */
  const fillId = useId();
  const [ref, w] = useChartWidth(width);
  const { index, onPointerMove, onPointerLeave } = useChartHover(data.length);
  /* the last hovered index, so the readout doesn't change its mind mid-fade */
  const lastIndex = useRef(0);
  useEffect(() => {
    if (index !== null) lastIndex.current = index;
  }, [index]);

  const cls = ["lg-chart", "lg-trendchart", className].filter(Boolean).join(" ");
  /* empty, or a series with a NaN in it — nothing to scale against */
  const ticks = data.length === 0 ? [] : niceTicks(Math.min(...data), Math.max(...data), TICKS);
  if (ticks.length === 0) {
    return <div ref={ref} className={cls} style={style} />;
  }

  const gutter = Math.min(
    GUTTER_MAX,
    Math.max(GUTTER_MIN, Math.ceil(Math.max(...ticks.map((t) => format(t).length)) * CH_W) + 8),
  );
  const bottom = height - PAD_B - (labels ? AXIS_H : 0);
  const x = scaleLinear([0, data.length - 1], [gutter, Math.max(gutter, w - PAD_R)]);
  const y = scaleLinear([ticks[0], ticks[ticks.length - 1]], [bottom, PAD_T]);
  const points: ChartPoint[] = data.map((v, i) => ({ x: x(i), y: y(v) }));

  const active = points[index ?? lastIndex.current] ?? points[0];
  const activeIndex = index ?? lastIndex.current;

  return (
    <div ref={ref} className={cls} style={style}>
      <svg
        className="lg-chart-svg"
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="lg-chart-grid" x1={gutter} y1={y(t)} x2={w - PAD_R} y2={y(t)} />
            <text
              className="lg-chart-axis"
              x={gutter - PAD_R}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="central"
            >
              {format(t)}
            </text>
          </g>
        ))}

        {area && (
          <>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop className="lg-trendchart-stop-top" offset="0%" />
                <stop className="lg-trendchart-stop-bottom" offset="100%" />
              </linearGradient>
            </defs>
            {/* inline: the id is per-instance, so the paint reference can't live in CSS */}
            <path
              className="lg-trendchart-area"
              d={areaPath(points, bottom)}
              style={{ fill: `url(#${fillId})` }}
            />
          </>
        )}
        <path className="lg-trendchart-line" d={linePath(points)} />

        {labels && (
          <>
            <text className="lg-chart-axis" x={gutter} y={height - PAD_B} textAnchor="start">
              {labels[0]}
            </text>
            <text className="lg-chart-axis" x={w - PAD_R} y={height - PAD_B} textAnchor="end">
              {labels[data.length - 1]}
            </text>
          </>
        )}

        {index !== null && (
          <>
            <line className="lg-chart-crosshair" x1={active.x} y1={PAD_T} x2={active.x} y2={bottom} />
            <circle className="lg-trendchart-dot" cx={active.x} cy={active.y} />
          </>
        )}
      </svg>

      <ChartTooltip
        x={active.x}
        y={active.y}
        label={labels?.[activeIndex]}
        value={format(data[activeIndex] ?? 0)}
        visible={index !== null}
      />
    </div>
  );
}
