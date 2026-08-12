import type { CSSProperties, ReactNode } from "react";
import { Icon, type LucideIcon } from "../core/Icon.js";

export interface KpiTileProps {
  label: ReactNode;
  value: ReactNode;
  /** MetricDelta slot — sits on the label's line. */
  delta?: ReactNode;
  /** Optional glyph in a hairline square, left of the label and figure. */
  icon?: LucideIcon;
  className?: string;
  style?: CSSProperties;
}

/**
 * KpiTile — the core dashboard stat: label and delta on the top row, the figure
 * beneath.
 *
 * No trend slot. A sparkline under the figure was tried and it read as
 * decoration: too small to take a reading off, and it turned a tile that
 * answers one question into a tile with a squiggle on it. A trend that is worth
 * showing is worth a chart big enough to read; facts worth knowing go in a
 * KeyValue list.
 */
export function KpiTile({ label, value, delta, icon, className, style }: KpiTileProps) {
  const cls = ["lg-kpi", icon && "lg-kpi--with-icon", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      {icon && (
        <span className="lg-kpi-icon">
          <Icon as={icon} />
        </span>
      )}
      <div className="lg-kpi-main">
        <div className="lg-kpi-head">
          <span className="lg-kpi-label">{label}</span>
          {delta}
        </div>
        <div className="lg-kpi-value">{value}</div>
      </div>
    </div>
  );
}
