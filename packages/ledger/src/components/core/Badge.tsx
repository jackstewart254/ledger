import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type BadgeVariant = "subtle" | "solid" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  /** Leading status dot. */
  dot?: boolean;
}

export function Badge({ tone = "neutral", variant = "subtle", dot = false, className, children, ...rest }: BadgeProps) {
  const classes = ["lg-badge", `lg-badge--${tone}`, `lg-badge--${variant}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {dot && <span className="lg-badge-dot" />}
      {children}
    </span>
  );
}
