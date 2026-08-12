# Layout

Generated from `src/components/layout` — do not edit by hand, run `npm run docs`.

- [AppShell](#appshell) — The dashboard chrome: a bare rail on the page background and the content in a rounded pane floating beside it.
- [PageColumn](#pagecolumn) — The one centered column every page hangs from.
- [Card](#card) — The system's one surface: hairline border on --surface at radius-md, 1px inner top-highlight, border-only hover.

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

The system's one surface: hairline border on --surface at radius-md, 1px inner top-highlight, border-only hover. No shadow by design.

`Card` · props `CardProps` · [`packages/ledger/src/components/layout/Card.tsx`](../../packages/ledger/src/components/layout/Card.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `header` | `ReactNode` | — | Optional header row — hairline-separated, --row-h tall. |
| `children` | `ReactNode` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Card header={<SectionHeading title="VAT return · Q2" />}>
  <KeyValue items={[{ label: "Due", value: "7 August 2026" }]} />
</Card>
```
