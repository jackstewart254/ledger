import type { HTMLAttributes, ReactNode } from "react";

export interface SectionHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** Right-aligned slot for actions (buttons, filters). */
  actions?: ReactNode;
}

/**
 * SectionHeading — the title row for a section inside a page: a heading and an
 * optional actions slot on the same line.
 *
 * The level is fixed at h2 rather than exposed as a prop. PageHeader owns the
 * h1, so everything under it is an h2 and the document outline holds up
 * without every caller having to work out where it sits.
 */
export function SectionHeading({ title, actions, className, ...rest }: SectionHeadingProps) {
  return (
    <div className={className ? `lg-section-heading ${className}` : "lg-section-heading"} {...rest}>
      <h2 className="lg-section-heading-title">{title}</h2>
      {actions != null && <div className="lg-section-heading-actions">{actions}</div>}
    </div>
  );
}
