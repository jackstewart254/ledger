/** Shared display formatters for metrics (tabular figures, compact). */

export function compactNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(abs >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "bn";
  if (abs >= 1e6) return (n / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}

export function pct(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits) + "%";
}
