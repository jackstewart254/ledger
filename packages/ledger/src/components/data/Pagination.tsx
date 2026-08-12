"use client";

import type { CSSProperties } from "react";
import { Icon } from "../core/Icon.js";

export interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  style?: CSSProperties;
}

type PageItem = number | "gap";

// first + last + a window around the current page; "gap" marks an ellipsis
function pageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((p) => p > 1 && p < pageCount);
  const items: PageItem[] = [1];
  if (around.length > 0 && around[0] > 2) items.push("gap");
  items.push(...around);
  if (around.length === 0 || around[around.length - 1] < pageCount - 1) items.push("gap");
  items.push(pageCount);
  return items;
}

/**
 * Pagination — controlled: hairline chevron buttons + mono page numerals.
 */
export function Pagination({ page, pageCount, onPageChange, className, style }: PaginationProps) {
  const cls = ["lg-pagination", className].filter(Boolean).join(" ");
  return (
    <nav className={cls} style={style} aria-label="Pagination">
      <button
        type="button"
        className="lg-pagination-btn"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Icon name="chevron-left" size={14} />
      </button>
      {pageItems(page, pageCount).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="lg-pagination-gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className="lg-pagination-page"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className="lg-pagination-btn"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </nav>
  );
}
