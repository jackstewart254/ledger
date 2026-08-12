import type { CSSProperties } from "react";
import { Icon } from "../core/Icon.js";

export interface MetricDeltaProps {
  value: number;
  /** Appended to the default rendering (ignored when `format` is given). */
  suffix?: string;
  format?: (value: number) => string;
  /** Down is good (costs, latency) — flips the colour mapping, not the arrow. */
  invert?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * MetricDelta — signed change in tabular figures: up/down arrow, positive
 * sage / negative red (semantic --success-text / --danger-text, the component
 * aliases of --positive / --negative). Flat at zero, no arrow.
 */
export function MetricDelta({
  value,
  suffix = "%",
  format,
  invert = false,
  className,
  style,
}: MetricDeltaProps) {
  if (!Number.isFinite(value)) return null; // never render "NaN%"
  const up = value > 0;
  const down = value < 0;
  const good = invert ? down : up;
  const tone = !up && !down ? "flat" : good ? "positive" : "negative";
  const cls = ["lg-delta", `lg-delta--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} style={style}>
      {(up || down) && <Icon name={up ? "arrow-up" : "arrow-down"} size={11} />}
      {format ? format(value) : `${up ? "+" : ""}${value}${suffix}`}
    </span>
  );
}
