import type { CSSProperties } from "react";
import { deltaTone, type MetricPolarity } from "../../internal/delta-tone.js";

export type { MetricPolarity };

export interface MetricDeltaProps {
  value: number;
  /** Appended to the default rendering (ignored when `format` is given). */
  suffix?: string;
  format?: (value: number) => string;
  /** Defaults to higher-is-better — revenue, uptime, runs completed. */
  polarity?: MetricPolarity;
  /**
   * Magnitude below which a delta is flat rather than green or red. Defaults
   * to 0.005 — half a penny, a fifth of the finest percentage step `pct`
   * prints. Raise it if `value` is a fraction rather than percentage points.
   */
  epsilon?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * MetricDelta — a signed change as a tinted badge: good green, bad red, grey at
 * zero. "Zero" means near enough, not exactly: a delta of 0.004 is the residue
 * of summing floats, and painting it red is a confident claim about a
 * direction that is not there. See `epsilon`.
 *
 * No arrow glyph and no "+": the sign is already in the number and the colour
 * already carries the direction, so an arrow is the third copy of one fact.
 *
 * Colour comes from the sign AND the metric's polarity. An `invert` boolean was
 * refused here once, on the grounds that a falling number rendered green
 * misleads — true, but the refusal made every lower-is-better metric (latency,
 * queue depth, error rate) paint its bad news green, and pushed consumers into
 * hand-rolled Badges beside real deltas in the same row. `polarity` says which
 * direction is good instead of asking the caller to flip a colour.
 */
export function MetricDelta({
  value,
  suffix = "%",
  format,
  polarity = "higher-is-better",
  epsilon,
  className,
  style,
}: MetricDeltaProps) {
  const tone = deltaTone(value, polarity, epsilon);
  if (tone === null) return null; // never render "NaN%"
  const cls = ["lg-delta", `lg-delta--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} style={style}>
      {format ? format(value) : `${value}${suffix}`}
    </span>
  );
}
