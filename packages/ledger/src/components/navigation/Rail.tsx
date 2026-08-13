"use client";

import type { AnchorHTMLAttributes, CSSProperties, ElementType, MouseEvent, ReactNode } from "react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { Tooltip } from "../feedback/Tooltip.js";
import { cx } from "../../internal/cx.js";

export interface RailProps {
  children: ReactNode;
  /** Pushed-to-bottom cluster (theme toggle, sign out). */
  footer?: ReactNode;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Rail — icon-only 56px vertical rail. Items are glyphs; the label lives in a
 * flyout chip that pops from the side on hover/focus (translucent surface +
 * backdrop blur, the sanctioned shadow). Never inline labels, never letter
 * tiles. Active item reads as a surface tint, not a color.
 *
 * The items scroll on their own when a route list outgrows the viewport; the
 * footer sits outside that region, so a theme toggle or sign out stays put
 * instead of scrolling away with them.
 */
export function Rail({ children, footer, "aria-label": ariaLabel = "Primary", className, style }: RailProps) {
  return (
    <nav aria-label={ariaLabel} className={cx("lg-rail", className)} style={style}>
      <div className="lg-rail-items">{children}</div>
      {footer && <div className="lg-rail-footer">{footer}</div>}
    </nav>
  );
}

export interface RailItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> {
  icon: LucideIcon;
  /** Flyout chip text — the item's only label. */
  label: string;
  active?: boolean;
  /**
   * Render as another element — a router's Link, in practice:
   * `<RailItem as={Link} href="/money" />`. Unrecognised props forward to it,
   * so the router's own client-side navigation and prefetch apply and the rail
   * stops reloading the document on every click. The kit imports no router;
   * you pass yours. Defaults to `a` when `href` is set, `button` otherwise.
   */
  as?: ElementType;
  /** Renders an <a> when set, a <button> otherwise. */
  href?: string;
  /** Takes the event — a plain `<a>` item needs `e.preventDefault()` to be
   *  navigated in JS rather than by the browser. */
  onClick?: (e: MouseEvent) => void;
}

/**
 * RailItem — one glyph in the Rail. `label` never renders inline: it is the
 * item's accessible name and the text of the flyout chip, so the rail stays
 * one icon wide whatever the labels say.
 *
 * The chip is the kit's Tooltip, portaled to <body> and positioned fixed. It
 * used to be an absolutely positioned span inside the item, which cannot
 * survive the items region scrolling: a scroll container clips both axes (CSS
 * forces overflow-x to `auto` once overflow-y is), so the chip was cut off at
 * the 56px rail edge and dragged a horizontal scrollbar in with it.
 *
 * Renders an anchor when `href` is set and a button otherwise — a destination
 * should be a real link, openable in a new tab, and an action should not be.
 * `active` follows that split too: aria-current="page" on the link,
 * aria-pressed on the button.
 */
export function RailItem({ icon, label, active = false, as, href, className, ...rest }: RailItemProps) {
  /* `as` is only ever a link component, so it reads as a destination the same
     way `href` does. */
  /* ponytail: props are typed as an anchor's, so a router prop outside that set
     (Next's `prefetch`/`replace`) forwards at runtime but won't typecheck —
     make RailItemProps generic over `as` if anyone actually needs to pass one. */
  const isLink = href !== undefined || as !== undefined;
  const As: ElementType = as ?? (isLink ? "a" : "button");
  return (
    <Tooltip label={label} side="right">
      <As
        href={href}
        type={isLink ? undefined : "button"}
        aria-label={label}
        aria-current={isLink && active ? "page" : undefined}
        aria-pressed={!isLink && active ? true : undefined}
        className={cx("lg-rail-item", className)}
        {...rest}
      >
        <Icon as={icon} />
      </As>
    </Tooltip>
  );
}
