import type { CSSProperties } from "react";
import { cx } from "../../internal/cx.js";

export interface ProgressProps {
  /** 0–max. */
  value?: number;
  max?: number;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Progress — hairline track + accent fill, 0 to max.
 *
 * Determinate only. An indeterminate variant was tried and cut: a chunk
 * sliding back and forth reports nothing, and Spinner already covers "working,
 * duration unknown". If you can't measure it, don't draw a bar.
 */
export function Progress({
  value = 0,
  max = 100,
  "aria-label": ariaLabel,
  className,
  style,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const percent = max > 0 ? (clamped / max) * 100 : 0;
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className={cx("lg-progress", className)}
      style={style}
    >
      <div
        className="lg-progress-fill"
        style={{ "--lg-progress": `${percent}%` } as CSSProperties}
      />
    </div>
  );
}
