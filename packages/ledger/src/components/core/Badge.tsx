import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type BadgeVariant = "subtle" | "solid" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  /** Leading status dot. */
  dot?: boolean;
}

/**
 * Badge — a label on a thing: "Pending", "prod", "Over budget". It says what
 * something IS. StatusPill says how something is DOING, and CountBadge is a
 * number on its own.
 *
 * `tone` is a claim about the data, not a colour picker: `tone="danger"` says
 * the thing is bad, not that you wanted it red. That is also why status is
 * StatusPill's job — mapping domain states onto tones badge by badge ends with
 * two pages disagreeing about whether "paused" is warning or neutral.
 */
export function Badge({ tone = "neutral", variant = "subtle", dot = false, className, children, ...rest }: BadgeProps) {
  const classes = ["lg-badge", `lg-badge--${tone}`, `lg-badge--${variant}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {dot && <span className="lg-badge-dot" />}
      {children}
    </span>
  );
}
