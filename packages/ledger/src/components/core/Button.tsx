import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../internal/cx.js";
import { Icon, type LucideIcon } from "./Icon.js";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = ink-inverse fill · secondary = surface + hairline · tertiary = ghost · danger = semantic */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional leading icon — a lucide-react component. */
  icon?: LucideIcon;
}

const ICON_SIZE: Record<ButtonSize, number> = { xs: 13, sm: 13, md: 14, lg: 16 };

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cx("lg-btn", `lg-btn--${variant}`, `lg-btn--${size}`, className);
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon as={icon} size={ICON_SIZE[size]} />}
      {children}
    </button>
  );
}
