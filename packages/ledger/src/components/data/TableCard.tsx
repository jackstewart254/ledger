import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export interface TableCardProps {
  /** Filter / search row along the top — one bar, hairline-separated. */
  toolbar?: ReactNode;
  /** Summary and pager along the bottom. Pinned: it is a sibling of the
   *  scrolling body, not inside it, so it needs no sticky positioning. */
  footer?: ReactNode;
  /**
   * Fixed card height (a number is read as px). The body then scrolls inside
   * it and the toolbar, header row and footer stay put. Left unset the card
   * grows to its content and the page scrolls instead — which is what you
   * want for a short table, and what you do NOT want for a long one, since a
   * scrolling page takes the column headings with it.
   */
  height?: string | number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * TableCard — the shell a data table lives in: toolbar, scrolling body, footer,
 * clipped to a 12px radius.
 *
 * It exists instead of `Card` with a `flush` body because the three bands are
 * the point. A Card is one padded box; this is a flex column whose middle
 * child is the only thing that scrolls, which is what buys a sticky header, a
 * pinned pager, and a toolbar that does not slide away — none of which a
 * container with a single content slot can give you.
 *
 * A Table dropped inside loses its own border and radius, and its internal
 * scroll container goes `overflow: visible`, so the card's body is the single
 * scrolling ancestor. Without that the table would scroll inside a box that
 * is itself inside a scrolling box, and the sticky header would pin to a
 * container that never moves.
 */
export function TableCard({ toolbar, footer, height, children, className, style }: TableCardProps) {
  const vars = {
    ...(height != null
      ? { "--lg-table-card-h": typeof height === "number" ? `${height}px` : height }
      : undefined),
    ...style,
  } as CSSProperties;

  return (
    <div className={cx("lg-table-card", className)} style={vars}>
      {toolbar != null && <div className="lg-table-card-toolbar">{toolbar}</div>}
      <div className="lg-table-card-body">{children}</div>
      {footer != null && <div className="lg-table-card-footer">{footer}</div>}
    </div>
  );
}
