// Self-check for the DatePicker month grid — `node scripts/datepicker-check.mjs`.
// No deps, no runner: Node strips the TS types on import.
import assert from "node:assert/strict";
import { monthGrid, weekdayIndex } from "../src/internal/month-grid.ts";

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();

// leading blanks / real days / trailing blanks for a month's grid
const shape = (year, month) => {
  const cells = monthGrid(year, month);
  const lead = cells.findIndex((c) => c !== null);
  const days = cells.filter((c) => c !== null).length;
  return { cells, lead, days, trail: cells.length - lead - days };
};

const MONTHS = [
  [2026, 0],
  [2026, 1],
  [2024, 1],
  [2026, 5],
  [2026, 11],
  [2027, 7],
];

// The grid holds ONLY this month. Neighbouring months are blanks, and it is
// trimmed to whole weeks — so height varies by month rather than always 42.
for (const [y, m] of MONTHS) {
  const { cells, lead, days, trail } = shape(y, m);

  assert.equal(cells.length % 7, 0, `whole weeks for ${y}-${m + 1}`);
  assert.equal(days, daysIn(y, m), `every day of ${y}-${m + 1} is present`);
  assert.equal(lead, weekdayIndex(new Date(y, m, 1)), `leading blanks for ${y}-${m + 1}`);
  assert.ok(trail < 7, `at most one short week of trailing blanks for ${y}-${m + 1}`);

  // no cell belongs to another month, and the days run 1..n in order
  cells.filter(Boolean).forEach((cell, i) => {
    assert.equal(cell.inMonth, true);
    assert.equal(cell.date.getMonth(), m, `cell ${i} is in month ${m}`);
    assert.equal(cell.date.getFullYear(), y);
    assert.equal(cell.date.getDate(), i + 1, `day ${i + 1} in order`);
  });

  // blanks only ever sit at the two ends, never inside the month
  const firstReal = lead;
  const lastReal = lead + days - 1;
  cells.forEach((c, i) => {
    const shouldBeBlank = i < firstReal || i > lastReal;
    assert.equal(c === null, shouldBeBlank, `slot ${i} blank-ness for ${y}-${m + 1}`);
  });
}

// February 2026 starts on a Sunday — the worst case for Monday-first weeks
{
  const { cells, lead, days, trail } = shape(2026, 1);
  assert.deepEqual([lead, days, trail], [6, 28, 1]);
  assert.equal(cells[6] && iso(cells[6].date), "2026-02-01");
  assert.equal(cells[0], null);
}

// June 2026 starts on a Monday — no leading blanks at all
{
  const { cells, lead, days } = shape(2026, 5);
  assert.equal(lead, 0);
  assert.equal(days, 30);
  assert.equal(iso(cells[0].date), "2026-06-01");
}

// February 2024 — leap year, 29 days; February 2026 — no 29th
{
  const feb24 = shape(2024, 1);
  assert.equal(feb24.days, 29);
  assert.equal(iso(feb24.cells[feb24.lead + 28].date), "2024-02-29");
  assert.equal(
    shape(2026, 1).cells.some((c) => c && c.date.getDate() === 29),
    false,
  );
}

// December stops at the 31st — no roll into the next year
{
  const { cells, lead, days } = shape(2026, 11);
  assert.equal(days, 31);
  assert.equal(iso(cells[lead + 30].date), "2026-12-31");
  assert.equal(cells.slice(lead + days).every((c) => c === null), true);
}

// January starts clean — no days borrowed from the previous year
assert.equal(shape(2026, 0).cells.every((c) => c === null || c.date.getFullYear() === 2026), true);

// every real day sits in the correct weekday column
for (const [y, m] of MONTHS) {
  const { cells } = shape(y, m);
  cells.forEach((c, i) => {
    if (c) assert.equal(weekdayIndex(c.date), i % 7, `${iso(c.date)} in column ${i % 7}`);
  });
}

console.log("datepicker-check: ok");
