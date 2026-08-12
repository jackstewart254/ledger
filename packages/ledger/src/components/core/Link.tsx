import type { AnchorHTMLAttributes } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function Link({ className, children, ...rest }: LinkProps) {
  return (
    <a className={className ? `lg-link ${className}` : "lg-link"} {...rest}>
      {children}
    </a>
  );
}
