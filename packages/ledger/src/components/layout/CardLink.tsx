import type { AnchorHTMLAttributes, ElementType } from "react";
import { cx } from "../../internal/cx.js";

export type CardLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /**
   * Element or component to render instead of `a` — a router's own link, so
   * the click stays a client-side route change rather than a document load:
   * `<CardLink as={NextLink} href="/x">…</CardLink>`. Unrecognised props are
   * forwarded to it. Defaults to `a`.
   */
  as?: ElementType;
};

/**
 * CardLink — the stretched link that makes a whole `<Card interactive>`
 * clickable: an overlay pinned to the card's four edges, cut to its radius.
 *
 * It goes anywhere inside a `<Card interactive>` — first child by convention,
 * because that is where it reads, but the kit keys off the card rather than off
 * the overlay's position, so a CardLink rendered from a branch or a fragment
 * behaves identically. `interactive` is what makes the card the containing
 * block; the kit owns the rest — the radius, and lifting every control in the
 * card above the overlay so a nested `Link` or `Button` stays pressable with no
 * z-index anywhere at the call site.
 *
 * A sibling of the content, not a wrapper around it, because wrapping is
 * exactly what HTML forbids: an `<a>` may not contain another link or a button,
 * and a card with a PR chip and a Retry button in it does. Route A
 * (`<Card as="a">`) is the wrapper, and it is the right answer when the card
 * holds no other control.
 *
 * `children` are the link's accessible name and are not drawn — the overlay
 * covers text it does not own, so it has to say where it goes itself. Write the
 * destination ("Open run 8841"), not "Read more".
 *
 * The cost, which no stretched link escapes: the overlay owns the pointer, so
 * the text under it cannot be selected and a drag across the card drags the
 * link. If the card holds text worth copying and no other control, use route A.
 */
export function CardLink({ as: As = "a", className, children, ...rest }: CardLinkProps) {
  return (
    <As className={cx("lg-card-link", className)} draggable={false} {...rest}>
      <span className="lg-card-link-label">{children}</span>
    </As>
  );
}
