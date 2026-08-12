import type { CSSProperties } from "react";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Spinner — minimal stroke arc on currentColor; inherits the text color of
 * its context. Decorative unless a `label` is given.
 */

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Accessible status label; omit for a purely decorative spinner. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function Spinner({ size = "md", label, className, style }: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cx("lg-spinner", `lg-spinner--${size}`, className)}
      style={style}
    >
      <svg viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="30 70"
        />
      </svg>
    </span>
  );
}
