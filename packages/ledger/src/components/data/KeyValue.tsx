import type { CSSProperties, ReactNode } from "react";
import { Info } from "lucide-react";
import { IconButton } from "../core/IconButton.js";

export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
  /**
   * A qualifier that applies to this figure alone — "all rows, not just the
   * page", "excludes VAT". It goes on an info glyph rather than into the label,
   * because one label three words longer than its neighbours breaks the row's
   * rhythm and the columns orientation ellipsises it away anyway. Plain text:
   * it is also the glyph's accessible name.
   */
  hint?: string;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  /**
   * "rows" (default) stacks label-left/value-right pairs down the container.
   * "columns" lays the pairs across it instead, label over value, split evenly
   * with a hairline between — for a short set that reads as one row of facts
   * rather than a list you scan down.
   */
  orientation?: "rows" | "columns";
  className?: string;
  style?: CSSProperties;
}

/**
 * KeyValue — label/value meta pairs: muted label, tabular value, hairline
 * separators. The dashboard's ds-label/ds-value pattern.
 *
 * The columns orientation stops being readable somewhere around five or six
 * items on a narrow card — the labels are what run out of room first, since a
 * value is short by nature and a label is not. It does not wrap to a second
 * line on purpose: a "row of facts" that silently becomes two rows is just the
 * rows orientation with worse alignment.
 */
export function KeyValue({ items, orientation = "rows", className, style }: KeyValueProps) {
  const cls = [
    "lg-keyvalue",
    orientation === "columns" && "lg-keyvalue--columns",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <dl className={cls} style={style}>
      {items.map((item, i) => (
        <div key={i} className="lg-keyvalue-row">
          <dt className="lg-keyvalue-label">
            {item.label}
            {/* IconButton, not a bare <Icon>: the tip has to reach a keyboard,
                and `bare` is exactly the glyph-annotating-a-row case. */}
            {item.hint != null && (
              <IconButton
                icon={Info}
                variant="bare"
                label={item.hint}
                className="lg-keyvalue-hint"
              />
            )}
          </dt>
          <dd className="lg-keyvalue-value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
