"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AriaAttributes,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";

export interface MenuItem {
  /** Stable key — only needed when two items share a label. */
  id?: string;
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
  disabled?: boolean;
  /**
   * Element or component to render this item as instead of `button` — a
   * router's own link, say, so an item that navigates stays a client-side
   * route change. Ignored when `disabled` is set: the platform has no disabled
   * anchor, and the native `button` is what the styling and the arrow-key
   * focus walk key off. Defaults to `button`.
   */
  as?: ElementType;
  /** Destination, passed through when `as` renders something anchor-like. */
  href?: string;
  /** Call `preventDefault()` on the event when the item is an anchor and you are routing yourself. */
  onSelect?: (e: MouseEvent<HTMLElement>) => void;
}

export interface MenuProps {
  /** The element that toggles the menu — any clickable node. */
  trigger: ReactNode;
  items: MenuItem[];
  /** Panel alignment against the trigger. */
  align?: "start" | "end";
  className?: string;
  style?: CSSProperties;
}

/**
 * Menu — anchored action menu (kebab/dropdown). Trigger + positioned panel
 * (surface-raised, hairline, the sanctioned shadow). Arrow keys move focus,
 * Enter/Space commit, Escape and click-outside close. Danger item variant for
 * destructive actions.
 *
 * The panel is portaled to <body> and placed against the trigger's rect, like
 * Tooltip: an absolutely-positioned panel is cut off by any ancestor that
 * clips, and this kit's own Card and Table both do. Portaling means the
 * panel is no longer a DOM descendant of the root, so the two checks that ask
 * "is this still inside the menu?" — click-outside and focus-exit — have to
 * ask the panel as well. Escape and the arrow-key walk need no such care:
 * React propagates events across a portal along the tree it rendered, not the
 * DOM.
 */
export function Menu({ trigger, items, align = "start", className, style }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const focusTrigger = () =>
    rootRef.current
      ?.querySelector<HTMLElement>(".lg-menu-trigger button, .lg-menu-trigger a, .lg-menu-trigger [tabindex]")
      ?.focus();

  const close = (refocus = false) => {
    setOpen(false);
    if (refocus) focusTrigger();
  };

  const inside = (node: Node | null) =>
    node != null && (rootRef.current?.contains(node) === true || panelRef.current?.contains(node) === true);

  /* click-outside lives on document while open */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!inside(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  /* Place before paint, then follow the trigger. This is where Menu parts
     company with Tooltip, which simply hides on scroll: a menu holds focus, and
     focusing the first item can itself scroll the page — a menu that closed on
     scroll would shut the instant it opened, and again on every wheel tick
     inside a long panel.

     Flipping upward is the other half of the fix rather than a separate
     feature. Clipping used to bound the damage: the panel stayed in flow near
     its trigger. Fixed to the viewport it can sit entirely off-screen with no
     scroll that reaches it, so a menu with no room below has to go above.
     Horizontal is only ever clamped — a menu nudged sideways is still usable,
     one dropped on top of its own trigger is not. */
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const panel = panelRef.current;
      const anchor = rootRef.current;
      if (!panel || !anchor) return;
      const a = anchor.getBoundingClientRect();
      /* offsetWidth/Height, not the rect: the entrance animation scales the
         panel, and a transformed rect would place it against its shrunk size. */
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      const GAP = 4;
      const M = 8;
      const vw = Math.max(window.innerWidth, document.documentElement.clientWidth);
      const vh = Math.max(window.innerHeight, document.documentElement.clientHeight);
      const up = a.bottom + GAP + h > vh - M && a.top - GAP - h > M;
      let left = align === "end" ? a.right - w : a.left;
      if (vw > 40) left = Math.max(M, Math.min(left, vw - w - M));
      const top = up ? a.top - GAP - h : a.bottom + GAP;
      panel.style.setProperty("--lg-menu-x", `${Math.round(left)}px`);
      panel.style.setProperty("--lg-menu-y", `${Math.round(Math.max(M, top))}px`);
      /* the pop should come from the trigger, so a flipped panel rises */
      panel.style.setProperty("--lg-menu-pop-y", up ? "var(--space-1)" : "calc(-1 * var(--space-1))");
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, align, items.length]);

  /* focus the first item on open */
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("[role='menuitem']:not(:disabled)")?.focus();
  }, [open]);

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const els = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']:not(:disabled)") ?? [],
    );
    if (els.length === 0) return;
    const idx = els.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "ArrowDown"
        ? (idx + 1) % els.length
        : e.key === "ArrowUp"
          ? (idx - 1 + els.length) % els.length
          : e.key === "Home"
            ? 0
            : els.length - 1;
    els[next].focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  /* Escape is handled here, not on document: this runs while the event is still
     below any dialog's document listener, and marking it handled stops that
     dialog closing too. */
  const onRootKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!open || e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    close(true);
  };

  /* Tab out of the menu (or any other focus exit) closes it — an open panel
     the user has walked away from is a trap for the next keypress. */
  const onRootBlur = (e: FocusEvent<HTMLSpanElement>) => {
    if (open && !inside(e.relatedTarget)) setOpen(false);
  };

  const triggerNode = isValidElement<AriaAttributes>(trigger)
    ? cloneElement(trigger, { "aria-haspopup": "menu", "aria-expanded": open })
    : trigger;

  return (
    <span
      ref={rootRef}
      className={cx("lg-menu", className)}
      style={style}
      onKeyDown={onRootKeyDown}
      onBlur={onRootBlur}
    >
      <span
        className="lg-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
      >
        {triggerNode}
      </span>
      {open &&
        createPortal(
          <div ref={panelRef} role="menu" className="lg-menu-panel" onKeyDown={onPanelKeyDown}>
            {items.map((item, i) => {
              const Item: ElementType = item.disabled ? "button" : (item.as ?? "button");
              return (
                <Item
                  key={item.id ?? i}
                  {...(Item === "button"
                    ? { type: "button", disabled: item.disabled }
                    : { href: item.href })}
                  role="menuitem"
                  className={cx("lg-menu-item", item.danger && "lg-menu-item--danger")}
                  onClick={(e: MouseEvent<HTMLElement>) => {
                    item.onSelect?.(e);
                    close(true);
                  }}
                >
                  {item.icon && <Icon as={item.icon} />}
                  {item.label}
                </Item>
              );
            })}
          </div>,
          document.body,
        )}
    </span>
  );
}
