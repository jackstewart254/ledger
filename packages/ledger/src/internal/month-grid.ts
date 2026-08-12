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
 * 6×7 = 42 day cells covering `month` (0-indexed) of `year`, weeks starting
 * Monday. Always 42 so the popover never changes height between months.
 * Every cell is built through the Date constructor, which normalises days
 * outside the month — that is what carries the leading/trailing days across
 * month and year boundaries, and it stays DST-safe (no ms arithmetic).
 */
export function monthGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const m = first.getMonth();
  const lead = weekdayIndex(first);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(year, month, 1 - lead + i);
    return { date, inMonth: date.getMonth() === m };
  });
}
