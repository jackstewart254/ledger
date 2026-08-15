# API reference

Every prop of every exported component, generated from the TypeScript source
by `packages/ledger/scripts/gen-api-docs.mjs`. Do not edit these files by hand —
run `npm --prefix packages/ledger run docs`.

```tsx
import { Table, SummaryCard } from "@mcleanstewart/ledger";
import "@mcleanstewart/ledger/styles.css";
```

## Reading these tables

**Client component** marks a component whose file carries `"use client"` — 32
of 55. A **·** `function` tag marks a prop whose type is a function.

In a React Server Components app the pair is a trap. A client component
renders from a server component perfectly well, so nothing warns you — but a
function prop cannot be sent to it, and that call typechecks, survives
`next build`, and throws the first time the route renders. `format` and
`rowKey` are the ones that catch people: they read as pure formatting rather
than interaction, and the boundary does not care what a prop reads as.
[Recipe 7](../recipes.md#7-charts-and-tables-under-a-server-component) is the
wrapper that fixes it.

## [Core](core.md) · 11

- [Icon](core.md#icon) — The styling wrapper around a lucide-react glyph (ISC licensed, the system's one sanctioned runtime dependency).
- [Button](core.md#button) — Single size on purpose — the kit ships one button height, no `size` prop.
- [IconButton](core.md#iconbutton) — The icon-only control.
- [Badge](core.md#badge) — A label on a thing: "Pending", "prod", "Over budget".
- [StatusPill](core.md#statuspill) — Single size on purpose — the kit ships one pill height, no `size` prop.
- [StatusDot](core.md#statusdot) — The bare dot, for when the thing already has a name beside it.
- [CountBadge](core.md#countbadge) — A number and nothing else: nav counts, tab counts, queue depth in a cell.
- [Avatar](core.md#avatar) — Image with an initials fallback and an optional corner indicator.
- [Kbd](core.md#kbd) — One key cap: hairline box, mono, tabular figures, and a min-width equal to its height so "K" and "⌘" are the same square.
- [Divider](core.md#divider) — The kit's hairline as an element, since separation here is a 1px border rather than a shadow.
- [Link](core.md#link) — The anchor: ink-coloured text under a hairline underline that fills in to currentColor on hover, so a link inside a paragraph is legible without being a coloured interruption in it.

## [Typography](typography.md) · 2

- [PageHeader](typography.md#pageheader) — The view title block (replaces the 8×-copy-pasted heading).
- [SectionHeading](typography.md#sectionheading) — The title row for a section inside a page: a heading and an optional actions slot on the same line.

## [Layout](layout.md) · 3

- [AppShell](layout.md#appshell) — The dashboard chrome: a bare rail on the page background and the content in a rounded pane floating beside it.
- [PageColumn](layout.md#pagecolumn) — The one centered column every page hangs from.
- [Card](layout.md#card) — The system's one surface: hairline border on --surface at radius-md, 1px inner top-highlight, border-only hover.

## [Navigation](navigation.md) · 5

- [Rail](navigation.md#rail) — Icon-only 56px vertical rail.
- [RailItem](navigation.md#railitem) — One glyph in the Rail.
- [Tabs](navigation.md#tabs) — Rounded chips, no underline rail: inactive tabs are bare, the active one lifts to text-strong on a --surface-active cell.
- [Menu](navigation.md#menu) — Anchored action menu (kebab/dropdown).
- [CommandMenu](navigation.md#commandmenu) — The ⌘K palette.

## [Forms](forms.md) · 14

- [FormField](forms.md#formfield) — Label + control slot + error line.
- [Input](forms.md#input) — Text field on the shared .lg-control frame.
- [DatePicker](forms.md#datepicker) — .lg-control trigger + an anchored month grid.
- [Select](forms.md#select) — Styled native &lt;select> on the .lg-control frame, chevron overlay.
- [SearchField](forms.md#searchfield) — Input frame + search icon + clear button.
- [MultiSelect](forms.md#multiselect) — Trigger with chip summary + checkbox popover list.
- [FilterToggle](forms.md#filtertoggle) — Toggleable chip.
- [Textarea](forms.md#textarea) — The Input voice, auto min-height via --row-h multiples.
- [Checkbox](forms.md#checkbox) — Styled native input, custom-drawn box, Lucide check/minus mark.
- [RadioGroup](forms.md#radiogroup) — Styled native radios, matches the Checkbox voice.
- [Switch](forms.md#switch) — Track + thumb toggle.
- [SegmentedControl](forms.md#segmentedcontrol) — Exclusive picker in a hairline group; the active segment raises to --surface-raised.
- [Slider](forms.md#slider) — A native range with a filled track: the accent up to the thumb, faint after it, so the value reads at a glance instead of being inferred from the thumb's position against nothing.
- [RangeSlider](forms.md#rangeslider) — A genuine two-ended range: `{min, max}` in, `{min, max}` out.

## [Data](data.md) · 10

- [Table](data.md#table) — Render-prop columns, row hover, 42px rows (--lg-table-row-h, which defaults to --control-h-lg; override per instance with `rowHeight`).
- [MetricDelta](data.md#metricdelta) — A signed change as a tinted badge: good green, bad red, grey at zero.
- [Sparkline](data.md#sparkline) — Tiny inline SVG polyline from a number[].
- [TrendChart](data.md#trendchart) — Area chart: gradient fill under a hairline-thin line, grid at rounded tick values, y ticks in the left gutter, x labels at the ends.
- [BarChart](data.md#barchart) — The log-panel series: caps micro-label, headline figure and secondary counts, then a dense bar run with start/end labels beneath.
- [CompareChart](data.md#comparechart) — One measure over two periods: the current period in accent, the previous behind it as the comparison.
- [SummaryCard](data.md#summarycard) — One card for the whole summary board: title and its verdict on the head line, the figure under it, a caption saying what the figure is measured against, then whatever fills the rest.
- [SummarySplit](data.md#summarysplit) — One figure broken into its shares: "64% Mobile · 30% Desktop · 6% Tablet", hairline-separated, the leading share emphasised.
- [KeyValue](data.md#keyvalue) — Label/value meta pairs: muted label, tabular value, hairline separators.
- [Pagination](data.md#pagination) — Controlled: hairline chevron buttons + a fixed-width run of page numerals.

## [Feedback](feedback.md) · 10

- [Modal](feedback.md#modal) — Centered dialog on the scrim.
- [Drawer](feedback.md#drawer) — Right-side sheet for filters/details.
- [Toast](feedback.md#toast) — Transient notification for the bottom-right stack.
- [ToastViewport](feedback.md#toastviewport) — Fixed bottom-right stack for toasts — outranks every interactive layer.
- [Tooltip](feedback.md#tooltip) — Hover/focus label.
- [InlineAlert](feedback.md#inlinealert) — One line, always: tone glyph, the headline, an info glyph carrying the detail, then whatever you can do about it.
- [EmptyState](feedback.md#emptystate) — A muted glyph, one line, and an action if there is one to take.
- [Skeleton](feedback.md#skeleton) — Shimmer loading placeholder.
- [Spinner](feedback.md#spinner) — Minimal stroke arc on currentColor; inherits the text color of its context.
- [Progress](feedback.md#progress) — Hairline track + accent fill, 0 to max.

## Utilities

| Export | Signature | Summary |
| --- | --- | --- |
| `trapFocus` | `(container: HTMLElement) => () => void` | Shared dialog focus trap. One behavior for every dialog surface (Modal, Drawer, CommandMenu): move focus to the first focusable inside on open, wrap Tab/Shift+Tab within the container, and hand focus back to the opener on close. Hand-rolled — no dependency. |
| `useFocusTrap` | `<T extends HTMLElement = HTMLElement>(active?: boolean) => RefObject<T \| null>` | Hook form: attach the returned ref to the dialog root; `active` mirrors the open state so mount-once components (command palette) re-arm per open. |
| `lockBodyScroll` | `() => void` | Body scroll-lock shared by every overlay that parks page scroll (Modal, Drawer, CommandMenu). A module-level counter so OVERLAPPING dialogs can't clobber each other: A opens, B opens, A closes — the body stays locked until the LAST holder releases. |
| `unlockBodyScroll` | `() => void` | Releases one hold; page scroll comes back when the last holder lets go. |
| `compactNumber` | `(n: number \| null \| undefined) => string` | Compact figure for a metric — 1284 becomes "1.3k", 2_400_000 becomes "2.4M". One decimal below ten of a unit and none above ("1.3k", "12k"); anything under a thousand prints as itself. Nullish and non-finite give an em dash, so a metric that never arrived reads as missing rather than as "NaN". |
| `formatDate` | `(value: string \| number \| Date \| null \| undefined, locale?: string) => string` | Human date — "11 Aug 2026". ISO strings belong in the data layer, not on screen: `2026-08-11` makes the reader parse a format before reading a date, and a column of them reads as serial numbers. Native Intl, no dependency. |
| `pct` | `(n: number \| null \| undefined, digits?: number) => string` | Percentage to `digits` places — 12.53 becomes "12.5%". Nullish and non-finite give an em dash, as compactNumber does. |

_55 components, 32 exported types, 7 utilities._
