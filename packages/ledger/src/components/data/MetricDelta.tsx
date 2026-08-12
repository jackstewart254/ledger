import type { CSSProperties } from "react";

/** Which way is good. Queue depth and latency rise when things get worse. */
export type MetricPolarity = "higher-is-better" | "lower-is-better";

export interface MetricDeltaProps {
  value: number;
  /** Appended to the default rendering (ignored when `format` is given). */
  suffix?: string;
  format?: (value: number) => string;
  /** Defaults to higher-is-better — revenue, uptime, runs completed. */
  polarity?: MetricPolarity;
  className?: string;
  style?: CSSProperties;
}

/**
 * MetricDelta — a signed change as a tinted badge: good green, bad red, grey at
 * zero.
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
  className,
  style,
}: MetricDeltaProps) {
  if (!Number.isFinite(value)) return null; // never render "NaN%"
  const good = polarity === "lower-is-better" ? value < 0 : value > 0;
  const tone = value === 0 ? "flat" : good ? "positive" : "negative";
  const cls = ["lg-delta", `lg-delta--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} style={style}>
      {format ? format(value) : `${value}${suffix}`}
    </span>
  );
}
