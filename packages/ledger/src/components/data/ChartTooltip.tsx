"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export interface ChartTooltipProps {
  /** Point coordinates, in the chart's own CSS pixels. */
  x: number;
  y: number;
  label: ReactNode;
  value: ReactNode;
  visible: boolean;
  className?: string;
}

/** Gap between the hovered point and the tip, and the tip and the chart edge. */
const GAP = 8;
const EDGE = 4;

/**
 * ChartTooltip — the readout that follows a hovered point.
 *
 * NOT portaled, unlike feedback/Tooltip: that one is anchored to an element
 * anywhere on the page and has to escape every overflow clip between here and
 * <body>. This one belongs to a chart and is drawn inside the chart's own box,
 * so it can stay in the flow, keep the chart's coordinate space, and be clamped
 * to the chart rather than to the viewport.
 *
 * Stays mounted and toggles opacity — it re-places on every pointer move, so an
 * enter/exit lifecycle would be re-running on a mouse move. Position is set
 * from a measurement (the tip's own size is the only way to know it fits), and
 * only opacity transitions: a moving left/top would lag the cursor.
 */
export function ChartTooltip({ x, y, label, value, visible, className }: ChartTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tip = ref.current;
    const box = tip?.parentElement;
    /* hidden tips keep their last position — nothing to re-measure, and it
       means the fade-out plays where the pointer left it */
    if (!visible || !tip || !box) return;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    /* above the point by default; flipped below when there is no room up top */
    const top = y - h - GAP < EDGE ? y + GAP : y - h - GAP;
    const left = x - w / 2;
    const maxL = Math.max(EDGE, box.clientWidth - w - EDGE);
    const maxT = Math.max(EDGE, box.clientHeight - h - EDGE);
    tip.style.setProperty("--lg-chart-tip-x", `${Math.round(Math.min(Math.max(left, EDGE), maxL))}px`);
    tip.style.setProperty("--lg-chart-tip-y", `${Math.round(Math.min(Math.max(top, EDGE), maxT))}px`);
  }, [x, y, label, value, visible]);

  const cls = ["lg-chart-tip", visible && "lg-chart-tip--visible", className].filter(Boolean).join(" ");
  return (
    <div ref={ref} className={cls} aria-hidden="true">
      {label != null && <span className="lg-chart-tip-label">{label}</span>}
      <span className="lg-chart-tip-value">{value}</span>
    </div>
  );
}
