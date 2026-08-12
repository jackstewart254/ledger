"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type AriaAttributes,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";

/**
 * Menu — anchored action menu (kebab/dropdown). Trigger + positioned panel
 * (surface-raised, hairline, the sanctioned shadow). Arrow keys move focus,
 * Enter/Space commit, Escape and click-outside close. Danger item variant for
 * destructive actions.
 */

export interface MenuItem {
  /** Stable key — only needed when two items share a label. */
  id?: string;
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
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

  /* click-outside lives on document while open */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

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
    if (open && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
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
      {open && (
        <div
          ref={panelRef}
          role="menu"
          className={cx("lg-menu-panel", align === "end" && "lg-menu-panel--end")}
          onKeyDown={onPanelKeyDown}
        >
          {items.map((item, i) => (
            <button
              key={item.id ?? i}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cx("lg-menu-item", item.danger && "lg-menu-item--danger")}
              onClick={() => {
                item.onSelect?.();
                close(true);
              }}
            >
              {item.icon && <Icon as={item.icon} size={15} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
