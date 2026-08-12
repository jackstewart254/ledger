import type { CSSProperties } from "react";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Progress — hairline track + ink fill bar. `indeterminate` slides a fill
 * segment instead of reporting a value.
 */

export interface ProgressProps {
  /** 0–max. Ignored when indeterminate. */
  value?: number;
  max?: number;
  indeterminate?: boolean;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

export function Progress({
  value = 0,
  max = 100,
  indeterminate = false,
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
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cx("lg-progress", indeterminate && "lg-progress--indeterminate", className)}
      style={style}
    >
      <div
        className="lg-progress-fill"
        style={indeterminate ? undefined : ({ "--lg-progress": `${percent}%` } as CSSProperties)}
      />
    </div>
  );
}
