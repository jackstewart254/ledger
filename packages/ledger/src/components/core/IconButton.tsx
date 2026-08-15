import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type LucideIcon } from "./Icon.js";
import { Tooltip, type TooltipSide } from "../feedback/Tooltip.js";

export type IconButtonVariant = "control" | "primary" | "bare";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** Accessible name — becomes aria-label and, by default, the tooltip. */
  label: string;
  /** Persistent pressed look (toolbar toggles). */
  active?: boolean;
  /**
   * `control` (default) is the 36px box that lines up with Button. `primary` is
   * that same box carrying Button's accent fill, for the one glyph in a cluster
   * that *is* the action — a send control at the end of an input. `bare` drops
   * the box entirely — for a glyph annotating a heading or a row, where a
   * control-sized target around a 17px icon is all chrome and no message. Still
   * a button, so it keeps focus and the tooltip.
   */
  variant?: IconButtonVariant;
  /** Override the tip text, or `false` to suppress it (menu triggers, toolbars
   *  that already name themselves). Defaults to `label`. */
  tooltip?: ReactNode | false;
  tooltipSide?: TooltipSide;
}

/**
 * IconButton — the icon-only control. A glyph alone is only legible if it says
 * what it is on hover, so the tooltip is built in rather than left to every
 * caller to wrap: `title` was the browser's own chrome and could not be styled,
 * shown on focus, or dismissed per WCAG 1.4.13.
 */
export function IconButton({
  icon,
  label,
  active = false,
  tooltip,
  tooltipSide = "top",
  variant = "control",
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const classes = [
    "lg-icon-btn",
    variant !== "control" && `lg-icon-btn--${variant}`,
    active && "lg-icon-btn--active",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const button = (
    <button type={type} aria-label={label} aria-pressed={active || undefined} className={classes} {...rest}>
      <Icon as={icon} />
    </button>
  );
  const tip = tooltip === undefined ? label : tooltip;
  if (tip === false) return button;
  return (
    <Tooltip label={tip} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
