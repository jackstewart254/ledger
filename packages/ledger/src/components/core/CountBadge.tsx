import type { HTMLAttributes } from "react";

export type CountBadgeTone = "neutral" | "accent" | "danger";

export interface CountBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
  /** Values above this render as "max+". Defaults to 99. */
  max?: number;
  tone?: CountBadgeTone;
}

/**
 * CountBadge — a number and nothing else: nav counts, tab counts, queue depth
 * in a cell. Anything with a word in it is a Badge.
 *
 * Mono and tabular (--num-features), because it usually sits inside something
 * else and a proportional count shoves that thing about as the digits change.
 * `max` rolls over to "99+" for the same reason: an unbounded count is an
 * unbounded width.
 */
export function CountBadge({ count, max = 99, tone = "neutral", className, ...rest }: CountBadgeProps) {
  const classes = ["lg-count-badge", `lg-count-badge--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {count > max ? `${max}+` : count}
    </span>
  );
}
