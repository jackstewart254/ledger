import type { HTMLAttributes, ReactNode } from "react";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Muted one-liner under the title. */
  subtitle?: ReactNode;
  /** Right-hand controls, on the title's baseline. */
  actions?: ReactNode;
}

/**
 * PageHeader — the view title block (replaces the 8×-copy-pasted heading).
 *
 * `actions` exists because every page put buttons beside its title and had to
 * hand-roll the flex row to do it — SectionHeading already owned that slot, and
 * the more important header didn't. Markers (a Badge naming the environment)
 * belong inside `title`, not in `actions`: a 18px pill in a row of 36px
 * controls steps the row.
 */
export function PageHeader({ title, subtitle, actions, className, ...rest }: PageHeaderProps) {
  return (
    <header className={className ? `lg-page-header ${className}` : "lg-page-header"} {...rest}>
      <div className="lg-page-header-lead">
        <h1 className="lg-page-header-title">{title}</h1>
        {subtitle != null && <p className="lg-page-header-subtitle">{subtitle}</p>}
      </div>
      {actions != null && <div className="lg-page-header-actions">{actions}</div>}
    </header>
  );
}
