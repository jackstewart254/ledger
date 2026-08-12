"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";

/**
 * Rail — icon-only 56px vertical rail. Items are glyphs; the label lives in a
 * flyout chip that pops from the side on hover/focus (translucent surface +
 * backdrop blur, the sanctioned shadow). Never inline labels, never letter
 * tiles. Active item reads as a surface tint, not a color.
 */

export interface RailProps {
  children: ReactNode;
  /** Pushed-to-bottom cluster (theme toggle, sign out). */
  footer?: ReactNode;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

export function Rail({ children, footer, "aria-label": ariaLabel = "Primary", className, style }: RailProps) {
  return (
    <nav aria-label={ariaLabel} className={cx("lg-rail", className)} style={style}>
      {children}
      {footer && <div className="lg-rail-footer">{footer}</div>}
    </nav>
  );
}

export interface RailItemProps {
  icon: LucideIcon;
  /** Flyout chip text — the item's only label. */
  label: string;
  active?: boolean;
  /** Renders an <a> when set, a <button> otherwise. */
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function RailItem({ icon, label, active = false, href, onClick, className, style }: RailItemProps) {
  const inner = (
    <>
      <Icon as={icon} size={18} />
      <span className="lg-rail-flyout" aria-hidden="true">
        {label}
      </span>
    </>
  );
  if (href !== undefined) {
    return (
      <a
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cx("lg-rail-item", className)}
        style={style}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      className={cx("lg-rail-item", className)}
      style={style}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}
