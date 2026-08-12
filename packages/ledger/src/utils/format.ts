/** Shared display formatters for metrics (tabular figures, compact). */

// descending — the first unit an absolute value clears
const UNITS: ReadonlyArray<readonly [number, string]> = [
  [1e9, "bn"],
  [1e6, "M"],
  [1e3, "k"],
];

// one decimal below 10 of a unit, none above
const mantissa = (m: number): string =>
  m.toFixed(Math.abs(m) >= 10 ? 0 : 1).replace(/\.0$/, "");

export function compactNumber(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  let i = UNITS.findIndex(([div]) => abs >= div);
  if (i === -1) return String(n);
  let m = mantissa(n / UNITS[i][0]);
  // rounding can push the mantissa into the next unit: 999_999 is 1M, not 1000k
  if (Math.abs(Number(m)) >= 1000 && i > 0) {
    i -= 1;
    m = mantissa(n / UNITS[i][0]);
  }
  return m + UNITS[i][1];
}

/**
 * Human date — "11 Aug 2026". ISO strings belong in the data layer, not on
 * screen: `2026-08-11` makes the reader parse a format before reading a date,
 * and a column of them reads as serial numbers. Native Intl, no dependency.
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  locale = "en-GB",
): string {
  if (value == null) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function pct(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const rounded = Number(n.toFixed(digits));
  // -0.04 rounds to -0 — print it as 0.0%, not -0.0%
  return (rounded === 0 ? 0 : rounded).toFixed(digits) + "%";
}
