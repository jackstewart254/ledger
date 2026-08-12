"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../core/Icon.js";

export type TableAlign = "left" | "center" | "right";
export type TableSortDir = "asc" | "desc";

export interface TableSort {
  key: string;
  dir: TableSortDir;
}

export interface TableColumn<Row> {
  key: string;
  header?: ReactNode;
  /** Fixed column width (any CSS length). */
  width?: string;
  align?: TableAlign;
  /** Numeric cell — tabular figures via --num-features. */
  numeric?: boolean;
  sortable?: boolean;
  /** Render-prop cell — falls back to row[key]. */
  render?: (row: Row) => ReactNode;
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey?: (row: Row, index: number) => string | number;
  /** Controlled sort — omit for uncontrolled (indicator only; sort rows via onSort). */
  sort?: TableSort | null;
  onSort?: (sort: TableSort) => void;
  onRowClick?: (row: Row) => void;
  /** 30px rows (--control-h-sm) + dense body type. */
  dense?: boolean;
  /** Row-height override — sets the --lg-table-row-h custom prop. */
  rowHeight?: string;
  /** Scroll height for the body (sticky header stays put). */
  maxHeight?: string;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Table — dense sortable data table. Render-prop columns, sticky header,
 * row hover, --row-h rows. Sorting is a client callback: the consumer
 * reorders `rows`.
 */
export function Table<Row>({
  columns,
  rows,
  rowKey,
  sort,
  onSort,
  onRowClick,
  dense = false,
  rowHeight,
  maxHeight,
  empty,
  className,
  style,
}: TableProps<Row>) {
  const [internalSort, setInternalSort] = useState<TableSort | null>(null);
  const activeSort = sort !== undefined ? sort : internalSort;

  const doSort = (key: string) => {
    const dir: TableSortDir = activeSort?.key === key && activeSort.dir === "asc" ? "desc" : "asc";
    const next = { key, dir };
    if (sort === undefined) setInternalSort(next);
    onSort?.(next);
  };

  const cls = ["lg-table", dense && "lg-table--dense", onRowClick && "lg-table--clickable", className]
    .filter(Boolean)
    .join(" ");
  const vars = {
    ...(rowHeight ? { "--lg-table-row-h": rowHeight } : undefined),
    ...(maxHeight ? { "--lg-table-max-h": maxHeight } : undefined),
    ...style,
  } as CSSProperties;

  return (
    <div className={cls} style={vars}>
      <div className="lg-table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => {
                const isActive = activeSort?.key === c.key;
                const thCls = [
                  c.align === "right" && "lg-table-th--right",
                  c.align === "center" && "lg-table-th--center",
                  isActive && "lg-table-th--active",
                ]
                  .filter(Boolean)
                  .join(" ");
                const label = c.sortable ? (
                  <button type="button" className="lg-table-sort" onClick={() => doSort(c.key)}>
                    {c.header}
                    <span
                      className={[
                        "lg-table-sortmark",
                        isActive && "lg-table-sortmark--active",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Icon
                        name={
                          isActive
                            ? activeSort?.dir === "asc"
                              ? "chevron-up"
                              : "chevron-down"
                            : "chevrons-up-down"
                        }
                        size={12}
                      />
                    </span>
                  </button>
                ) : (
                  c.header
                );
                return (
                  <th
                    key={c.key}
                    className={thCls || undefined}
                    style={c.width ? { width: c.width } : undefined}
                    aria-sort={
                      isActive ? (activeSort?.dir === "asc" ? "ascending" : "descending") : undefined
                    }
                  >
                    {label}
                  </th>
                );
              })}
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
                  const tdCls = [
                    c.numeric && "lg-table-cell--num",
                    c.align === "right" && "lg-table-cell--right",
                    c.align === "center" && "lg-table-cell--center",
                  ]
                    .filter(Boolean)
                    .join(" ");
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
