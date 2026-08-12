"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../internal/cx.js";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
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
  /** Controlled sort — the consumer reorders `rows`. Omit both this and `onSort` to let the table sort itself. */
  sort?: TableSort | null;
  onSort?: (sort: TableSort) => void;
  onRowClick?: (row: Row) => void;
  /** Row-height override — sets the --lg-table-row-h custom prop. */
  rowHeight?: string;
  /** Scroll height for the body (sticky header stays put). */
  maxHeight?: string;
  empty?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Uncontrolled reorder. Numeric columns compare as numbers ("7.8%" → 7.8),
 * everything else by locale. Array#sort is stable (ES2019), so equal keys keep
 * their source order.
 */
function sortRows<Row>(rows: Row[], sort: TableSort, columns: TableColumn<Row>[]): Row[] {
  const { key } = sort;
  const numeric = columns.find((c) => c.key === key)?.numeric;
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = (a as Record<string, unknown>)[key];
    const vb = (b as Record<string, unknown>)[key];
    if (numeric) {
      const na = Number.parseFloat(String(va));
      const nb = Number.parseFloat(String(vb));
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return sign * (na - nb);
    }
    return sign * String(va ?? "").localeCompare(String(vb ?? ""));
  });
}

/**
 * Table — sortable data table. Render-prop columns, sticky header,
 * row hover, --row-h rows. Sorting is a client callback when `sort`/`onSort`
 * are given (the consumer reorders `rows`); with neither, the table sorts
 * its own rows.
 */
export function Table<Row>({
  columns,
  rows,
  rowKey,
  sort,
  onSort,
  onRowClick,
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

  // nobody else is reordering, so do it here — otherwise the indicator and
  // aria-sort assert a sort that never happened
  const selfSort = sort === undefined && onSort === undefined ? internalSort : null;
  const body = selfSort ? sortRows(rows, selfSort, columns) : rows;

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
          <thead>
            <tr>
              {columns.map((c) => {
                const isActive = activeSort?.key === c.key;
                const thCls = cx(
                  c.align === "right" && "lg-table-th--right",
                  c.align === "center" && "lg-table-th--center",
                  isActive && "lg-table-th--active",
                );
                const label = c.sortable ? (
                  <button type="button" className="lg-table-sort" onClick={() => doSort(c.key)}>
                    {c.header}
                    <span className={cx("lg-table-sortmark", isActive && "lg-table-sortmark--active")}>
                      <Icon
                        as={
                          isActive
                            ? activeSort?.dir === "asc"
                              ? ChevronUp
                              : ChevronDown
                            : ChevronsUpDown
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
            {body.length === 0 && (
              <tr>
                <td className="lg-table-empty" colSpan={columns.length}>
                  {empty ?? "No results"}
                </td>
              </tr>
            )}
            {body.map((row, i) => (
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
