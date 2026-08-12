"use client";

import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from "react";

/**
 * chart-internals — the shared maths + hover behaviour behind every chart in
 * the kit. Hand-written on purpose: a charting library is a dependency, a
 * bundle and a theme surface we would then have to fight, and a line, an area
 * and a bar are four functions of arithmetic.
 *
 * Nothing here renders. Components own their own markup and CSS; this file
 * owns scales, ticks, path strings and the pointer→index mapping so two charts
 * can't drift apart on any of them.
 */

export interface ChartPoint {
  x: number;
  y: number;
}

/** SVG paths carry a coordinate per point — two decimals is below a hairline. */
const r = (n: number) => Math.round(n * 100) / 100;

/**
 * scaleLinear — domain value → range position. Same shape as d3's, minus d3.
 * A zero-width domain (a flat series) has nothing to divide by: it pins to the
 * middle of the range, which draws the flat line where a reader expects it.
 */
export function scaleLinear(domain: [number, number], range: [number, number]): (v: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => (r0 + r1) / 2;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

/**
 * niceTicks — human tick values (…1, 2, 5, 10…) COVERING the domain: the first
 * tick sits at or below min, the last at or above max. Charts take their y
 * domain from the tick extent, so the top and bottom grid lines land exactly on
 * the plot edges instead of floating an arbitrary distance inside them.
 */
export function niceTicks(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  const n = Math.max(1, Math.floor(count));
  /* a flat series still deserves a scale — fall back to the magnitude of the
     value itself, then to 1 for a flat zero */
  const span = max - min || Math.abs(max) || 1;
  const rough = span / n;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm > 1 ? 2 : 1) * mag;
  const floor = Math.floor(min / step) * step;
  const ceil = Math.ceil(max / step) * step;
  /* a flat series landing exactly on a tick would collapse to one line, and the
     chart would draw it along the floor — bracket it so it sits mid-plot */
  const flat = floor === ceil;
  const lo = flat ? floor - step : floor;
  const hi = flat ? ceil + step : ceil;
  /* step can be fractional, and 0.1 + 0.2 is not 0.3 — round each tick to the
     step's own precision so the labels read as the numbers they are */
  const dp = Math.max(0, -Math.floor(Math.log10(step)));
  const steps = Math.round((hi - lo) / step);
  return Array.from({ length: steps + 1 }, (_, i) => Number((lo + i * step).toFixed(dp)));
}

/** linePath — "M x y L x y …". Empty for an empty series. */
export function linePath(points: ChartPoint[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${r(p.x)} ${r(p.y)}`).join(" ");
}

/** areaPath — the line, dropped to baselineY at both ends and closed. */
export function areaPath(points: ChartPoint[], baselineY: number): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath(points)} L${r(last.x)} ${r(baselineY)} L${r(first.x)} ${r(baselineY)} Z`;
}

/**
 * useChartHover — nearest data index under the pointer, measured against the
 * svg's OWN rendered width so it survives any scaling between the viewBox and
 * the box on screen.
 *
 * `scale` picks the mapping. "point" (default) is for evenly spaced samples with
 * both ends inclusive — a line's first and last readings sit ON the edges.
 * "band" is for bars, which occupy a slice rather than a position: under point
 * mapping the pointer over a bar's left half lights the bar before it, off by
 * up to half a bar.
 */
export function useChartHover(
  count: number,
  scale: "point" | "band" = "point",
): {
  index: number | null;
  onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerLeave: () => void;
} {
  const [index, setIndex] = useState<number | null>(null);
  const onPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (count < 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width === 0) return;
      const t = (e.clientX - rect.left) / rect.width;
      const i = scale === "band" ? Math.floor(t * count) : Math.round(t * (count - 1));
      setIndex(Math.min(count - 1, Math.max(0, i)));
    },
    [count, scale],
  );
  const onPointerLeave = useCallback(() => setIndex(null), []);
  return { index, onPointerMove, onPointerLeave };
}

/**
 * useChartWidth — the wrapper's measured width in CSS pixels, for drawing 1:1.
 *
 * Charts here don't scale a fixed viewBox up: the type inside would scale with
 * it (a 13px axis label rendering at 17px in a wide column), and every hover
 * coordinate would need converting back out of viewBox units before an
 * absolutely-positioned tooltip could use it. Measuring instead keeps chart
 * coordinates and CSS pixels the same number.
 */
export function useChartWidth(fallback: number): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || fallback);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, width];
}
