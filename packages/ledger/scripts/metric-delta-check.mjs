// Self-check for the MetricDelta tone verdict — `node scripts/metric-delta-check.mjs`.
// No deps, no runner: Node strips the TS types on import.
import assert from "node:assert/strict";
import { deltaTone } from "../src/internal/delta-tone.ts";

// [value, polarity, expected tone]
const cases = [
  // exact zero — the case that always worked
  [0, undefined, "flat"],
  [-0, undefined, "flat"],

  // float residue: what summing money-sized doubles actually leaves behind.
  // These are the regression. Every one of them used to paint red.
  [0.004, undefined, "flat"],
  [-0.004, undefined, "flat"],
  [0.1 + 0.2 - 0.3, undefined, "flat"],
  [1e-9, undefined, "flat"],
  [-1e-12, undefined, "flat"],

  // a real change stays a verdict — the epsilon must not swallow these
  [0.1, undefined, "positive"], // finest step `pct` prints
  [-0.1, undefined, "negative"],
  [0.01, undefined, "positive"], // one penny under `format={gbp}`
  [-0.01, undefined, "negative"],
  [3.2, undefined, "positive"],
  [-8.4, undefined, "negative"],

  // polarity flips which sign is good, and does not leak into the flat band
  [-6.2, "lower-is-better", "positive"],
  [12, "lower-is-better", "negative"],
  [0.004, "lower-is-better", "flat"],
  [-0.004, "lower-is-better", "flat"],

  // no honest verdict — the component renders nothing
  [NaN, undefined, null],
  [Infinity, undefined, null],
  [-Infinity, undefined, null],
];

for (const [value, polarity, expected] of cases) {
  assert.equal(
    deltaTone(value, polarity),
    expected,
    `deltaTone(${String(value)}, ${String(polarity)})`,
  );
}

// the boundary is exclusive: strictly below epsilon is flat, epsilon itself is a change
assert.equal(deltaTone(0.005), "positive");
assert.equal(deltaTone(0.004999), "flat");

// a caller passing fractions raises it; one passing raw counts lowers it to nothing
assert.equal(deltaTone(0.004, "higher-is-better", 0.05), "flat");
assert.equal(deltaTone(0.02, "higher-is-better", 0.05), "flat");
assert.equal(deltaTone(0.06, "higher-is-better", 0.05), "positive");
assert.equal(deltaTone(0.004, "higher-is-better", 0), "positive");

// epsilon never overrides the non-finite guard: NaN has no direction at any tolerance
assert.equal(deltaTone(NaN, "higher-is-better", 1e9), null);

console.log("metric-delta-check: ok");
