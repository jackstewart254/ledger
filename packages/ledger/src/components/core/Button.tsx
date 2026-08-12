import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../internal/cx.js";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = accent fill · secondary = surface + hairline · tertiary = ghost text · danger = the semantic red */
  variant?: ButtonVariant;
}

/**
 * Single size on purpose — the kit ships one button height, no `size` prop.
 * Text only: a control is either a word or a glyph, never both. Icon + label
 * gives one action two competing readings and two widths for the same string.
 * Reach for IconButton when the glyph is the whole message.
 */
export function Button({
  variant = "secondary",
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cx("lg-btn", `lg-btn--${variant}`, className);
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
