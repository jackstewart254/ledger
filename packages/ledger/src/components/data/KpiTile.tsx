import type { CSSProperties, ReactNode } from "react";

export interface KpiTileProps {
  label: ReactNode;
  value: ReactNode;
  /** MetricDelta slot — sits top-right beside the label. */
  delta?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * KpiTile — the core dashboard stat unit: muted label, big tabular value,
 * optional MetricDelta slot. Hairline surface, no shadow.
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
