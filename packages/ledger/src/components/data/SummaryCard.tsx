import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export interface SummaryCardProps {
  /** The metric's name. Wraps rather than truncating — a long title is still a title. */
  title: ReactNode;
  /**
   * Top-right slot. A MetricDelta when the card reports a CHANGE, a Badge when
   * it reports a STATE ("Normal"). One slot, not two props: a card carries one
   * verdict or the other, never both, and a second prop would let it try.
   */
  aside?: ReactNode;
  /** The figure. Omit on cards whose body is the content (list, split). */
  value?: ReactNode;
  /** The muted line under the figure — "vs 214 last month". */
  caption?: ReactNode;
  /** Fills the rest of the card: a CompareChart, a KeyValue, a SummarySplit. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * SummaryCard — one card for the whole summary board: title and its verdict on
 * the head line, the figure under it, a caption saying what the figure is
 * measured against, then whatever fills the rest.
 *
 * The reference this came from drew four cards — big metric, compact metric,
 * status, list — and they are the same card with different things left out.
 * Four components would be four copies of one head row, drifting apart the
 * first time the title's wrap behaviour changed. So:
 *
 *   big metric   value + caption + <CompareChart>
 *   compact      value + caption
 *   status       value + caption, aside={<Badge>Normal</Badge>}
 *   list         no value, children={<KeyValue items={…} />}
 *   split        no value, children={<SummarySplit parts={…} />}
 *
 * No `size` prop either. The reference's big card sets its figure at roughly
 * 40px and the compact ones smaller; this kit's type scale stops at 28px
 * (--text-3xl), so both land on the same step and the size prop would have had
 * one value. Card WIDTH does the separating, which is the layout's job anyway.
 */
export function SummaryCard({
  title,
  aside,
  value,
  caption,
  children,
  className,
  style,
}: SummaryCardProps) {
  return (
    <div className={cx("lg-sum", className)} style={style}>
      <div className="lg-sum-head">
        <span className="lg-sum-title">{title}</span>
        {aside}
      </div>

      {(value != null || caption != null) && (
        <div className="lg-sum-figures">
          {value != null && <div className="lg-sum-value">{value}</div>}
          {caption != null && <div className="lg-sum-caption">{caption}</div>}
        </div>
      )}

      {children != null && <div className="lg-sum-body">{children}</div>}
    </div>
  );
}

export interface SummarySplitPart {
  value: ReactNode;
  label: ReactNode;
}

export interface SummarySplitProps {
  /** Leading part first — the first one is the emphasised one. */
  parts: SummarySplitPart[];
  className?: string;
  style?: CSSProperties;
}

/**
 * SummarySplit — one figure broken into its shares: "64% Mobile · 30% Desktop
 * · 6% Tablet", hairline-separated, the leading share emphasised.
 *
 * Emphasis is order, not a prop: the parts are a ranking, so `parts[0]` is the
 * leading one by definition and a `highlight` index would only ever be able to
 * disagree with the sort. It is spent on SIZE and the text ramp, not on a hue —
 * three shares of one metric are three shares, not three categories, and the
 * accent in this kit marks what you can do.
 */
export function SummarySplit({ parts, className, style }: SummarySplitProps) {
  return (
    <div className={cx("lg-sum-split", className)} style={style}>
      {parts.map((part, i) => (
        <div key={i} className="lg-sum-split-part">
          <div className="lg-sum-split-value">{part.value}</div>
          <div className="lg-sum-split-label">{part.label}</div>
        </div>
      ))}
    </div>
  );
}
