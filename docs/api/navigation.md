# Navigation

Generated from `src/components/navigation` — do not edit by hand, run `npm run docs`.

- [Rail](#rail) — Icon-only 56px vertical rail.
- [RailItem](#railitem)
- [Tabs](#tabs) — Hairline bottom-border group; the active tab lifts to text-strong and carries an ink underline indicator.
- [Menu](#menu) — Anchored action menu (kebab/dropdown).
- [CommandMenu](#commandmenu) — The ⌘K palette.

## Components

### Rail

Icon-only 56px vertical rail. Items are glyphs; the label lives in a flyout chip that pops from the side on hover/focus (translucent surface + backdrop blur, the sanctioned shadow). Never inline labels, never letter tiles. Active item reads as a surface tint, not a color.

`Rail` · props `RailProps` · [`packages/ledger/src/components/navigation/Rail.tsx`](../../packages/ledger/src/components/navigation/Rail.tsx)

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

`RailItem` · props `RailItemProps` · [`packages/ledger/src/components/navigation/Rail.tsx`](../../packages/ledger/src/components/navigation/Rail.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` **·** required | `LucideIcon` | — |  |
| `label` **·** required | `string` | — | Flyout chip text — the item's only label. |
| `active` | `boolean` | `false` |  |
| `href` | `string` | — | Renders an &lt;a> when set, a &lt;button> otherwise. |
| `onClick` | `() => void` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<RailItem icon={Receipt} label="Invoices" href="/invoices" active />
```

### Tabs

Hairline bottom-border group; the active tab lifts to text-strong and carries an ink underline indicator. Arrow keys move selection (automatic activation). Controlled via `value`/`onChange`, uncontrolled via `defaultValue`.

`Tabs` · props `TabsProps` · [`packages/ledger/src/components/navigation/Tabs.tsx`](../../packages/ledger/src/components/navigation/Tabs.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` **·** required | `TabItem[]` | — |  |
| `value` | `string` | — |  |
| `defaultValue` | `string` | — |  |
| `onChange` | `(value: string) => void` | — |  |
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

Tabs — hairline bottom-border group; the active tab lifts to text-strong and carries an ink underline indicator. Arrow keys move selection (automatic activation). Controlled via `value`/`onChange`, uncontrolled via `defaultValue`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `string` | — |  |
| `label` **·** required | `ReactNode` | — |  |
| `disabled` | `boolean` | — |  |

### MenuItem

Menu — anchored action menu (kebab/dropdown). Trigger + positioned panel (surface-raised, hairline, the sanctioned shadow). Arrow keys move focus, Enter/Space commit, Escape and click-outside close. Danger item variant for destructive actions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Stable key — only needed when two items share a label. |
| `label` **·** required | `string` | — |  |
| `icon` | `LucideIcon` | — |  |
| `danger` | `boolean` | — |  |
| `disabled` | `boolean` | — |  |
| `onSelect` | `() => void` | — |  |

### CommandMenuItem

CommandMenu — the ⌘K palette. Scrim + centered panel, borderless search input, filterable flat list with group labels. Arrow keys move selection, Enter commits, Escape closes. Focus trapped; scroll locked. Controlled: the consumer owns `open` and the item list. Portaled to &lt;body> so a transformed or filtered ancestor can never re-base its fixed positioning.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` **·** required | `string` | — |  |
| `label` **·** required | `string` | — |  |
| `group` | `string` | — |  |
| `icon` | `LucideIcon` | — |  |
| `keywords` | `string` | — | Extra match terms beyond the label. |
| `onSelect` | `() => void` | — |  |
