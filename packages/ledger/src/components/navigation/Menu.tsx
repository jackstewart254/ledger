"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "../core/Icon.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Menu — anchored action menu (kebab/dropdown). Trigger + positioned panel
 * (surface-raised, hairline, the sanctioned shadow). Arrow keys move focus,
 * Enter/Space commit, Escape and click-outside close. Danger item variant for
 * destructive actions.
 */

export interface MenuItem {
  label: string;
  icon?: IconName;
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

  /* click-outside + Escape live on document while open */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <span ref={rootRef} className={cx("lg-menu", className)} style={style}>
      <span
        className="lg-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
      >
        {trigger}
      </span>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          className={cx("lg-menu-panel", align === "end" && "lg-menu-panel--end")}
          onKeyDown={onPanelKeyDown}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cx("lg-menu-item", item.danger && "lg-menu-item--danger")}
              onClick={() => {
                item.onSelect?.();
                close(true);
              }}
            >
              {item.icon && <Icon name={item.icon} size={15} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
