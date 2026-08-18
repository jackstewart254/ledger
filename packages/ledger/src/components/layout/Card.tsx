import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../../internal/cx.js";

/* Flat rather than generic over `as`, matching Link and RailItem: the doc
   generator crawls these types and prints them, and a polymorphic
   `ComponentPropsWithoutRef<T>` prints as a page of nothing. The price is paid
   in both directions and is worth knowing before reading the list below. Going
   in: the anchor/button props are hand-listed, so a router prop outside that set
   (Next's `prefetch`) forwards at runtime but won't typecheck. Coming out: they
   are declared unconditionally rather than per-`as`, so `<Card href="/x">` on a
   plain div card typechecks and renders a meaningless attribute, and `disabled`
   does nothing unless `as="button"`. Neither is worth a generic that no one can
   read.

   The base moved from HTMLAttributes<HTMLDivElement> to <HTMLElement> with the
   same change, because the root is no longer always a div — which is why a
   handler annotated MouseEvent<HTMLDivElement> downstream has to widen. */
export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Optional header row — hairline-separated, --row-h tall. */
  header?: ReactNode;
  /**
   * Drop the body's padding. For the card that *is* its content — a list of
   * rows, a table — where the inset belongs to each row and not to the card.
   * The header keeps its own padding either way.
   */
  flush?: boolean;
  /**
   * Element or component to render instead of `div` — `"a"`, `"button"`, or a
   * router's own link so the click stays a client-side route change rather
   * than a document load: `<Card as={NextLink} href="/x" interactive />`.
   * Unrecognised props are forwarded to it. Defaults to `div`.
   */
  as?: ElementType;
  /**
   * Style the card as a control: pointer, border hover, and the containing
   * block a `CardLink` overlay needs. Defaults to `true` for `as="a"` and
   * `as="button"`, `false` otherwise — including for `as={NextLink}`, which
   * has to set it explicitly, because the kit is handed a function and cannot
   * see the `<a>` that function eventually renders.
   */
  interactive?: boolean;
  /** Route A, `as="a"`: the card's destination. */
  href?: string;
  target?: string;
  rel?: string;
  /** React types this `any`; the useful values are a filename or a bare flag. */
  download?: string | boolean;
  /** Route A, `as="button"`: defaults to `"button"`, never the UA's `submit`. */
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

/**
 * Card — the system's one surface: hairline border on --surface at radius-md,
 * border-only hover. No shadow by design.
 *
 * A clickable card has two routes. They are mutually exclusive in HTML rather
 * than a matter of taste, and each covers exactly what the other cannot, so
 * pick by what else is inside the card.
 *
 * Route A — the card IS the control:
 *
 *   <Card as="a" href="/runs/8841">…</Card>
 *   <Card as="button" onClick={open}>…</Card>
 *   <Card as={NextLink} href="/runs/8841" interactive>…</Card>
 *
 * Nothing is overlaid, so text inside stays selectable and hover, focus,
 * middle-click and the context menu are all the browser's own. The cost is an
 * HTML rule, not a limitation of this kit: an `<a>` may not contain another
 * link or a button, so route A is only for a card whose whole surface is the
 * single target.
 *
 * Route B — the card HOLDS a stretched link. `interactive`, with a `CardLink`
 * somewhere inside it (first, by convention, because that is where it reads):
 *
 *   <Card interactive>
 *     <CardLink href="/runs/8841">Open run 8841</CardLink>
 *     <Link href={pr}>#412</Link>
 *     <Button onClick={retry}>Retry</Button>
 *   </Card>
 *
 * The markup stays valid with controls inside, and the kit owns the overlay's
 * position, radius, z-index and accessible name — the nested link and button
 * ride above it with no z-index at the call site. The cost is the one every
 * stretched link pays and no implementation can avoid: the overlay owns the
 * pointer, so text under it cannot be selected.
 *
 * A plain `<Card>` is neither — a `<div>` with no cursor, no hover and no focus
 * ring, because a container that lights up as the pointer crosses it promises
 * an interaction it hasn't got.
 */
export function Card({
  header,
  children,
  className,
  flush = false,
  as: As = "div",
  interactive,
  ...rest
}: CardProps) {
  const isControl = interactive ?? (As === "a" || As === "button");
  /* Native HTML5 link-dragging is what makes text inside an anchor unselectable
     in the first place, and a card never wants its URL dragged out of the page.
     `type` because a card inside a form must not submit it. Both go in ahead of
     `rest`, so a call site that wants either back can just pass it. */
  const controlDefaults = isControl ? { draggable: false } : {};
  const buttonDefaults = As === "button" ? { type: "button" as const } : {};
  /* The other content-model rule, the one route A's `<a>` restriction is the
     famous half of: a `<button>` may hold phrasing content only, so the two
     wrappers become spans inside one. Classes are unchanged and the layout is
     not — the header is already `display: flex`, and `.lg-card-body` names
     `display: block` for exactly this. */
  const Wrap = As === "button" ? "span" : "div";
  return (
    <As
      className={cx("lg-card", isControl && "lg-card--interactive", className)}
      {...controlDefaults}
      {...buttonDefaults}
      {...rest}
    >
      {header != null && <Wrap className="lg-card-header">{header}</Wrap>}
      <Wrap className={cx("lg-card-body", flush && "lg-card-body--flush")}>{children}</Wrap>
    </As>
  );
}
