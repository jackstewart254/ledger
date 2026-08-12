import type { HTMLAttributes } from "react";

export type StatusDotStatus = "good" | "watch" | "risk" | "unknown";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusDotStatus;
  /** Accessible name; defaults to the status word. */
  label?: string;
}

/**
 * StatusDot — the bare dot, for when the thing already has a name beside it.
 * When it doesn't, reach for StatusPill: same four states, but it carries the
 * label itself.
 *
 * No glow ring and no pulse. A halo animating forever on a rail of ten healthy
 * things turns a status readout into a nightclub, and the thing it is attached
 * to is usually reporting "fine". The colour is the whole signal.
 */
export function StatusDot({ status = "unknown", label, className, ...rest }: StatusDotProps) {
  const classes = ["lg-status-dot", `lg-status-dot--${status}`, className].filter(Boolean).join(" ");
  return <span role="img" aria-label={label ?? status} className={classes} {...rest} />;
}
