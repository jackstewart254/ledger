"use client";

import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export type TableAlign = "left" | "center" | "right";

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
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey?: (row: Row, index: number) => string | number;
  onRowClick?: (row: Row) => void;
  /** Row-height override — sets the --lg-table-row-h custom prop. */
  rowHeight?: string;
  /**
   * Caps the scroll container's height. Nothing is sticky — the header row is
   * hidden, so there is no column strip to pin and the whole table scrolls.
   */
  maxHeight?: string;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Table — render-prop columns, row hover, 42px rows (--lg-table-row-h, which
 * defaults to --control-h-lg; override per instance with `rowHeight`).
 *
 * The header row is in the DOM but hidden visually: a column of dates under a
 * heading that reads "Date" tells the reader what they already worked out, and
 * on a full-page table those labels are the only chrome left. Screen readers
 * still get them, so the table stays navigable by column.
 *
 * No sorting. It lived entirely in the header, and a sort control with nothing
 * visible to click is worse than none — when a view needs sorting, put the
 * control in the page toolbar where it can say what it does.
 */
export function Table<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowHeight,
  maxHeight,
  empty,
  className,
  style,
}: TableProps<Row>) {

  const cls = cx(
    "lg-table",
    onRowClick && "lg-table--clickable",
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
          {/* Widths live on <col>, not <th>: the header row is pulled out of
              flow to hide it, so anything sized there never reaches layout. */}
          <colgroup>
            {columns.map((c) => (
              <col key={c.key} style={c.width ? { width: c.width } : undefined} />
            ))}
          </colgroup>
          <thead className="lg-table-head">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={
                    cx(
                      c.align === "right" && "lg-table-th--right",
                      c.align === "center" && "lg-table-th--center",
                    ) || undefined
                  }
                  scope="col"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="lg-table-empty" colSpan={columns.length}>
                  {empty ?? "No results"}
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row, i) : i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => {
                  const tdCls = cx(
                    c.numeric && "lg-table-cell--num",
                    c.align === "right" && "lg-table-cell--right",
                    c.align === "center" && "lg-table-cell--center",
                  );
                  return (
                    <td key={c.key} className={tdCls || undefined}>
                      {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
