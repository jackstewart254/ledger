"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx } from "../../internal/cx.js";

export interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /**
   * Element or component to render this tab as instead of `button` — a router's
   * own link, say, so a tab that changes route stays a client-side navigation.
   * Ignored when `disabled` is set: the platform has no disabled anchor, and
   * the native `button` is what the styling and the roving focus key off.
   * Defaults to `button`.
   */
  as?: ElementType;
  /** Destination, passed through when `as` renders something anchor-like. */
  href?: string;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  /**
   * Fires on both pointer and keyboard selection. The event is present only for
   * a click — call `preventDefault()` on it when the tab is an anchor and you
   * are routing yourself.
   */
  onChange?: (value: string, e?: MouseEvent<HTMLElement>) => void;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Tabs — rounded chips, no underline rail: inactive tabs are bare, the active
 * one lifts to text-strong on a --surface-active cell. Arrow keys move
 * selection (automatic activation). Controlled via `value`/`onChange`,
 * uncontrolled via `defaultValue`.
 *
 * Same cell as SegmentedControl, ungrouped. Reach for Tabs to move between
 * views, SegmentedControl to pick a value inside one.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  "aria-label": ariaLabel,
  className,
  style,
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value ?? "");
  const current = value ?? internal;

  const select = (v: string, e?: MouseEvent<HTMLElement>) => {
    if (value === undefined) setInternal(v);
    onChange?.(v, e);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.filter((i) => !i.disabled);
    if (enabled.length === 0) return;
    const idx = Math.max(0, enabled.findIndex((i) => i.value === current));
    let next: number | undefined;
    if (e.key === "ArrowRight") next = (idx + 1) % enabled.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + enabled.length) % enabled.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    const v = enabled[next].value;
    select(v);
    listRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(v)}"]`)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cx("lg-tabs", className)}
      style={style}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const Tab: ElementType = item.disabled ? "button" : (item.as ?? "button");
        return (
          <Tab
            key={item.value}
            {...(Tab === "button"
              ? { type: "button", disabled: item.disabled }
              : { href: item.href })}
            role="tab"
            data-value={item.value}
            aria-selected={item.value === current}
            tabIndex={item.value === current ? 0 : -1}
            className="lg-tab"
            onClick={(e: MouseEvent<HTMLElement>) => select(item.value, e)}
          >
            {item.label}
          </Tab>
        );
      })}
    </div>
  );
}
