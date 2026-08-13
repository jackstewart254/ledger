"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export interface FilterToggleProps
  extends Omit<ComponentProps<"button">, "onChange" | "value" | "ref"> {
  /** Controlled active state. */
  active?: boolean;
  defaultActive?: boolean;
  onChange?: (active: boolean) => void;
  count?: number;
  /** Called when the chip is toggled off. */
  onClear?: () => void;
  children: ReactNode;
}

/**
 * FilterToggle — toggleable chip. Active is carried by the fill and border shift
 * alone: the chip IS the toggle, so an × inside it is a second control for the
 * thing the whole chip already does, and it makes the active chip a different
 * width from the inactive one.
 */
export function FilterToggle({
  active,
  defaultActive = false,
  onChange,
  count,
  onClear,
  children,
  className,
  onClick,
  ...rest
}: FilterToggleProps) {
  const [internal, setInternal] = useState(defaultActive);
  const controlled = active !== undefined;
  const on = controlled ? active : internal;

  const toggle = () => {
    const next = !on;
    if (!controlled) setInternal(next);
    onChange?.(next);
    if (!next) onClear?.();
  };

  return (
    <button
      {...rest}
      type="button"
      aria-pressed={on}
      className={cx("lg-filter-toggle", className)}
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
    >
      <span className="lg-filter-toggle__label">{children}</span>
      {count != null && <span className="lg-filter-toggle__count">{count}</span>}
    </button>
  );
}
