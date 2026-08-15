"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx.js";

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
  disabled?: boolean;
  /**
   * Fill the container and split the segments evenly across it. Natural width
   * is still the default — a picker stretched across a wide card puts metres
   * between two words that are meant to be compared.
   */
  fullWidth?: boolean;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * SegmentedControl — exclusive picker in a hairline group; the active segment
 * raises to --surface-raised. Radio semantics (it picks a value, Tabs own the
 * tablist pattern): one tab stop, arrow keys move the selection.
 *
 * Single size on purpose — the kit ships one control size, no `size` prop.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  disabled = false,
  fullWidth = false,
  "aria-label": ariaLabel,
  className,
  style,
}: SegmentedControlProps) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const groupRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue ?? opts[0]?.value);
  const controlled = value !== undefined;
  const val = controlled ? value : internal;

  const pick = (v: string) => {
    if (!controlled) setInternal(v);
    onChange?.(v);
  };

  // same keyboard contract as Tabs: one tab stop, arrows select (automatic activation)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const enabled = opts.filter((o) => !o.disabled);
    if (enabled.length === 0) return;
    const idx = Math.max(
      0,
      enabled.findIndex((o) => o.value === val),
    );
    let next: number | undefined;
    if (e.key === "ArrowRight") next = (idx + 1) % enabled.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + enabled.length) % enabled.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    const v = enabled[next].value;
    pick(v);
    groupRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(v)}"]`)?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx("lg-seg", fullWidth && "lg-seg--full", className)}
      style={style}
      onKeyDown={onKeyDown}
    >
      {opts.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          data-value={opt.value}
          aria-checked={val === opt.value}
          tabIndex={val === opt.value ? 0 : -1}
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

/* Several controls, not one: FormField names this with role="group" rather than
   a <label htmlFor> that can never resolve to a div. */
SegmentedControl.__lgGroup = true as const;
