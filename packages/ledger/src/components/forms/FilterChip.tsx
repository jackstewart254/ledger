"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Icon } from "../core/Icon.js";
import { cx } from "./cx.js";

export interface FilterChipProps extends Omit<ComponentProps<"button">, "onChange" | "value"> {
  /** Controlled active state. */
  active?: boolean;
  defaultActive?: boolean;
  onChange?: (active: boolean) => void;
  count?: number;
  /** Called when the chip is toggled off (its × affordance). */
  onClear?: () => void;
  children: ReactNode;
}

/**
 * FilterChip — toggleable chip. Active shows the subtle accent fill, a border
 * shift and an × — clicking again clears it.
 */
export function FilterChip({
  active,
  defaultActive = false,
  onChange,
  count,
  onClear,
  children,
  className,
  ...rest
}: FilterChipProps) {
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
      type="button"
      aria-pressed={on}
      className={cx("lg-chip", className)}
      onClick={toggle}
      {...rest}
    >
      <span className="lg-chip__label">{children}</span>
      {count != null && <span className="lg-chip__count">{count}</span>}
      {on && <Icon name="x" size={12} className="lg-chip__clear" />}
    </button>
  );
}
