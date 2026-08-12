import type { AnchorHTMLAttributes } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Link — the anchor: ink-coloured text under a hairline underline that fills in
 * to currentColor on hover, so a link inside a paragraph is legible without
 * being a coloured interruption in it.
 *
 * It has to exist because the kit ships no preflight — left alone, an <a> is
 * whatever blue the browser fancies.
 */
export function Link({ className, children, ...rest }: LinkProps) {
  return (
    <a className={className ? `lg-link ${className}` : "lg-link"} {...rest}>
      {children}
    </a>
  );
}
