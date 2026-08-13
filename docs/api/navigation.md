# Navigation

Generated from `src/components/navigation` — do not edit by hand, run `npm run docs`.

- [Rail](#rail) — Icon-only 56px vertical rail.
- [RailItem](#railitem) — One glyph in the Rail.
- [Tabs](#tabs) — Rounded chips, no underline rail: inactive tabs are bare, the active one lifts to text-strong on a --surface-active cell.
- [Menu](#menu) — Anchored action menu (kebab/dropdown).
- [CommandMenu](#commandmenu) — The ⌘K palette.

## Components

### Rail

Icon-only 56px vertical rail. Items are glyphs; the label lives in a flyout chip that pops from the side on hover/focus (translucent surface + backdrop blur, the sanctioned shadow). Never inline labels, never letter tiles. Active item reads as a surface tint, not a color.

`Rail` · props `RailProps` · [`packages/ledger/src/components/navigation/Rail.tsx`](../../packages/ledger/src/components/navigation/Rail.tsx)

The items scroll on their own when a route list outgrows the viewport; the
footer sits outside that region, so a theme toggle or sign out stays put
instead of scrolling away with them.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` **·** required | `ReactNode` | — |  |
| `footer` | `ReactNode` | — | Pushed-to-bottom cluster (theme toggle, sign out). |
| `aria-label` | `string` | `"Primary"` |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Rail aria-label="Primary" footer={<RailItem icon={Settings} label="Settings" href="/settings" />}>
  <RailItem icon={LayoutDashboard} label="Overview" href="/" active />
  <RailItem icon={Receipt} label="Invoices" href="/invoices" />
</Rail>
```

### RailItem

One glyph in the Rail. `label` never renders inline: it is the item's accessible name and the text of the flyout chip, so the rail stays one icon wide whatever the labels say.

`RailItem` · props `RailItemProps` · [`packages/ledger/src/components/navigation/Rail.tsx`](../../packages/ledger/src/components/navigation/Rail.tsx)

The chip is the kit's Tooltip, portaled to &lt;body> and positioned fixed. It
used to be an absolutely positioned span inside the item, which cannot
survive the items region scrolling: a scroll container clips both axes (CSS
forces overflow-x to `auto` once overflow-y is), so the chip was cut off at
the 56px rail edge and dragged a horizontal scrollbar in with it.

Renders an anchor when `href` is set and a button otherwise — a destination
should be a real link, openable in a new tab, and an action should not be.
`active` follows that split too: aria-current="page" on the link,
aria-pressed on the button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` **·** required | `LucideIcon` | — |  |
| `label` **·** required | `string` | — | Flyout chip text — the item's only label. |
| `active` | `boolean` | `false` |  |
| `as` | `ElementType` | — | Render as another element — a router's Link, in practice: `<RailItem as={Link} href="/money" />`. Unrecognised props forward to it, so the router's own client-side navigation and prefetch apply and the rail stops reloading the document on every click. The kit imports no router; you pass yours. Defaults to `a` when `href` is set, `button` otherwise. |
| `href` | `string` | — | Renders an &lt;a> when set, a &lt;button> otherwise. |
| `onClick` | `(e: MouseEvent) => void` | — | Takes the event — a plain `<a>` item needs `e.preventDefault()` to be navigated in JS rather than by the browser. |

Also accepts every prop of `Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick">` — they are spread onto the underlying element.

```tsx
<RailItem icon={Receipt} label="Invoices" href="/invoices" active />
```

### Tabs

Rounded chips, no underline rail: inactive tabs are bare, the active one lifts to text-strong on a --surface-active cell. Arrow keys move selection (automatic activation). Controlled via `value`/`onChange`, uncontrolled via `defaultValue`.

`Tabs` · props `TabsProps` · [`packages/ledger/src/components/navigation/Tabs.tsx`](../../packages/ledger/src/components/navigation/Tabs.tsx)

Same cell as SegmentedControl, ungrouped. Reach for Tabs to move between
views, SegmentedControl to pick a value inside one.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` **·** required | `TabItem[]` | — |  |
| `value` | `string` | — |  |
| `defaultValue` | `string` | — |  |
| `onChange` | `(value: string, e?: MouseEvent<HTMLElement>) => void` | — | Fires on both pointer and keyboard selection. The event is present only for a click — call `preventDefault()` on it when the tab is an anchor and you are routing yourself. |
| `aria-label` | `string` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Tabs
  items={[
    { value: "all", label: "All" },
    { value: "unmatched", label: "Unmatched" },
    { value: "flagged", label: "Flagged" },
    { value: "archived", label: "Archived", disabled: true },
  ]}
  value={tab}
  onChange={setTab}
  aria-label="Transaction filter"
/>
```

### Menu

Anchored action menu (kebab/dropdown). Trigger + positioned panel (surface-raised, hairline, the sanctioned shadow). Arrow keys move focus, Enter/Space commit, Escape and click-outside close. Danger item variant for destructive actions.

`Menu` · props `MenuProps` · [`packages/ledger/src/components/navigation/Menu.tsx`](../../packages/ledger/src/components/navigation/Menu.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `trigger` **·** required | `ReactNode` | — | The element that toggles the menu — any clickable node. |
| `items` **·** required | `MenuItem[]` | — |  |
| `align` | `"start" \| "end"` | `"start"` | Panel alignment against the trigger. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Menu
  trigger={<IconButton icon={MoreHorizontal} label="Row actions" tooltip={false} />}
  align="end"
  items={[
    { id: "match", label: "Match to invoice", icon: Link2, onSelect: () => match(row) },
    { id: "flag", label: "Flag for review", onSelect: () => flag(row) },
    { id: "void", label: "Void", danger: true, onSelect: () => voidEntry(row) },
  ]}
/>
```

### CommandMenu

The ⌘K palette. Scrim + centered panel, borderless search input, filterable flat list with group labels. Arrow keys move selection, Enter commits, Escape closes. Focus trapped; scroll locked. Controlled: the consumer owns `open` and the item list. Portaled to &lt;body> so a transformed or filtered ancestor can never re-base its fixed positioning.

`CommandMenu` · props `CommandMenuProps` · [`packages/ledger/src/components/navigation/CommandMenu.tsx`](../../packages/ledger/src/components/navigation/CommandMenu.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` **·** required | `boolean` | — |  |
| `onClose` **·** required | `() => void` | — |  |
| `items` **·** required | `CommandMenuItem[]` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<CommandMenu
  open={open}
  onClose={() => setOpen(false)}
  items={[
    { id: "new-invoice", label: "New invoice", icon: Plus, onSelect: createInvoice },
    { id: "vat", label: "VAT return", group: "Go to", keywords: "hmrc tax", onSelect: () => go("/vat") },
  ]}
/>
```

## Types

### TabItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `string` | — |  |
| `label` **·** required | `ReactNode` | — |  |
| `disabled` | `boolean` | — |  |
| `as` | `ElementType` | — | Element or component to render this tab as instead of `button` — a router's own link, say, so a tab that changes route stays a client-side navigation. Ignored when `disabled` is set: the platform has no disabled anchor, and the native `button` is what the styling and the roving focus key off. Defaults to `button`. |
| `href` | `string` | — | Destination, passed through when `as` renders something anchor-like. |

### MenuItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Stable key — only needed when two items share a label. |
| `label` **·** required | `string` | — |  |
| `icon` | `LucideIcon` | — |  |
| `danger` | `boolean` | — |  |
| `disabled` | `boolean` | — |  |
| `as` | `ElementType` | — | Element or component to render this item as instead of `button` — a router's own link, say, so an item that navigates stays a client-side route change. Ignored when `disabled` is set: the platform has no disabled anchor, and the native `button` is what the styling and the arrow-key focus walk key off. Defaults to `button`. |
| `href` | `string` | — | Destination, passed through when `as` renders something anchor-like. |
| `onSelect` | `(e: MouseEvent<HTMLElement>) => void` | — | Call `preventDefault()` on the event when the item is an anchor and you are routing yourself. |

### CommandMenuItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` **·** required | `string` | — |  |
| `label` **·** required | `string` | — |  |
| `group` | `string` | — |  |
| `icon` | `LucideIcon` | — |  |
| `keywords` | `string` | — | Extra match terms beyond the label. |
| `onSelect` | `() => void` | — |  |
