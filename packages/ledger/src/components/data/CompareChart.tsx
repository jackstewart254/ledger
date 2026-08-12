"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ChartTooltip } from "./ChartTooltip.js";
import {
  linePath,
  niceTicks,
  scaleLinear,
  useChartHover,
  useChartWidth,
  type ChartPoint,
} from "./chart-internals.js";

export interface CompareSeries {
  /** Names the period in the legend and in the hover readout. */
  label: string;
  data: number[];
}

export interface CompareChartProps {
  current: CompareSeries;
  previous?: CompareSeries;
  /** x-axis tick labels, spread evenly across the width. */
  labels?: string[];
  /** how many y ticks to aim for; default 4. */
  yTicks?: number;
  /** formats y tick labels and the hover readout. */
  format?: (value: number) => string;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

/* Geometry is TrendChart's — the two charts sit next to each other in a
   dashboard and any difference in gutter or axis row reads as a misalignment. */
const PAD_T = 10; /* half a tick label — the top label is centred on the top line */
const PAD_R = 8;
const PAD_B = 8;
const AXIS_H = 18; /* the x-label row, when there are labels */
const CH_W = 7.5; /* tabular advance at --text-xs, for sizing the left gutter */
const GUTTER_MIN = 30;
const GUTTER_MAX = 88;
const WIDTH = 560; /* drawing width before the container is measured */

/* A one-point series has no segment to stroke, so it paints nothing. Repeat the
   point and the round cap draws it as a dot. */
const seriesPath = (points: ChartPoint[]) =>
  linePath(points.length === 1 ? [points[0], points[0]] : points);

/**
 * CompareChart — one measure over two periods: the current period in accent,
 * the previous behind it as the comparison. Legend above, y ticks in the left
 * gutter, x tick labels spread along the bottom. On hover, a crosshair, a dot
 * on each line and a readout of BOTH series at that point.
 *
 * No area fill on either line: two stacked gradients would fight, and the
 * subject here is the gap between the periods, not the volume under them.
 *
 * Draws at its measured width (see useChartWidth), so it fills a fluid column
 * instead of scaling its own type up with a fixed viewBox.
 */
export function CompareChart({
  current,
  previous,
  labels,
  yTicks = 4,
  format = String,
  height = 200,
  className,
  style,
}: CompareChartProps) {
  const [ref, w] = useChartWidth(WIDTH);
  const { index, onPointerMove, onPointerLeave } = useChartHover(current.data.length);
  /* the last hovered index, so the readout doesn't change its mind mid-fade */
  const lastIndex = useRef(0);
  useEffect(() => {
    if (index !== null) lastIndex.current = index;
  }, [index]);

  const cls = ["lg-chart", "lg-comparechart", className].filter(Boolean).join(" ");
  /* Both periods share one scale — that is the whole point of the chart. */
  const values = [...current.data, ...(previous?.data ?? [])];
  /* yTicks counts the labels; niceTicks counts the intervals between them. */
  const ticks =
    values.length === 0
      ? []
      : niceTicks(Math.min(...values), Math.max(...values), Math.max(1, Math.floor(yTicks) - 1));
  /* empty, or a series with a NaN in it — nothing to scale against */
  if (ticks.length === 0) {
    return <div ref={ref} className={cls} style={style} />;
  }

  const gutter = Math.min(
    GUTTER_MAX,
    Math.max(GUTTER_MIN, Math.ceil(Math.max(...ticks.map((t) => format(t).length)) * CH_W) + 8),
  );
  const bottom = height - PAD_B - (labels?.length ? AXIS_H : 0);
  const left = gutter;
  const right = Math.max(gutter, w - PAD_R);
  const y = scaleLinear([ticks[0], ticks[ticks.length - 1]], [bottom, PAD_T]);
  /* Each series spans the full width whatever its length: the previous period
     is the same stretch of time, sampled at whatever resolution it arrived in. */
  const project = (data: number[]): ChartPoint[] => {
    const x = scaleLinear([0, data.length - 1], [left, right]);
    return data.map((v, i) => ({ x: x(i), y: y(v) }));
  };
  const curPoints = project(current.data);
  const prevPoints = previous ? project(previous.data) : [];

  const activeIndex = Math.min(index ?? lastIndex.current, current.data.length - 1);
  const active = curPoints[activeIndex] ?? { x: left, y: bottom };
  /* hover reads across by position, not by index — the periods can differ in
     length, and "two thirds through" is the comparison a reader is making */
  const prevIndex =
    current.data.length < 2
      ? 0
      : Math.round((activeIndex / (current.data.length - 1)) * (prevPoints.length - 1));
  const prevActive = prevPoints[prevIndex];

  return (
    <div ref={ref} className={cls} style={style}>
      <div className="lg-comparechart-legend">
        <span className="lg-comparechart-key">
          <span className="lg-comparechart-swatch" />
          {current.label}
        </span>
        {previous && (
          <span className="lg-comparechart-key lg-comparechart-key--prev">
            <span className="lg-comparechart-swatch lg-comparechart-swatch--prev" />
            {previous.label}
          </span>
        )}
      </div>

      {/* .lg-chart again: the tooltip is positioned against the plot, not
          against the box the legend is also in */}
      <div className="lg-chart">
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
              <line className="lg-chart-grid" x1={left} y1={y(t)} x2={right} y2={y(t)} />
              <text
                className="lg-chart-axis"
                x={left - PAD_R}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="central"
              >
                {format(t)}
              </text>
            </g>
          ))}

          {/* previous first: the current period is the subject and draws on top */}
          {prevPoints.length > 0 && (
            <path
              className="lg-comparechart-line lg-comparechart-line--prev"
              d={seriesPath(prevPoints)}
            />
          )}
          <path className="lg-comparechart-line" d={seriesPath(curPoints)} />

          {labels?.map((label, i) => (
            <text
              key={i}
              className="lg-chart-axis"
              x={left + (labels.length < 2 ? 0 : (i / (labels.length - 1)) * (right - left))}
              y={height - PAD_B}
              textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
            >
              {label}
            </text>
          ))}

          {index !== null && (
            <>
              <line className="lg-chart-crosshair" x1={active.x} y1={PAD_T} x2={active.x} y2={bottom} />
              {prevActive && (
                <circle
                  className="lg-comparechart-dot lg-comparechart-dot--prev"
                  cx={prevActive.x}
                  cy={prevActive.y}
                />
              )}
              <circle className="lg-comparechart-dot" cx={active.x} cy={active.y} />
            </>
          )}
        </svg>

        <ChartTooltip
          x={active.x}
          y={active.y}
          label={null}
          value={
            <span className="lg-comparechart-tip-rows">
              <span className="lg-comparechart-tip-row">
                <span className="lg-comparechart-swatch" />
                <span className="lg-comparechart-tip-name">{current.label}</span>
                <span className="lg-comparechart-tip-val">{format(current.data[activeIndex] ?? 0)}</span>
              </span>
              {previous && (
                <span className="lg-comparechart-tip-row">
                  <span className="lg-comparechart-swatch lg-comparechart-swatch--prev" />
                  <span className="lg-comparechart-tip-name">{previous.label}</span>
                  <span className="lg-comparechart-tip-val">
                    {previous.data[prevIndex] === undefined ? "—" : format(previous.data[prevIndex])}
                  </span>
                </span>
              )}
            </span>
          }
          visible={index !== null}
        />
      </div>
    </div>
  );
}
