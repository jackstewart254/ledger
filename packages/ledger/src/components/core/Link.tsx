import type { AnchorHTMLAttributes, ElementType } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /**
   * Element or component to render instead of `a` — a router's own link, say,
   * so the click stays a client-side route change rather than a document load:
   * `<Link as={NextLink} href="/x" />`. Unrecognised props are forwarded to it.
   * Defaults to `a`.
   */
  as?: ElementType;
};

/**
 * Link — the anchor: ink-coloured text under a hairline underline that fills in
 * to currentColor on hover, so a link inside a paragraph is legible without
 * being a coloured interruption in it.
 *
 * It has to exist because the kit ships no preflight — left alone, an <a> is
 * whatever blue the browser fancies.
 */
export function Link({ as: As = "a", className, children, ...rest }: LinkProps) {
  return (
    <As className={className ? `lg-link ${className}` : "lg-link"} {...rest}>
      {children}
    </As>
  );
}
