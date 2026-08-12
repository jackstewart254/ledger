import type { CSSProperties, ReactNode } from "react";

export interface KpiTileProps {
  label: ReactNode;
  value: ReactNode;
  /** MetricDelta slot — a badge in the tile's top-right corner. */
  delta?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * KpiTile — the core dashboard stat: label and delta badge on the top row,
 * the figure beneath them.
 */
export function KpiTile({ label, value, delta, className, style }: KpiTileProps) {
  const cls = ["lg-kpi", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      <div className="lg-kpi-head">
        <span className="lg-kpi-label">{label}</span>
        {delta}
      </div>
      <div className="lg-kpi-value">{value}</div>
    </div>
  );
}
