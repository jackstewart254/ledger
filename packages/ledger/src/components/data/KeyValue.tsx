import type { CSSProperties, ReactNode } from "react";

export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  className?: string;
  style?: CSSProperties;
}

/**
 * KeyValue — label/value meta rows on --row-h: muted label left, tabular
 * value right, hairline separators. The dashboard's ds-label/ds-value pattern.
 */
export function KeyValue({ items, className, style }: KeyValueProps) {
  const cls = ["lg-keyvalue", className].filter(Boolean).join(" ");
  return (
    <dl className={cls} style={style}>
      {items.map((item, i) => (
        <div key={i} className="lg-keyvalue-row">
          <dt className="lg-keyvalue-label">{item.label}</dt>
          <dd className="lg-keyvalue-value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
