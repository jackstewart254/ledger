"use client";

import { useState, type CSSProperties } from "react";
import { cx } from "../../internal/cx.js";

/** The selected span — not the scale it sits on (that is `min`/`max`). */
export interface RangeValue {
  min: number;
  max: number;
}

export interface RangeSliderProps {
  /** Controlled span. */
  value?: RangeValue;
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  /** Lower bound of the scale. */
  min?: number;
  /** Upper bound of the scale. */
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Accessible name for the lower thumb. */
  minLabel?: string;
  /** Accessible name for the upper thumb. */
  maxLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

const pctOf = (value: number, min: number, max: number): number =>
  max === min ? 0 : ((value - min) / (max - min)) * 100;

/**
 * RangeSlider — a genuine two-ended range: `{min, max}` in, `{min, max}` out.
 * Two native ranges share one track, so each end is a real tab stop with the
 * arrow/Home/End keys the platform already gives it, and no dependency buys a
 * thumb the browser ships.
 *
 * The thumbs cannot cross: each end clamps against the other on change, and
 * each carries the aria-valuemin/max of the span it may actually reach rather
 * than the scale's — the reachable range is what a screen reader needs.
 *
 * Only the filled span behind the inputs paints a rail; the inputs' own tracks
 * are blanked in CSS, since two stacked native tracks would draw two.
 */
export function RangeSlider({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  minLabel = "Minimum",
  maxLabel = "Maximum",
  className,
  style,
}: RangeSliderProps) {
  const [internal, setInternal] = useState<RangeValue>(defaultValue ?? { min, max });
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const lo = clamp(current.min, min, max);
  const hi = clamp(current.max, lo, max);

  const emit = (next: RangeValue) => {
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  /* Coincident thumbs: only the one painted on top takes the pointer. Past the
     midpoint it is the LOWER thumb that still has room to move away from the
     end it is stacked against, so lift that one there. Keyboard is unaffected —
     each input is its own tab stop whatever the paint order. */
  const loOnTop = lo > (min + max) / 2;

  return (
    <div
      className={cx("lg-range-slider", className)}
      data-disabled={disabled || undefined}
      style={
        {
          "--lg-range-lo": `${pctOf(lo, min, max)}%`,
          "--lg-range-hi": `${pctOf(hi, min, max)}%`,
          ...style,
        } as CSSProperties
      }
    >
      <span className="lg-range-slider__track" />
      <input
        type="range"
        className="lg-slider"
        min={min}
        max={max}
        step={step}
        value={lo}
        disabled={disabled}
        aria-label={minLabel}
        aria-valuenow={lo}
        aria-valuemin={min}
        aria-valuemax={hi}
        style={loOnTop ? { zIndex: 1 } : undefined}
        onChange={(e) => emit({ min: Math.min(Number(e.target.value), hi), max: hi })}
      />
      <input
        type="range"
        className="lg-slider"
        min={min}
        max={max}
        step={step}
        value={hi}
        disabled={disabled}
        aria-label={maxLabel}
        aria-valuenow={hi}
        aria-valuemin={lo}
        aria-valuemax={max}
        onChange={(e) => emit({ min: lo, max: Math.max(Number(e.target.value), lo) })}
      />
    </div>
  );
}

/* Two controls, not one: FormField names this with role="group" rather than a
   <label htmlFor> that can never resolve to a div. */
RangeSlider.__lgGroup = true as const;
