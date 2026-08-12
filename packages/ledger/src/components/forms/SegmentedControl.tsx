"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface SegmentOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: Array<SegmentOption | string>;
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * SegmentedControl — exclusive picker in a hairline group; the active segment
 * raises to --surface-raised. Radio semantics (it picks a value, Tabs own the
 * tablist pattern).
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  className,
  style,
}: SegmentedControlProps) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const [internal, setInternal] = useState(defaultValue ?? opts[0]?.value);
  const controlled = value !== undefined;
  const val = controlled ? value : internal;

  const pick = (v: string) => {
    if (!controlled) setInternal(v);
    onChange?.(v);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx("lg-seg", `lg-seg--${size}`, className)}
      style={style}
    >
      {opts.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={val === opt.value}
          className="lg-seg__btn"
          disabled={disabled || opt.disabled}
          onClick={() => pick(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
