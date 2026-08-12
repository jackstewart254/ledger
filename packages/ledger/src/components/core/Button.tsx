import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../internal/cx.js";
import { Icon, type LucideIcon } from "./Icon.js";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = ink-inverse fill · secondary = surface + hairline · tertiary = ghost · danger = semantic */
  variant?: ButtonVariant;
  /** Optional leading icon — a lucide-react component. */
  icon?: LucideIcon;
}

/** Single size on purpose — the kit ships one button height, no `size` prop. */
export function Button({
  variant = "secondary",
  icon,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cx("lg-btn", `lg-btn--${variant}`, className);
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon as={icon} size={14} />}
      {children}
    </button>
  );
}
