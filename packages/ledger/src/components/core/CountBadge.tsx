import type { HTMLAttributes } from "react";

export type CountBadgeTone = "neutral" | "accent" | "danger";

export interface CountBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
  /** Values above this render as "max+". Defaults to 99. */
  max?: number;
  tone?: CountBadgeTone;
}

export function CountBadge({ count, max = 99, tone = "neutral", className, ...rest }: CountBadgeProps) {
  const classes = ["lg-count-badge", `lg-count-badge--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {count > max ? `${max}+` : count}
    </span>
  );
}
