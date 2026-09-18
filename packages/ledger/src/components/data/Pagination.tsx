"use client";

import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "../core/Icon.js";

export interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /**
   * Prev / "2 / 3" / Next instead of the run of numbered buttons. For a card
   * footer, where the numbers are competing with a summary line for a 45px
   * band and nobody jumps to page 7 of 9 anyway. The window form stays the
   * default — this is a second shape, not a replacement.
   */
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
}

const WINDOW = 3;

/**
 * Always exactly WINDOW pages (fewer only when the set is smaller), sliding to
 * keep the current page centred. No first/last anchors and no ellipsis: those
 * make the control change width as you page, so the Next button moves out from
 * under the cursor mid-sequence.
 */
function pageWindow(page: number, pageCount: number): number[] {
  const size = Math.min(WINDOW, Math.max(pageCount, 0));
  if (size <= 0) return [];
  const half = Math.floor(size / 2);
  const start = Math.min(Math.max(1, page - half), pageCount - size + 1);
  return Array.from({ length: size }, (_, i) => start + i);
}

/**
 * Pagination — controlled: hairline chevron buttons + a fixed-width run of
 * page numerals.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  compact = false,
  className,
  style,
}: PaginationProps) {
  const cls = ["lg-pagination", compact && "lg-pagination--compact", className]
    .filter(Boolean)
    .join(" ");

  if (compact)
    return (
      <nav className={cls} style={style} aria-label="Pagination">
        <button
          type="button"
          className="lg-pagination-step"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {/* 14px, not the kit's 17: the glyph is punctuation beside a 12px
              word here, not the control itself. */}
          <Icon as={ChevronLeft} size={14} />
          Prev
        </button>
        {/* Not aria-live: the page number is the OUTCOME of a button the user
            just pressed, and announcing it again interrupts the row they were
            sent to. The buttons' own disabled state carries the boundaries. */}
        <span className="lg-pagination-count">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          className="lg-pagination-step"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <Icon as={ChevronRight} size={14} />
        </button>
      </nav>
    );

  return (
    <nav className={cls} style={style} aria-label="Pagination">
      <button
        type="button"
        className="lg-pagination-btn"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Icon as={ChevronLeft} />
      </button>
      {pageWindow(page, pageCount).map((item, slot) => (
        /* Keyed by SLOT, not page number. Keying by the number makes React
           carry each button to its new position as the window slides, so the
           active highlight visibly travels sideways and snaps back. Keyed by
           slot, the buttons stay put and only their labels change. */
        <button
          key={slot}
          type="button"
          className="lg-pagination-page"
          aria-current={item === page ? "page" : undefined}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        className="lg-pagination-btn"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <Icon as={ChevronRight} />
      </button>
    </nav>
  );
}
