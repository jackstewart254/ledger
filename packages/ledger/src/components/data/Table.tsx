"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { cx } from "../../internal/cx.js";
import { Icon } from "../core/Icon.js";
import { Checkbox } from "../forms/Checkbox.js";

export type TableAlign = "left" | "center" | "right";
export type TableSortDir = "asc" | "desc";
/** Whatever `rowKey` returns — the identity a row is selected by. */
export type TableRowKey = string | number;

/** Controlled sort state: which column, which direction. */
export interface TableSort {
  key: string;
  dir: TableSortDir;
}

export interface TableColumn<Row> {
  key: string;
  header?: ReactNode;
  /**
   * Column width (any CSS length). The table lays out fixed, so this is honoured
   * exactly rather than treated as a hint — columns left unset split whatever
   * space is over. Don't reach for the auto-layout `width: "100%"` idiom to mean
   * "take the rest": under fixed layout it takes all of it.
   */
  width?: string;
  align?: TableAlign;
  /** Numeric cell — tabular figures via --num-features. */
  numeric?: boolean;
  /** Render-prop cell — falls back to row[key]. */
  render?: (row: Row) => ReactNode;
  /**
   * Turns this column's header into a sort button. Needs `onSortChange` on the
   * table; without it the flag does nothing, since there would be nowhere to
   * report the click. Any sortable column un-hides the header row — see the
   * note on the component.
   */
  sortable?: boolean;
  /**
   * Host the row's control — the anchor from `rowHref`, or the button from
   * `onRowClick` — in this column instead of the first. The control takes its
   * accessible name from the cell it wraps, so this wants to be the column
   * that identifies the row, never a status dot or a bare icon.
   */
  link?: boolean;
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  /**
   * Row identity. Also the selection key, so give it something stable: with
   * the index fallback, selection follows a row's POSITION, and sorting the
   * rows then moves the ticks to different records.
   */
  rowKey?: (row: Row, index: number) => TableRowKey;
  /**
   * Makes each row a link. The row's identifying cell (the first column, or
   * the one flagged `link`) becomes a real `<a href>`, which is what buys
   * focus, Enter, middle-click and open-in-new-tab without a line of key
   * handling. Clicking anywhere else on the row follows it too.
   *
   * Takes a template string as well as a function, and the template is the
   * form to reach for: `"/runs/{id}"` interpolates fields from the row
   * (URI-encoded) and is serialisable, so a server component can pass it. A
   * function cannot cross that boundary — it type-checks and throws when the
   * route renders.
   *
   * Set this or `onRowClick`, not usually both: with both, the control
   * navigates and `onRowClick` still fires for clicks elsewhere in the row.
   */
  rowHref?: string | ((row: Row) => string);
  /**
   * Row action for rows that have no URL to point at — a drawer, a modal.
   * Same identifying cell becomes a `<button>`, so the row is reachable by
   * keyboard; the whole row stays clickable for the mouse.
   */
  onRowClick?: (row: Row) => void;
  /** Row-height override — sets the --lg-table-row-h custom prop. */
  rowHeight?: string;
  /**
   * Caps the scroll container's height. A visible header row (see the note on
   * the component) pins itself to the top of that container as the body
   * scrolls — there is no prop for it, because a scrolling table that loses
   * its headings is only ever worse.
   */
  maxHeight?: string;
  /**
   * Current sort, or null/undefined for none. Fully controlled: the kit draws
   * the header affordance and the direction arrow, the CONSUMER owns the
   * comparator and passes rows already in order. Nothing here re-orders `rows`
   * — a component that sorts your data owns state you can't see, and the sort
   * you want ("live first, then name") is rarely the one it would guess.
   */
  sort?: TableSort | null;
  /**
   * Fires with the next sort when a sortable header is activated: a new column
   * starts at "asc", the sorted column flips direction. Two states only —
   * there is no third click back to unsorted.
   */
  onSortChange?: (sort: TableSort) => void;
  /**
   * Selected row keys (from `rowKey`). Fully controlled — pass this together
   * with `onSelectionChange` to get the checkbox column.
   */
  selectedKeys?: ReadonlySet<TableRowKey>;
  /**
   * Fires with the next selection. The header checkbox adds or removes every
   * key in the CURRENT `rows`, leaving keys outside them alone, so selecting
   * on a filtered or paged view doesn't silently drop what's off-screen.
   */
  onSelectionChange?: (keys: Set<TableRowKey>) => void;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/* A template beats a function here because a function prop cannot cross the
   server→client boundary, and "this row is a link" is the case least likely to
   need one: `"/runs/{id}"` is what most call sites want anyway. Values are
   URI-encoded, since a row field is data and can hold a slash. */
const rowHrefFor = <Row,>(spec: string | ((row: Row) => string), row: Row): string =>
  typeof spec === "function"
    ? spec(row)
    : spec.replace(/\{(\w+)\}/g, (_, field: string) =>
        encodeURIComponent(String((row as Record<string, unknown>)[field] ?? "")),
      );

/**
 * Table — render-prop columns, row hover, 42px rows (--lg-table-row-h, which
 * defaults to --control-h-lg; override per instance with `rowHeight`).
 *
 * An interactive row (`rowHref` or `onRowClick`) puts a real `<a>`/`<button>`
 * in the row's identifying cell rather than wiring keys onto the `<tr>`. The
 * tempting shape — `tabIndex` and `role="button"` on the row — is the wrong
 * one: two of the major screen readers drop a row carrying that role out of
 * the table altogether, so the reader gains a button and loses every column
 * heading that told them what its cells meant. A control in a cell keeps the
 * table a table, and its accessible name is that cell's own text.
 *
 * The header row is in the DOM but hidden visually: a column of dates under a
 * heading that reads "Date" tells the reader what they already worked out, and
 * on a full-page table those labels are the only chrome left. Screen readers
 * still get them, so the table stays navigable by column.
 *
 * It un-hides itself when it has something to hold — a `sortable` column, or
 * selection — because that is the point at which the header stops being a
 * restatement of the data and becomes a row of controls. That is keyed off the
 * props, not exposed as one: there is nothing for a consumer to remember, and
 * a sort control with nothing visible to click is worse than no sorting at all.
 * Once visible it is also sticky, so `maxHeight` scrolls the body under it.
 *
 * Sorting and selection are both fully controlled and neither touches `rows`.
 */
export function Table<Row>({
  columns,
  rows,
  rowKey,
  rowHref,
  onRowClick,
  rowHeight,
  maxHeight,
  sort,
  onSortChange,
  selectedKeys,
  onSelectionChange,
  empty,
  className,
  style,
}: TableProps<Row>) {
  const selectable = selectedKeys != null && onSelectionChange != null;
  // A `sortable` column with no handler is inert, so it doesn't count towards
  // showing the header — otherwise a half-wired table loses its hidden header
  // and gains a row of dead labels.
  const sortableHead = onSortChange != null && columns.some((c) => c.sortable);
  const showHead = selectable || sortableHead;

  const keys = rows.map((row, i) => (rowKey ? rowKey(row, i) : i));
  const allSelected = selectable && keys.length > 0 && keys.every((k) => selectedKeys.has(k));
  const someSelected = selectable && !allSelected && keys.some((k) => selectedKeys.has(k));

  const toggleAll = () => {
    if (!selectable) return;
    const next = new Set(selectedKeys);
    for (const k of keys) {
      if (allSelected) next.delete(k);
      else next.add(k);
    }
    onSelectionChange(next);
  };

  const toggleRow = (k: TableRowKey) => {
    if (!selectable) return;
    const next = new Set(selectedKeys);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    onSelectionChange(next);
  };

  const interactive = rowHref != null || onRowClick != null;
  // findIndex's -1 folds into the first column, which is the default anyway.
  const linkIndex = Math.max(0, columns.findIndex((c) => c.link));

  const cls = cx(
    "lg-table",
    interactive && "lg-table--clickable",
    className,
  );
  const vars = {
    ...(rowHeight ? { "--lg-table-row-h": rowHeight } : undefined),
    ...(maxHeight ? { "--lg-table-max-h": maxHeight } : undefined),
    ...style,
  } as CSSProperties;

  return (
    <div className={cls} style={vars}>
      <div className="lg-table-scroll">
        <table>
          {/* Widths live on <col>, not <th>: while the header row is hidden it
              is pulled out of flow, so anything sized there never reaches
              layout. */}
          <colgroup>
            {selectable && <col className="lg-table-col--select" />}
            {columns.map((c) => (
              <col key={c.key} style={c.width ? { width: c.width } : undefined} />
            ))}
          </colgroup>
          <thead className={cx("lg-table-head", !showHead && "lg-table-head--hidden")}>
            <tr>
              {selectable && (
                <th className="lg-table-th--select" scope="col">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((c) => {
                const active = sort != null && sort.key === c.key;
                const isSort = c.sortable === true && onSortChange != null;
                return (
                  <th
                    key={c.key}
                    className={
                      cx(
                        c.align === "right" && "lg-table-th--right",
                        c.align === "center" && "lg-table-th--center",
                      ) || undefined
                    }
                    scope="col"
                    aria-sort={
                      !isSort ? undefined : !active ? "none" : sort.dir === "asc" ? "ascending" : "descending"
                    }
                  >
                    {isSort ? (
                      <button
                        type="button"
                        className="lg-table-sort"
                        onClick={() =>
                          onSortChange({ key: c.key, dir: active && sort.dir === "asc" ? "desc" : "asc" })
                        }
                      >
                        {c.header}
                        {/* The idle column keeps a muted double-chevron rather
                            than nothing: an affordance you can only find by
                            clicking is not an affordance. */}
                        <Icon
                          as={!active ? ChevronsUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown}
                          className={active ? undefined : "lg-table-sort-idle"}
                        />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="lg-table-empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                  {empty ?? "No results"}
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const k = keys[i];
              const selected = selectable && selectedKeys.has(k);
              const href = rowHref != null ? rowHrefFor(rowHref, row) : undefined;

              /* The row's real control, and the only thing the keyboard ever
                 reaches. An anchor when there is a URL, since that is what
                 carries new-tab and middle-click; a button when there is not. */
              const control = (content: ReactNode) => {
                if (href != null)
                  return (
                    <a className="lg-table-rowlink" href={href}>
                      {content}
                    </a>
                  );
                if (onRowClick)
                  return (
                    <button type="button" className="lg-table-rowlink" onClick={() => onRowClick(row)}>
                      {content}
                    </button>
                  );
                return content;
              };

              /* Mouse-only shortcut from the rest of the row to the control's
                 action. A link row re-fires its own anchor rather than pushing
                 history itself, so the anchor stays the single definition of
                 where the row goes — and a consumer's routed <a> keeps working. */
              const onRowMouse = onRowClick
                ? () => onRowClick(row)
                : href != null
                  ? (e: MouseEvent<HTMLTableRowElement>) =>
                      e.currentTarget.querySelector<HTMLAnchorElement>(".lg-table-rowlink")?.click()
                  : undefined;

              return (
                <tr key={k} data-selected={selected || undefined} onClick={onRowMouse}>
                  {selectable && (
                    // The click stops here: a checkbox that also fires the
                    // row's own onRowClick opens a drawer every time you tick.
                    <td className="lg-table-cell--select" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select ${k}`}
                        checked={selected}
                        onChange={() => toggleRow(k)}
                      />
                    </td>
                  )}
                  {columns.map((c, ci) => {
                    const tdCls = cx(
                      c.numeric && "lg-table-cell--num",
                      c.align === "right" && "lg-table-cell--right",
                      c.align === "center" && "lg-table-cell--center",
                    );
                    const content = c.render
                      ? c.render(row)
                      : ((row as Record<string, unknown>)[c.key] as ReactNode);
                    const isControl = interactive && ci === linkIndex;
                    return (
                      <td
                        key={c.key}
                        className={tdCls || undefined}
                        // Same reason the checkbox cell stops here: the control
                        // has already run the row's action, and letting the
                        // click reach the <tr> would run it a second time.
                        onClick={isControl ? (e) => e.stopPropagation() : undefined}
                      >
                        {isControl ? control(content) : content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
