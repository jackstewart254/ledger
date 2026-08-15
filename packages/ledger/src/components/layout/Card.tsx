import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional header row — hairline-separated, --row-h tall. */
  header?: ReactNode;
  /**
   * Drop the body's padding. For the card that *is* its content — a list of
   * rows, a table — where the inset belongs to each row and not to the card.
   * The header keeps its own padding either way.
   */
  flush?: boolean;
}

/**
 * Card — the system's one surface: hairline border on --surface at radius-md,
 * 1px inner top-highlight, border-only hover. No shadow by design.
 *
 * Not polymorphic, and not on purpose rather than by omission: a card that
 * needs to be a `<button>` is a different component, because a control owes
 * you a focus ring, a pressed state and a hit target that a container must
 * not grow. `id`, `role` and `aria-*` are the opposite case — they describe
 * the div that is already there, so they pass straight through.
 */
export function Card({ header, children, className, flush = false, ...rest }: CardProps) {
  return (
    <div className={cx("lg-card", className)} {...rest}>
      {header != null && <div className="lg-card-header">{header}</div>}
      <div className={cx("lg-card-body", flush && "lg-card-body--flush")}>{children}</div>
    </div>
  );
}
