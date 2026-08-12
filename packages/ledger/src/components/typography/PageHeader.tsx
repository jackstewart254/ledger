import type { HTMLAttributes, ReactNode } from "react";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Muted one-liner under the title. */
  subtitle?: ReactNode;
}

export function PageHeader({ title, subtitle, className, ...rest }: PageHeaderProps) {
  return (
    <header className={className ? `lg-page-header ${className}` : "lg-page-header"} {...rest}>
      <h1 className="lg-page-header-title">{title}</h1>
      {subtitle != null && <p className="lg-page-header-subtitle">{subtitle}</p>}
    </header>
  );
}
