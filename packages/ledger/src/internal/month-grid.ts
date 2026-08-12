// internal — the month-grid maths behind DatePicker. Deliberately import-free
// so `node scripts/datepicker-check.mjs` runs it straight off the source.
// Not exported from the barrel.

export interface DayCell {
  date: Date;
  /** false for the leading/trailing days borrowed from the neighbouring months */
  inMonth: boolean;
}

/** Local midnight — the picker compares and emits dates, never times. */
export const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Monday-first weekday index (UK weeks); Date's own getDay() is Sunday-first. */
export const weekdayIndex = (d: Date): number => (d.getDay() + 6) % 7;

/**
 * Day cells covering `month` (0-indexed) of `year`, weeks starting Monday.
 *
 * ONLY this month's days are returned; the leading and trailing slots are
 * `null` blanks. Rendering the neighbouring months' days greys half the first
 * and last rows and makes the reader check which month a number belongs to
 * before trusting it — the whole point of the header is that they shouldn't
 * have to. The grid is trimmed to whole weeks, so its height varies by month
 * (4–6 rows) rather than always padding to 42.
 *
 * Dates are built through the Date constructor, which normalises across month
 * and year boundaries and stays DST-safe (no millisecond arithmetic).
 */
export function monthGrid(year: number, month: number): (DayCell | null)[] {
  const first = new Date(year, month, 1);
  const m = first.getMonth();
  const lead = weekdayIndex(first);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (DayCell | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d += 1) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  void m;
  return cells;
}
