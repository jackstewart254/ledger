import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon.js";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Accessible name — becomes aria-label and title. */
  label: string;
  /** Persistent pressed look (toolbar toggles). */
  active?: boolean;
}

export function IconButton({ icon, label, active = false, type = "button", className, ...rest }: IconButtonProps) {
  const classes = ["lg-icon-btn", active && "lg-icon-btn--active", className].filter(Boolean).join(" ");
  return (
    <button type={type} aria-label={label} title={label} aria-pressed={active || undefined} className={classes} {...rest}>
      <Icon name={icon} />
    </button>
  );
}
