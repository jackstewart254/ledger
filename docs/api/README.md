# API reference

Every prop of every exported component, generated from the TypeScript source
by `packages/ledger/scripts/gen-api-docs.mjs`. Do not edit these files by hand —
run `npm --prefix packages/ledger run docs`.

```tsx
import { Table, SummaryCard } from "@mcleanstewart/ledger";
import "@mcleanstewart/ledger/styles.css";
```

## [Core](core.md) · 11

- [Icon](core.md#icon) — The styling wrapper around a lucide-react glyph (ISC licensed, the system's one sanctioned runtime dependency).
- [Button](core.md#button) — Single size on purpose — the kit ships one button height, no `size` prop.
- [IconButton](core.md#iconbutton) — The icon-only control.
- [Badge](core.md#badge)
- [StatusPill](core.md#statuspill) — Single size on purpose — the kit ships one pill height, no `size` prop.
- [StatusDot](core.md#statusdot)
- [CountBadge](core.md#countbadge)
- [Avatar](core.md#avatar)
- [Kbd](core.md#kbd)
- [Divider](core.md#divider)
- [Link](core.md#link)

## [Typography](typography.md) · 2

- [PageHeader](typography.md#pageheader) — The view title block (replaces the 8×-copy-pasted heading).
- [SectionHeading](typography.md#sectionheading)

## [Layout](layout.md) · 3

- [AppShell](layout.md#appshell) — The dashboard chrome: a bare rail on the page background and the content in a rounded pane floating beside it.
- [PageColumn](layout.md#pagecolumn) — The one centered column every page hangs from.
- [Card](layout.md#card) — The system's one surface: hairline border on --surface at radius-md, 1px inner top-highlight, border-only hover.

## [Navigation](navigation.md) · 5

- [Rail](navigation.md#rail) — Icon-only 56px vertical rail.
- [RailItem](navigation.md#railitem)
- [Tabs](navigation.md#tabs) — Rounded chips, no underline rail: inactive tabs are bare, the active one lifts to text-strong on a --surface-active cell.
- [Menu](navigation.md#menu) — Anchored action menu (kebab/dropdown).
- [CommandMenu](navigation.md#commandmenu) — The ⌘K palette.

## [Forms](forms.md) · 13

- [FormField](forms.md#formfield) — Label + control slot + error line.
- [Input](forms.md#input) — Text field on the shared .lg-control frame.
- [DatePicker](forms.md#datepicker) — .lg-control trigger + an anchored month grid.
- [Select](forms.md#select) — Styled native &lt;select> on the .lg-control frame, chevron overlay.
- [SearchField](forms.md#searchfield) — Input frame + search icon + clear button.
- [MultiSelect](forms.md#multiselect) — Trigger with chip summary + checkbox popover list.
- [FilterChip](forms.md#filterchip) — Toggleable chip.
- [Textarea](forms.md#textarea) — The Input voice, auto min-height via --row-h multiples.
- [Checkbox](forms.md#checkbox) — Styled native input, custom-drawn box, Lucide check/minus mark.
- [RadioGroup](forms.md#radiogroup) — Styled native radios, matches the Checkbox voice.
- [Switch](forms.md#switch) — Track + thumb toggle.
- [SegmentedControl](forms.md#segmentedcontrol) — Exclusive picker in a hairline group; the active segment raises to --surface-raised.
- [RangeInput](forms.md#rangeinput) — A native range with a filled track: the accent up to the thumb, faint after it, so the value reads at a glance instead of being inferred from the thumb's position against nothing.

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
| `trapFocus` | `(container: HTMLElement) => () => void` |  |
| `useFocusTrap` | `<T extends HTMLElement = HTMLElement>(active?: boolean) => RefObject<T \| null>` |  |
| `lockBodyScroll` | `() => void` |  |
| `unlockBodyScroll` | `() => void` |  |
| `compactNumber` | `(n: number \| null \| undefined) => string` |  |
| `formatDate` | `(value: string \| number \| Date \| null \| undefined, locale?: string) => string` | Human date — "11 Aug 2026". ISO strings belong in the data layer, not on screen: `2026-08-11` makes the reader parse a format before reading a date, and a column of them reads as serial numbers. Native Intl, no dependency. |
| `pct` | `(n: number \| null \| undefined, digits?: number) => string` |  |

_54 components, 26 exported types, 7 utilities._
