// Self-check for the DatePicker month grid — `node scripts/datepicker-check.mjs`.
// No deps, no runner: Node strips the TS types on import.
import assert from "node:assert/strict";
import { monthGrid } from "../src/internal/month-grid.ts";

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// leading / in-month / trailing counts for a month's grid
const shape = (year, month) => {
  const cells = monthGrid(year, month);
  const lead = cells.findIndex((c) => c.inMonth);
  const inMonth = cells.filter((c) => c.inMonth).length;
  return { cells, lead, inMonth, trail: cells.length - lead - inMonth };
};

// always six weeks — the popover must not change height between months
for (const [y, m] of [[2026, 0], [2026, 1], [2024, 1], [2026, 5], [2026, 11]]) {
  assert.equal(monthGrid(y, m).length, 42, `42 cells for ${y}-${m + 1}`);
}

// February 2026 starts on a Sunday — the worst case for Monday-first weeks
{
  const { cells, lead, inMonth, trail } = shape(2026, 1);
  assert.deepEqual([lead, inMonth, trail], [6, 28, 8]);
  assert.equal(iso(cells[0].date), "2026-01-26"); // leading days from January
  assert.equal(iso(cells[6].date), "2026-02-01");
  assert.equal(iso(cells[41].date), "2026-03-08"); // trailing days from March
}

// June 2026 starts on a Monday — no leading days at all
{
  const { cells, lead, inMonth, trail } = shape(2026, 5);
  assert.deepEqual([lead, inMonth, trail], [0, 30, 12]);
  assert.equal(iso(cells[0].date), "2026-06-01");
  assert.equal(cells[0].inMonth, true);
}

// February 2024 — leap year, 29 days
{
  const { cells, lead, inMonth, trail } = shape(2024, 1);
  assert.deepEqual([lead, inMonth, trail], [3, 29, 10]);
  assert.equal(iso(cells[lead + 28].date), "2024-02-29");
  assert.equal(iso(cells[lead + 29].date), "2024-03-01");
}

// February 2026 — not a leap year, no 29th
assert.equal(
  shape(2026, 1).cells.some((c) => c.inMonth && c.date.getDate() === 29),
  false,
);

// December rolls the trailing days into the next year
{
  const { cells, lead, inMonth, trail } = shape(2026, 11);
  assert.deepEqual([lead, inMonth, trail], [1, 31, 10]);
  assert.equal(iso(cells[0].date), "2026-11-30"); // leading day from November
  assert.equal(iso(cells[lead + 30].date), "2026-12-31");
  assert.equal(iso(cells[41].date), "2027-01-10");
}

// January's leading days come from the previous year
assert.equal(iso(shape(2026, 0).cells[0].date), "2025-12-29");

// every grid is 42 consecutive days, Monday-first, whatever the month
for (const [y, m] of [[2026, 1], [2024, 1], [2026, 11]]) {
  const { cells } = shape(y, m);
  assert.equal(cells[0].date.getDay(), 1, "week starts Monday");
  cells.forEach(({ date }, i) => {
    if (i === 0) return;
    const prev = cells[i - 1].date;
    assert.equal(
      iso(date),
      iso(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1)),
      `cell ${i} follows cell ${i - 1}`,
    );
  });
}

console.log("datepicker-check: ok");
