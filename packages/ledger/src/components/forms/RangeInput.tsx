"use client";

import { useState, type ComponentProps, type CSSProperties } from "react";
import { cx } from "../../internal/cx.js";

export type RangeInputProps = Omit<ComponentProps<"input">, "type" | "size" | "ref">;

const pctOf = (value: number, min: number, max: number): number =>
  max === min ? 0 : ((value - min) / (max - min)) * 100;

const num = (v: unknown, fallback: number): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * RangeInput — a native range with a filled track: ink up to the thumb, faint
 * after it, so the value reads at a glance instead of being inferred from the
 * thumb's position against nothing.
 *
 * Deliberately NOT wrapped in the `.lg-control` frame. A pill frame is the
 * shape for something you type into; around a slider it reads as a text field
 * someone dropped a dot into, and it forces a second rail inside the first.
 * The fill percentage rides a custom property because no browser exposes the
 * filled portion of a native range to CSS.
 */
export function RangeInput({
  className,
  style,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onChange,
  ...rest
}: RangeInputProps) {
  const lo = num(min, 0);
  const hi = num(max, 100);
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(() => num(defaultValue ?? value, lo));
  const current = controlled ? num(value, lo) : internal;

  return (
    <input
      {...rest}
      type="range"
      min={min}
      max={max}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        if (!controlled) setInternal(num(e.target.value, lo));
        onChange?.(e);
      }}
      className={cx("lg-range", className)}
      style={{ "--lg-range-pct": `${pctOf(current, lo, hi)}%`, ...style } as CSSProperties}
    />
  );
}
