import type { HTMLAttributes, ReactNode } from "react";

export type StatusPillStatus = "good" | "watch" | "risk" | "unknown";

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusPillStatus;
  /** Names the pillar (e.g. "Growth", "Brand safety"). */
  label?: ReactNode;
  /** Optional tabular numeric value beside the label. */
  value?: ReactNode;
  size?: "sm" | "md";
}

export function StatusPill({
  status = "unknown",
  label,
  value,
  size = "md",
  className,
  ...rest
}: StatusPillProps) {
  const classes = ["lg-status-pill", `lg-status-pill--${status}`, `lg-status-pill--${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} {...rest}>
      <span className="lg-status-pill-dot" />
      {label != null && <span>{label}</span>}
      {value != null && <span className="lg-status-pill-value">{value}</span>}
    </span>
  );
}
