import type { CSSProperties } from "react";

export interface MetricDeltaProps {
  value: number;
  /** Appended to the default rendering (ignored when `format` is given). */
  suffix?: string;
  format?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
}

/**
 * MetricDelta — a signed change as a tinted badge: green up, red down, grey at
 * zero.
 *
 * No arrow glyph and no "+": the sign is already in the number and the colour
 * already carries the direction, so an arrow is the third copy of one fact.
 * The colour is derived from the value itself rather than a prop — an `invert`
 * flag meant a falling number could be rendered green, which is exactly the
 * kind of thing nobody notices until it misleads someone.
 */
export function MetricDelta({
  value,
  suffix = "%",
  format,
  className,
  style,
}: MetricDeltaProps) {
  if (!Number.isFinite(value)) return null; // never render "NaN%"
  const tone = value > 0 ? "positive" : value < 0 ? "negative" : "flat";
  const cls = ["lg-delta", `lg-delta--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} style={style}>
      {format ? format(value) : `${value}${suffix}`}
    </span>
  );
}
