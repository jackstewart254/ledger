# Layout

Generated from `src/components/layout` — do not edit by hand, run `npm run docs`.

- [AppShell](#appshell) — The dashboard chrome: a bare rail on the page background and the content in a rounded pane floating beside it.
- [PageColumn](#pagecolumn) — The one centered column every page hangs from.
- [Card](#card) — The system's one surface: hairline border on --surface at radius-md, border-only hover.
- [CardLink](#cardlink) — The stretched link that makes a whole `<Card interactive>` clickable: an overlay pinned to the card's four edges, cut to its radius.

## Components

### AppShell

The dashboard chrome: a bare rail on the page background and the content in a rounded pane floating beside it. Header and main share that one pane rather than each owning a panel with its own fill and divider. Defaults to viewport height; size the root (className/style) to frame it.

`AppShell` · props `AppShellProps` · [`packages/ledger/src/components/layout/AppShell.tsx`](../../packages/ledger/src/components/layout/AppShell.tsx)

The header is three fixed slots, not a free-form flex row: search sits dead
centre in every app that uses the shell, so its position is the shell's
decision and not something each page re-derives with margin tricks.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rail` | `ReactNode` | — | Left icon-rail slot — fixed --rail-w column (56px), matching Rail's width. |
| `header` | `ReactNode` | — | Header left slot — identity and location: breadcrumb, page context. |
| `search` | `ReactNode` | — | Header centre slot — search, always, optionally flanked by the controls that act on what it searches. Centred on the pane, not on whatever the left and right slots happen to weigh. |
| `actions` | `ReactNode` | — | Header right slot — actions and view switches. |
| `children` | `ReactNode` | — | Scrollable main content. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<AppShell
  rail={<Rail>{navItems}</Rail>}
  search={<SearchField placeholder="Search transactions" />}
  actions={<IconButton icon={Bell} label="Notifications" />}
>
  <PageColumn>{page}</PageColumn>
</AppShell>
```

### PageColumn

The one centered column every page hangs from. Reads --page-max-width / --page-gutter.

`PageColumn` · props `PageColumnProps` · [`packages/ledger/src/components/layout/PageColumn.tsx`](../../packages/ledger/src/components/layout/PageColumn.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fullBleed` | `boolean` | `false` | Opt out of max-width + gutters — kills the negative-margin hack. |
| `children` | `ReactNode` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<PageColumn>
  <PageHeader title="Ledger" />
  <Card>{table}</Card>
</PageColumn>
```

### Card

The system's one surface: hairline border on --surface at radius-md, border-only hover. No shadow by design.

`Card` · props `CardProps` · [`packages/ledger/src/components/layout/Card.tsx`](../../packages/ledger/src/components/layout/Card.tsx)

A clickable card has two routes. They are mutually exclusive in HTML rather
than a matter of taste, and each covers exactly what the other cannot, so
pick by what else is inside the card.

Route A — the card IS the control:

```text
  <Card as="a" href="/runs/8841">…</Card>
  <Card as="button" onClick={open}>…</Card>
  <Card as={NextLink} href="/runs/8841" interactive>…</Card>
```

Nothing is overlaid, so text inside stays selectable and hover, focus,
middle-click and the context menu are all the browser's own. The cost is an
HTML rule, not a limitation of this kit: an `<a>` may not contain another
link or a button, so route A is only for a card whose whole surface is the
single target.

Route B — the card HOLDS a stretched link. `interactive`, with a `CardLink`
somewhere inside it (first, by convention, because that is where it reads):

```text
  <Card interactive>
    <CardLink href="/runs/8841">Open run 8841</CardLink>
    <Link href={pr}>#412</Link>
    <Button onClick={retry}>Retry</Button>
  </Card>
```

The markup stays valid with controls inside, and the kit owns the overlay's
position, radius, z-index and accessible name — the nested link and button
ride above it with no z-index at the call site. The cost is the one every
stretched link pays and no implementation can avoid: the overlay owns the
pointer, so text under it cannot be selected.

A plain `<Card>` is neither — a `<div>` with no cursor, no hover and no focus
ring, because a container that lights up as the pointer crosses it promises
an interaction it hasn't got.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `header` | `ReactNode` | — | Optional header row — hairline-separated, --row-h tall. |
| `flush` | `boolean` | `false` | Drop the body's padding. For the card that *is* its content — a list of rows, a table — where the inset belongs to each row and not to the card. The header keeps its own padding either way. |
| `as` | `ElementType` | `"div"` | Element or component to render instead of `div` — `"a"`, `"button"`, or a router's own link so the click stays a client-side route change rather than a document load: `<Card as={NextLink} href="/x" interactive />`. Unrecognised props are forwarded to it. Defaults to `div`. |
| `interactive` | `boolean` | — | Style the card as a control: pointer, border hover, and the containing block a `CardLink` overlay needs. Defaults to `true` for `as="a"` and `as="button"`, `false` otherwise — including for `as={NextLink}`, which has to set it explicitly, because the kit is handed a function and cannot see the `<a>` that function eventually renders. |
| `href` | `string` | — | Route A, `as="a"`: the card's destination. |
| `target` | `string` | — |  |
| `rel` | `string` | — |  |
| `download` | `string \| boolean` | — | React types this `any`; the useful values are a filename or a bare flag. |
| `type` | `"button" \| "submit" \| "reset"` | — | Route A, `as="button"`: defaults to `"button"`, never the UA's `submit`. |
| `disabled` | `boolean` | — |  |

Also accepts every prop of `HTMLAttributes<HTMLElement>` — they are spread onto the underlying element.

```tsx
<Card header={<SectionHeading title="VAT return · Q2" />}>
  <KeyValue items={[{ label: "Due", value: "7 August 2026" }]} />
</Card>

{/* Route A — the card is the link. Nothing else in it may be a control. */}
<Card as="a" href="/vat/2026-q2" header={<SectionHeading title="VAT return · Q2" />}>
  <KeyValue items={[{ label: "Due", value: "7 August 2026" }]} />
</Card>
```

### CardLink

The stretched link that makes a whole `<Card interactive>` clickable: an overlay pinned to the card's four edges, cut to its radius.

`CardLink` · props `CardLinkProps` · [`packages/ledger/src/components/layout/CardLink.tsx`](../../packages/ledger/src/components/layout/CardLink.tsx)

It goes anywhere inside a `<Card interactive>` — first child by convention,
because that is where it reads, but the kit keys off the card rather than off
the overlay's position, so a CardLink rendered from a branch or a fragment
behaves identically. `interactive` is what makes the card the containing
block; the kit owns the rest — the radius, and lifting every control in the
card above the overlay so a nested `Link` or `Button` stays pressable with no
z-index anywhere at the call site.

A sibling of the content, not a wrapper around it, because wrapping is
exactly what HTML forbids: an `<a>` may not contain another link or a button,
and a card with a PR chip and a Retry button in it does. Route A
(`<Card as="a">`) is the wrapper, and it is the right answer when the card
holds no other control.

`children` are the link's accessible name and are not drawn — the overlay
covers text it does not own, so it has to say where it goes itself. Write the
destination ("Open run 8841"), not "Read more".

The cost, which no stretched link escapes: the overlay owns the pointer, so
the text under it cannot be selected and a drag across the card drags the
link. If the card holds text worth copying and no other control, use route A.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `ElementType` | `"a"` | Element or component to render instead of `a` — a router's own link, so the click stays a client-side route change rather than a document load: `<CardLink as={NextLink} href="/x">…</CardLink>`. Unrecognised props are forwarded to it. Defaults to `a`. _(inherited)_ |

Also accepts every prop of `AnchorHTMLAttributes<HTMLAnchorElement> & { /** * Element or component to render instead of `a` — a router's own link, so * the click stays a client-side route change rather than a document load: * `<CardLink as={NextLink} href="/x">…</CardLink>`. Unrecognised props are * forwarded to it. Defaults to `a`. */ as?: ElementType; }` — they are spread onto the underlying element.

```tsx
{/* Route B — the card holds a stretched link, so the chip and the
    button inside it stay real controls and need no z-index. */}
<Card interactive header={<SectionHeading title="INV-2214 · Marlow Joinery" />}>
  <CardLink href="/invoices/2214">Open invoice INV-2214</CardLink>
  <KeyValue items={[{ label: "Due", value: "7 August 2026" }]} />
  <Link href="https://find-and-update.company-information.service.gov.uk">Companies House</Link>
  <Button onClick={sendReminder}>Send reminder</Button>
</Card>
```
