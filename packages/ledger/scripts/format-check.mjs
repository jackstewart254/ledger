// Self-check for the format helpers — `node scripts/format-check.mjs`.
// No deps, no runner: Node strips the TS types on import.
import assert from "node:assert/strict";
import { compactNumber, pct } from "../src/utils/format.ts";

const cases = [
  [0, "0"],
  [999, "999"],
  [1000, "1k"],
  [1234, "1.2k"],
  [9999, "10k"],
  [12345, "12k"],
  [999_999, "1M"], // rounds up a unit
  [1_000_000, "1M"],
  [999_999_999, "1bn"],
  [1_500_000_000, "1.5bn"],
  [1e12, "1000bn"], // no unit above bn
  [-1234, "-1.2k"],
  [-999_999, "-1M"],
  [Infinity, "—"],
  [-Infinity, "—"],
  [NaN, "—"],
  [null, "—"],
  [undefined, "—"],
];

for (const [input, expected] of cases) {
  assert.equal(compactNumber(input), expected, `compactNumber(${String(input)})`);
}

assert.equal(pct(3.25), "3.3%");
assert.equal(pct(3.24), "3.2%");
assert.equal(pct(-0.04), "0.0%"); // never "-0.0%"
assert.equal(pct(12, 0), "12%");
assert.equal(pct(Infinity), "—");
assert.equal(pct(NaN), "—");
assert.equal(pct(null), "—");

console.log("format-check: ok");
