import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon.js";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = ink-inverse fill · secondary = surface + hairline · tertiary = ghost · danger = semantic */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional leading icon. */
  icon?: IconName;
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
  const classes = ["lg-btn", `lg-btn--${variant}`, `lg-btn--${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size={ICON_SIZE[size]} />}
      {children}
    </button>
  );
}
