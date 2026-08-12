import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export interface PageColumnProps {
  /** Opt out of max-width + gutters — kills the negative-margin hack. */
  fullBleed?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * PageColumn — the one centered column every page hangs from.
 * Reads --page-max-width / --page-gutter.
 */
export function PageColumn({ fullBleed = false, children, className, style }: PageColumnProps) {
  const cls = cx("lg-page-column", fullBleed && "lg-page-column--full-bleed", className);
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
