import type { CSSProperties, ReactNode } from "react";

export interface CardProps {
  /** Optional header row — hairline-separated, --row-h tall. */
  header?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Card — the system's one surface: hairline border on --surface at radius-md,
 * 1px inner top-highlight, border-only hover. No shadow by design.
 */
export function Card({ header, children, className, style }: CardProps) {
  const cls = ["lg-card", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      {header != null && <div className="lg-card-header">{header}</div>}
      <div className="lg-card-body">{children}</div>
    </div>
  );
}
