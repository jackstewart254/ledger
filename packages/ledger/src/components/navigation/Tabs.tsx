"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Tabs — hairline bottom-border group; the active tab lifts to text-strong and
 * carries an ink underline indicator. Arrow keys move selection (automatic
 * activation). Controlled via `value`/`onChange`, uncontrolled via
 * `defaultValue`.
 */

export interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

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

  const select = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
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
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          data-value={item.value}
          aria-selected={item.value === current}
          disabled={item.disabled}
          tabIndex={item.value === current ? 0 : -1}
          className="lg-tab"
          onClick={() => select(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
