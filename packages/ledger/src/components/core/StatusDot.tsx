import type { HTMLAttributes } from "react";

export type StatusDotStatus = "good" | "watch" | "risk" | "unknown";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusDotStatus;
  /** Accessible name; defaults to the status word. */
  label?: string;
}

export function StatusDot({ status = "unknown", label, className, ...rest }: StatusDotProps) {
  const classes = ["lg-status-dot", `lg-status-dot--${status}`, className].filter(Boolean).join(" ");
  return <span role="img" aria-label={label ?? status} className={classes} {...rest} />;
}
