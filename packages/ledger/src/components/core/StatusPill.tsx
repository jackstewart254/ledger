import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export type StatusPillStatus = "good" | "watch" | "risk" | "unknown";

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusPillStatus;
  /** Names the pillar (e.g. "Growth", "Brand safety"). */
  label?: ReactNode;
  /** Optional tabular numeric value beside the label. */
  value?: ReactNode;
}

/** Single size on purpose — the kit ships one pill height, no `size` prop. */
export function StatusPill({
  status = "unknown",
  label,
  value,
  className,
  ...rest
}: StatusPillProps) {
  const classes = cx("lg-status-pill", `lg-status-pill--${status}`, className);
  return (
    <span className={classes} {...rest}>
      <span className="lg-status-pill-dot" />
      {label != null && <span>{label}</span>}
      {value != null && <span className="lg-status-pill-value">{value}</span>}
    </span>
  );
}
