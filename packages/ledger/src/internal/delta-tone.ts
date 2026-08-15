/** Which way is good. Queue depth and latency rise when things get worse. */
export type MetricPolarity = "higher-is-better" | "lower-is-better";

export type DeltaTone = "flat" | "positive" | "negative";

/**
 * Below this, a delta is flat — no green, no red.
 *
 * `value` arrives in one of three shapes across real call sites, and 0.005 is
 * under the smallest change any of them can actually express: percentage
 * POINTS by default (`suffix` is "%", and `pct` renders one decimal, so 0.1pp
 * is the finest step a reader ever sees), pounds under `format` (half a penny,
 * so "snapped to flat" and "prints as £0.00" agree), or a count (integers —
 * nothing real sits below 1). It is also orders of magnitude above the residue
 * of summing money-sized doubles, which is what puts 0.004 on screen in red in
 * the first place.
 *
 * The one shape it gets wrong is a caller passing a fraction (0.08 meaning
 * 8%), where 0.005 would swallow half a point. That is not this component's
 * shape — the default suffix would render it "0.08%" — but it is why `epsilon`
 * is a prop: the unit lives with the caller, not here.
 */
const DEFAULT_EPSILON = 0.005;

/**
 * The colour verdict for a delta, or `null` when there is no honest one to
 * make. Split out of MetricDelta so `scripts/metric-delta-check.mjs` can run
 * it — a branch this quiet is one that rots unnoticed.
 */
export function deltaTone(
  value: number,
  polarity: MetricPolarity = "higher-is-better",
  epsilon: number = DEFAULT_EPSILON,
): DeltaTone | null {
  if (!Number.isFinite(value)) return null;
  if (Math.abs(value) < epsilon) return "flat";
  const good = polarity === "lower-is-better" ? value < 0 : value > 0;
  return good ? "positive" : "negative";
}
