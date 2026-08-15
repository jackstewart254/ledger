# Data

Generated from `src/components/data` — do not edit by hand, run `npm run docs`.

- [Table](#table) — Render-prop columns, row hover, 42px rows (--lg-table-row-h, which defaults to --control-h-lg; override per instance with `rowHeight`).
- [MetricDelta](#metricdelta) — A signed change as a tinted badge: good green, bad red, grey at zero.
- [Sparkline](#sparkline) — Tiny inline SVG polyline from a number[].
- [TrendChart](#trendchart) — Area chart: gradient fill under a hairline-thin line, grid at rounded tick values, y ticks in the left gutter, x labels at the ends.
- [BarChart](#barchart) — The log-panel series: caps micro-label, headline figure and secondary counts, then a dense bar run with start/end labels beneath.
- [CompareChart](#comparechart) — One measure over two periods: the current period in accent, the previous behind it as the comparison.
- [SummaryCard](#summarycard) — One card for the whole summary board: title and its verdict on the head line, the figure under it, a caption saying what the figure is measured against, then whatever fills the rest.
- [SummarySplit](#summarysplit) — One figure broken into its shares: "64% Mobile · 30% Desktop · 6% Tablet", hairline-separated, the leading share emphasised.
- [KeyValue](#keyvalue) — Label/value meta pairs: muted label, tabular value, hairline separators.
- [Pagination](#pagination) — Controlled: hairline chevron buttons + a fixed-width run of page numerals.

## Components

### Table

Render-prop columns, row hover, 42px rows (--lg-table-row-h, which defaults to --control-h-lg; override per instance with `rowHeight`).

`Table<Row>` · props `TableProps<Row>` · [`packages/ledger/src/components/data/Table.tsx`](../../packages/ledger/src/components/data/Table.tsx)

The header row is in the DOM but hidden visually: a column of dates under a
heading that reads "Date" tells the reader what they already worked out, and
on a full-page table those labels are the only chrome left. Screen readers
still get them, so the table stays navigable by column.

It un-hides itself when it has something to hold — a `sortable` column, or
selection — because that is the point at which the header stops being a
restatement of the data and becomes a row of controls. That is keyed off the
props, not exposed as one: there is nothing for a consumer to remember, and
a sort control with nothing visible to click is worse than no sorting at all.
Once visible it is also sticky, so `maxHeight` scrolls the body under it.

Sorting and selection are both fully controlled and neither touches `rows`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` **·** required | `TableColumn<Row>[]` | — |  |
| `rows` **·** required | `Row[]` | — |  |
| `rowKey` | `(row: Row, index: number) => TableRowKey` | — | Row identity. Also the selection key, so give it something stable: with the index fallback, selection follows a row's POSITION, and sorting the rows then moves the ticks to different records. |
| `onRowClick` | `(row: Row) => void` | — |  |
| `rowHeight` | `string` | — | Row-height override — sets the --lg-table-row-h custom prop. |
| `maxHeight` | `string` | — | Caps the scroll container's height. A visible header row (see the note on the component) pins itself to the top of that container as the body scrolls — there is no prop for it, because a scrolling table that loses its headings is only ever worse. |
| `sort` | `TableSort \| null` | — | Current sort, or null/undefined for none. Fully controlled: the kit draws the header affordance and the direction arrow, the CONSUMER owns the comparator and passes rows already in order. Nothing here re-orders `rows` — a component that sorts your data owns state you can't see, and the sort you want ("live first, then name") is rarely the one it would guess. |
| `onSortChange` | `(sort: TableSort) => void` | — | Fires with the next sort when a sortable header is activated: a new column starts at "asc", the sorted column flips direction. Two states only — there is no third click back to unsorted. |
| `selectedKeys` | `ReadonlySet<TableRowKey>` | — | Selected row keys (from `rowKey`). Fully controlled — pass this together with `onSelectionChange` to get the checkbox column. |
| `onSelectionChange` | `(keys: Set<TableRowKey>) => void` | — | Fires with the next selection. The header checkbox adds or removes every key in the CURRENT `rows`, leaving keys outside them alone, so selecting on a filtered or paged view doesn't silently drop what's off-screen. |
| `empty` | `ReactNode` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Table
  columns={[
    { key: "date", header: "Date", width: "110px", render: (r) => formatDate(r.date) },
    { key: "counterparty", header: "Counterparty" },
    { key: "reference", header: "Reference", width: "150px" },
    {
      key: "amount",
      header: "Amount",
      width: "120px",
      align: "right",
      numeric: true,
      render: (r) => `£${r.amount.toLocaleString("en-GB")}`,
    },
    { key: "status", header: "Status", width: "120px", render: (r) => <StatusPill status={r.status} /> },
  ]}
  rows={transactions}
  rowKey={(r) => r.id}
  onRowClick={(r) => openTransaction(r.id)}
  maxHeight="60vh"
  empty="Nothing to reconcile"
/>
```

### MetricDelta

A signed change as a tinted badge: good green, bad red, grey at zero.

`MetricDelta` · props `MetricDeltaProps` · [`packages/ledger/src/components/data/MetricDelta.tsx`](../../packages/ledger/src/components/data/MetricDelta.tsx)

No arrow glyph and no "+": the sign is already in the number and the colour
already carries the direction, so an arrow is the third copy of one fact.

Colour comes from the sign AND the metric's polarity. An `invert` boolean was
refused here once, on the grounds that a falling number rendered green
misleads — true, but the refusal made every lower-is-better metric (latency,
queue depth, error rate) paint its bad news green, and pushed consumers into
hand-rolled Badges beside real deltas in the same row. `polarity` says which
direction is good instead of asking the caller to flip a colour.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `number` | — |  |
| `suffix` | `string` | `"%"` | Appended to the default rendering (ignored when `format` is given). |
| `format` | `(value: number) => string` | — |  |
| `polarity` | `MetricPolarity` | `"higher-is-better"` | Defaults to higher-is-better — revenue, uptime, runs completed. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<MetricDelta value={12.5} />                                 {/* revenue up — green */}
<MetricDelta value={-4.2} polarity="lower-is-better" />     {/* debtor days down — green */}
<MetricDelta value={1.8} suffix=" days" polarity="lower-is-better" />
```

### Sparkline

Tiny inline SVG polyline from a number[]. Stroke --chart-line, optional --chart-fill area. No lib.

`Sparkline` · props `SparklineProps` · [`packages/ledger/src/components/data/Sparkline.tsx`](../../packages/ledger/src/components/data/Sparkline.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` **·** required | `number[]` | — |  |
| `width` | `number` | `80` |  |
| `height` | `number` | `24` |  |
| `fill` | `boolean` | `false` | Area fill under the line — --chart-fill fading to transparent. |
| `strokeWidth` | `number` | `1.5` |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Sparkline data={[38, 41, 39, 44, 47, 46, 52]} fill />
```

### TrendChart

Area chart: gradient fill under a hairline-thin line, grid at rounded tick values, y ticks in the left gutter, x labels at the ends. On hover, a crosshair, a dot on the nearest point and a readout.

`TrendChart` · props `TrendChartProps` · [`packages/ledger/src/components/data/TrendChart.tsx`](../../packages/ledger/src/components/data/TrendChart.tsx)

Draws at its measured width (see useChartWidth), so it fills a fluid column
instead of scaling its own type up with a fixed viewBox.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` **·** required | `number[]` | — |  |
| `labels` | `string[]` | — | Per-point labels. The ends are drawn on the x axis; all of them read out on hover. |
| `width` | `number` | `560` | Drawing width before the container is measured (SSR / first paint). |
| `height` | `number` | `200` |  |
| `area` | `boolean` | `true` | Gradient area fill under the line. |
| `format` | `(value: number) => string` | `String` | Tick + readout formatter (mono, tabular). |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<TrendChart
  data={[184, 192, 188, 205, 231, 226, 244]}
  labels={["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
  format={(v) => `£${v}k`}
/>
```

### BarChart

The log-panel series: caps micro-label, headline figure and secondary counts, then a dense bar run with start/end labels beneath.

`BarChart` · props `BarChartProps` · [`packages/ledger/src/components/data/BarChart.tsx`](../../packages/ledger/src/components/data/BarChart.tsx)

Ordinary buckets are the accent; a `tone` bar is the exception that should
catch the eye, which is what a red error spike does against a run of blue.
One exception, derived rather than configured: once ANY bucket carries a
tone the series is a health series, so the untoned bars go green — among
reds and ambers, blue would be the only colour saying nothing.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` **·** required | `BarChartDatum[]` | — |  |
| `label` | `ReactNode` | — | Caps micro-label above the figure. |
| `value` | `ReactNode` | — | Headline figure — the total the series sums to. |
| `meta` | `ReactNode` | — | Secondary counts, on the figure's baseline. |
| `format` | `(value: number) => string` | `String` | Tooltip value formatter. |
| `height` | `string` | — | CSS length for the plot area — the width always comes from the container. |
| `xStartLabel` | `ReactNode` | — |  |
| `xEndLabel` | `ReactNode` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<BarChart
  label="Payments received"
  value="£208,415"
  meta="1,284 transactions"
  data={[
    { label: "Barclays", value: 128400 },
    { label: "Starling", value: 61265 },
    { label: "Revolut", value: 18750, tone: "warning" },
  ]}
  format={(v) => `£${(v / 1000).toFixed(1)}k`}
  xStartLabel="Apr"
  xEndLabel="Aug"
/>
```

### CompareChart

One measure over two periods: the current period in accent, the previous behind it as the comparison. Legend above, y ticks in the left gutter, x tick labels spread along the bottom. On hover, a crosshair, a dot on each line and a readout of BOTH series at that point.

`CompareChart` · props `CompareChartProps` · [`packages/ledger/src/components/data/CompareChart.tsx`](../../packages/ledger/src/components/data/CompareChart.tsx)

No area fill on either line: two stacked gradients would fight, and the
subject here is the gap between the periods, not the volume under them.

Draws at its measured width (see useChartWidth), so it fills a fluid column
instead of scaling its own type up with a fixed viewBox.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `current` **·** required | `CompareSeries` | — |  |
| `previous` | `CompareSeries` | — |  |
| `labels` | `string[]` | — | x-axis tick labels, spread evenly across the width. |
| `yTicks` | `number` | `4` | how many y ticks to aim for; default 4. |
| `format` | `(value: number) => string` | `String` | formats y tick labels and the hover readout. |
| `height` | `number` | `200` |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<CompareChart
  current={{ label: "This quarter", data: [184, 192, 188, 205] }}
  previous={{ label: "Last quarter", data: [171, 169, 180, 176] }}
  labels={["Apr", "May", "Jun", "Jul"]}
  format={(v) => `£${v}k`}
/>
```

### SummaryCard

One card for the whole summary board: title and its verdict on the head line, the figure under it, a caption saying what the figure is measured against, then whatever fills the rest.

`SummaryCard` · props `SummaryCardProps` · [`packages/ledger/src/components/data/SummaryCard.tsx`](../../packages/ledger/src/components/data/SummaryCard.tsx)

The reference this came from drew four cards — big metric, compact metric,
status, list — and they are the same card with different things left out.
Four components would be four copies of one head row, drifting apart the
first time the title's wrap behaviour changed. So:

```text
  big metric   value + caption + <CompareChart>
  compact      value + caption
  status       value + caption, aside={<Badge>Normal</Badge>}
  list         no value, children={<KeyValue items={…} />}
  split        no value, children={<SummarySplit parts={…} />}
```

No `size` prop either. The reference's big card sets its figure at roughly
40px and the compact ones smaller; this kit's type scale stops at 28px
(--text-3xl), so both land on the same step and the size prop would have had
one value. Card WIDTH does the separating, which is the layout's job anyway.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | The metric's name. Wraps rather than truncating — a long title is still a title. Optional: a body that names its own parts (a columns KeyValue, where every cell is labelled) has nothing left for a title to say, and the head is dropped entirely rather than left as an empty row taking up space. |
| `aside` | `ReactNode` | — | Top-right slot. A MetricDelta when the card reports a CHANGE, a Badge when it reports a STATE ("Normal"). One slot, not two props: a card carries one verdict or the other, never both, and a second prop would let it try. |
| `value` | `ReactNode` | — | The figure. Omit on cards whose body is the content (list, split). |
| `caption` | `ReactNode` | — | The muted line under the figure — "vs 214 last month". |
| `children` | `ReactNode` | — | Fills the rest of the card: a CompareChart, a KeyValue, a SummarySplit. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<SummaryCard
  title="Cash at bank"
  aside={<MetricDelta value={6.4} />}
  value="£208,415"
  caption="vs £195,900 last month"
>
  <CompareChart
    current={{ label: "This year", data: cashThisYear }}
    previous={{ label: "Last year", data: cashLastYear }}
    labels={months}
  />
</SummaryCard>
```

### SummarySplit

One figure broken into its shares: "64% Mobile · 30% Desktop · 6% Tablet", hairline-separated, the leading share emphasised.

`SummarySplit` · props `SummarySplitProps` · [`packages/ledger/src/components/data/SummaryCard.tsx`](../../packages/ledger/src/components/data/SummaryCard.tsx)

Emphasis is order, not a prop: the parts are a ranking, so `parts[0]` is the
leading one by definition and a `highlight` index would only ever be able to
disagree with the sort. It is spent on SIZE and the text ramp, not on a hue —
three shares of one metric are three shares, not three categories, and the
accent in this kit marks what you can do.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `parts` **·** required | `SummarySplitPart[]` | — | Leading part first — the first one is the emphasised one. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<SummaryCard title="Payment methods">
  <SummarySplit
    parts={[
      { value: "64%", label: "Bank transfer" },
      { value: "30%", label: "Direct debit" },
      { value: "6%", label: "Card" },
    ]}
  />
</SummaryCard>
```

### KeyValue

Label/value meta pairs: muted label, tabular value, hairline separators. The dashboard's ds-label/ds-value pattern.

`KeyValue` · props `KeyValueProps` · [`packages/ledger/src/components/data/KeyValue.tsx`](../../packages/ledger/src/components/data/KeyValue.tsx)

The columns orientation stops being readable somewhere around five or six
items on a narrow card — the labels are what run out of room first, since a
value is short by nature and a label is not. It does not wrap to a second
line on purpose: a "row of facts" that silently becomes two rows is just the
rows orientation with worse alignment.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` **·** required | `KeyValueItem[]` | — |  |
| `orientation` | `"rows" \| "columns"` | `"rows"` | "rows" (default) stacks label-left/value-right pairs down the container. "columns" lays the pairs across it instead, label over value, split evenly with a hairline between — for a short set that reads as one row of facts rather than a list you scan down. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<KeyValue
  items={[
    { label: "VAT number", value: "GB 481 2937 41" },
    { label: "Scheme", value: "Standard" },
    { label: "Next return", value: "7 August 2026" },
  ]}
/>
```

### Pagination

Controlled: hairline chevron buttons + a fixed-width run of page numerals.

`Pagination` · props `PaginationProps` · [`packages/ledger/src/components/data/Pagination.tsx`](../../packages/ledger/src/components/data/Pagination.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `page` **·** required | `number` | — | Current page, 1-based. |
| `pageCount` **·** required | `number` | — |  |
| `onPageChange` **·** required | `(page: number) => void` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Pagination page={page} pageCount={9} onPageChange={setPage} />
```

## Types

### TableColumn&lt;Row>

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `key` **·** required | `string` | — |  |
| `header` | `ReactNode` | — |  |
| `width` | `string` | — | Column width (any CSS length). The table lays out fixed, so this is honoured exactly rather than treated as a hint — columns left unset split whatever space is over. Don't reach for the auto-layout `width: "100%"` idiom to mean "take the rest": under fixed layout it takes all of it. |
| `align` | `TableAlign` | — |  |
| `numeric` | `boolean` | — | Numeric cell — tabular figures via --num-features. |
| `render` | `(row: Row) => ReactNode` | — | Render-prop cell — falls back to row[key]. |
| `sortable` | `boolean` | — | Turns this column's header into a sort button. Needs `onSortChange` on the table; without it the flag does nothing, since there would be nowhere to report the click. Any sortable column un-hides the header row — see the note on the component. |

### TableAlign

```ts
type TableAlign = "left" | "center" | "right";
```

### TableSort

Controlled sort state: which column, which direction.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `key` **·** required | `string` | — |  |
| `dir` **·** required | `TableSortDir` | — |  |

### TableSortDir

```ts
type TableSortDir = "asc" | "desc";
```

### TableRowKey

Whatever `rowKey` returns — the identity a row is selected by.

```ts
type TableRowKey = string | number;
```

### BarChartDatum

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` **·** required | `string` | — | Bucket name — the tooltip's heading (e.g. "14:20–14:25"). |
| `value` **·** required | `number` | — |  |
| `tone` | `BarTone` | — |  |

### BarTone

A bar is the accent unless its bucket is a claim — an error run, a breach, a win.

```ts
type BarTone = "neutral" | "success" | "warning" | "danger";
```

### CompareSeries

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` **·** required | `string` | — | Names the period in the legend and in the hover readout. |
| `data` **·** required | `number[]` | — |  |

### SummarySplitPart

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `ReactNode` | — |  |
| `label` **·** required | `ReactNode` | — |  |

### KeyValueItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` **·** required | `ReactNode` | — |  |
| `value` **·** required | `ReactNode` | — |  |
| `hint` | `string` | — | A qualifier that applies to this figure alone — "all rows, not just the page", "excludes VAT". It goes on an info glyph rather than into the label, because one label three words longer than its neighbours breaks the row's rhythm and the columns orientation ellipsises it away anyway. Plain text: it is also the glyph's accessible name. |
