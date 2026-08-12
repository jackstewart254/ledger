import type { HTMLAttributes, ReactNode } from "react";

export interface SectionHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** Right-aligned slot for actions (buttons, filters). */
  actions?: ReactNode;
}

export function SectionHeading({ title, actions, className, ...rest }: SectionHeadingProps) {
  return (
    <div className={className ? `lg-section-heading ${className}` : "lg-section-heading"} {...rest}>
      <h2 className="lg-section-heading-title">{title}</h2>
      {actions != null && <div className="lg-section-heading-actions">{actions}</div>}
    </div>
  );
}
