# Ledger — usage guide

The props tables in [`docs/api/`](./api) tell you what each component accepts.
This document tells you which one to reach for, and why the kit is shaped the
way it is. Read it once and you should be able to build a page that looks like
it belongs without having opened the playground.

Composed, copy-pasteable patterns live in [recipes.md](./recipes.md).

---

## Install and set up

```bash
npm install @mcleanstewart/ledger
```

Two imports at your app root, then nothing else:

```tsx
import { AppShell, SummaryCard } from "@mcleanstewart/ledger";
import "@mcleanstewart/ledger/styles.css";
```

`@mcleanstewart/ledger` is the only sanctioned import path. There are no deep
paths into `dist/components/…`; the barrel is the API surface, and everything —
components, types, `focusTrap`, `scrollLock`, `compactNumber`, `pct`,
`formatDate` — comes out of it.

### The theme attribute

Dark is the default, applied on `:root`. Light is first-class, not a filter over
dark:

```html
<html data-theme="dark">   <!-- or "light" -->
```

Both themes set `color-scheme`, so native scrollbars, form controls and the
browser's own chrome follow without extra work. If you never set the attribute
you get dark, because dark is what `:root` declares.

### It loads no fonts

The tokens declare a font stack with system fallbacks and stop there. A design
system that pulls a webfont is a design system that decides your network
waterfall. The kit is drawn for Geist; load it yourself and it will pick it up:

```tsx
import { GeistSans } from "geist/font/sans";

<html className={GeistSans.className} data-theme="dark">
```

Nothing breaks without it — you get the system stack at the same metrics — but
the numerals are the reason Geist is specified, and the kit leans on tabular
figures everywhere.

### The `@import` trap (Tailwind v4 / lightningcss)

If your app processes CSS through Tailwind v4 or lightningcss, keep every
`@import` in **string form**:

```css
@import "@mcleanstewart/ledger/styles.css";        /* resolves */
@import url("@mcleanstewart/ledger/styles.css");   /* silently dropped */
```

Those resolvers leave the `url()` form as a literal rule, fail to inline the
nested file, and then drop it. Every token vanishes from your build and the
symptom is an unstyled kit with no error anywhere. This bit us, which is why
every `@import` in the source is string-form.

Related: the package declares `sideEffects: ["*.css"]`. Don't strip that if you
vendor the package — without it a bundler tree-shakes away the stylesheet
import, and you get a styled kit in dev and an unstyled one in production.

### How to override anything

All component CSS ships inside `@layer lg`. Any unlayered CSS you write outranks
it without `!important`:

```css
/* your app's stylesheet, unlayered — wins */
.lg-btn { border-radius: 0; }
```

That is the intended override path. Every component root also takes `className`
and `style`, so a one-off is a class, not a fork.

---

## Renamed: `FilterChip` and `RangeInput`

Both names were taken by controls that do something else. A kit whose
`FilterChip` is a toggle and whose `RangeInput` is a single slider reads, to
anyone arriving from a kit where those names meant a removable filter token and
a min/max pair, like a drop-in — so the import swaps cleanly, the page renders,
and the control is wrong. They have been renamed to what they actually are.

| Old name | New name | What actually changed |
| --- | --- | --- |
| `FilterChip` | `FilterToggle` | Nothing but the name and the `.lg-chip` class (now `.lg-filter-toggle`). It was always a toggle — `children` + `active` + `onChange(active)` + `count`, and no ×. If you wanted a removable applied-filter token with `label`/`value`/`onRemove`, this was never it. |
| `RangeInput` | `Slider` | Nothing but the name and the `.lg-range` class (now `.lg-slider`). Still one native `<input type="range">` with a filled track, still one value, still an `onChange` carrying the DOM event. |
| — | `RangeSlider` | **New.** The two-ended range that went missing: `value={{min, max}}`, `onChange({min, max})`, plus `min`/`max`/`step`. Salary filters, amount filters, date ranges — anything you were hand-rolling because the kit only had one thumb. |

The old names are **not** re-exported as aliases, deliberately. A stale
`FilterChip` or `RangeInput` import is now a compile error, which is the only
form of this message that arrives before you ship. An alias would keep the
import green and leave the wrong control on the page.

---

## The rules that are not obvious

Each of these is a decision the kit already made for you. They are worth
understanding, because fighting one usually produces a page that looks subtly
wrong rather than one that breaks.

### One control height, and no `size` prop

Button, Input, Select, SearchField, Textarea, SegmentedControl, Tabs, DatePicker,
MultiSelect and IconButton are all 36px. There is no `size` prop on any of them.

The reason is that size props are never used to express size — they are used to
express importance, and they do it badly. Two heights on one page means a
toolbar row where nothing shares a baseline, and the smaller variant shrinking
its type until it stops being readable. Emphasis is what `variant` is for; width
is what layout is for.

A few things are deliberately *not* on the control height, and they are fixed in
CSS rather than exposed as options:

| Element | Height | Why |
| --- | --- | --- |
| Badge, StatusPill | 18px | A marker is read as text, not as a control |
| CountBadge | 16px | Same, and it sits inside other things |
| FilterToggle | 26px | A row of filters is a filter bar, not an action row |
| Pagination buttons | 30px | Secondary navigation, below the content |
| Table row, KeyValue row | 42px / 48px | List rhythm, not control rhythm |

When a marker looks wrong beside a button, the fix is not to inflate the marker.
It is that a marker was put in a row of controls.

The blanket phrase "no `size` prop anywhere" is looser than the code: `Avatar`
takes `size`, `Icon` takes `size`, `Skeleton` takes `width`/`height`, `Modal`
and `Drawer` take `width`, and the charts take `height`. Those are dimensions of
a box, not steps on a control scale. The rule is about control heights.

### A control is a word or a glyph, never both

`Button` takes text and has no icon slot. `IconButton` takes an icon and has no
label slot — it carries the label as its accessible name and as a built-in
tooltip.

An icon beside a label is two readings of one action, and it gives the same
string two possible widths depending on whether someone remembered the icon. If
the glyph is the whole message, use IconButton. If it isn't, the glyph is
decoration.

IconButton builds in the tooltip rather than leaving it to each caller, because
`title` — the obvious alternative — is browser chrome: unstyleable, not shown on
focus, and not dismissible per WCAG 1.4.13.

### Colour is semantic, never decoration

Green means this went up. Red means this is wrong. Amber means look at this.
Grey means nothing has happened.

Everything else is the warm neutral ramp. A `tone` prop is a claim about the
data, not a styling choice — `<Badge tone="danger">` says the thing is bad, not
that you wanted it to be red. When every card carries a colour, the one that
should have caught your eye no longer does.

The exception the kit itself makes: the house accent (`#0795FF`) carries
interactive state — primary fills, active items, focus rings, chart series. It
marks what you can *do*, not where things are, and it does not appear on
surfaces, borders or the text ramp.

Charts draw in the accent, not in a status colour. A balance chart that is
always red says nothing. `BarChart` is the one that reasons about this: bars are
the accent until any bucket carries a health `tone`, at which point the series is
a health series and the untoned bars go green — because among reds and ambers,
"no colour" would be the only bar not saying anything. That is derived from the
data, not asked of you.

### Hairlines, not shadows

Separation is a 1px border on a near-flat surface. `Card` has no shadow, and
there is no `elevation` prop. The kit ships exactly one sanctioned shadow, used
by the floating layers that genuinely leave the page: Tooltip, Menu, Modal,
Drawer, the Rail flyout, the CommandMenu panel.

If a region needs to stand out and it isn't floating, the answer is a hairline,
a surface step (`--surface` vs `--bg`) or space — not a shadow.

### No hint microcopy

`FormField` has a `label` and an `error`. There is no `hint` slot, and
`EmptyState` has no `description` slot, and `InlineAlert` puts its detail behind
an info glyph rather than on a second line.

The reasoning is the same each time: explainer text under a control is the
interface narrating itself. A field that needs a caption to be understood needs
a better label or a better control. An `error` stays, because an error reports
something the user could not have known in advance.

Where reference material genuinely has to be reachable, it goes in a tooltip on
the control it is about. That is also the only sanctioned use of `Kbd` — a
shortcut cap inside a tooltip, not printed beside a menu item.

### Numbers are tabular

Numeric table cells (`numeric: true`), KeyValue values, CountBadge, MetricDelta
and every chart axis use tabular figures. If you write your own cell that sits
in a column of figures, give it `font-feature-settings: var(--num-features)` or
it will jitter as the digits change. The same applies to any count that sits
beside a flexing input — a proportional "1 of 8" is narrower than "8 of 8", and
the field will resize on every keystroke.

---

## Which component when

### `Button` vs `IconButton`

- **Button** — a named action. Four variants: `primary` (accent fill, one per
  view), `secondary` (surface + hairline, the default), `tertiary` (ghost, for
  the cancel/dismiss side of a pair), `danger` (semantic fill, destructive
  only).
- **IconButton** — an action whose glyph *is* the label: refresh, close, kebab,
  a row-level action repeated down a table.

Goes bad when: you reach for IconButton for a domain action ("Reconcile",
"Escalate") because it fits in a tighter row. Nobody can guess which glyph means
reconcile, and the tooltip only helps a mouse. Also goes bad in the other
direction — a Button labelled "×".

`IconButton` has a second axis worth knowing: `variant="bare"` drops the 36px
target box, leaving the glyph. Use it for annotations — an info glyph beside a
card header, a clear button next to a filled field — where a control-sized box
around a 17px icon is all chrome and no message. It is still a real button, so
it keeps focus and its tooltip — and `active` on a bare glyph fills a chip
around it rather than only shading it, so a bare toggle reads as pressed
without costing the row a 36px column.

`variant="primary"` is the third: the `control` box carrying Button's accent
fill, for the glyph that *is* the action rather than one of several beside it —
a send control at the end of an input. One per cluster; a row of them is a row
of primaries, which is a row of no primaries.

### `Badge` vs `StatusPill` vs `CountBadge` vs `StatusDot`

- **Badge** — a label on a thing. `tone` + `variant` (`subtle`/`solid`/
  `outline`). "Pending", "prod", "Over budget". It says what something *is*.
- **StatusPill** — a health readout: a coloured dot, a label, optionally one
  tabular value. Four states only: `good` / `watch` / `risk` / `unknown`. It
  says how something is *doing*. The chrome is deliberately quiet — colour lives
  in the dot alone, because a column of tinted chips reads as a traffic light
  wall.
- **CountBadge** — a number and nothing else, with a `max` rollover ("99+").
  Nav counts, tab counts, queue depth in a cell.
- **StatusDot** — the bare dot, for when there is already a name beside it. No
  glow, no pulse: a halo animating forever on a list of ten healthy things turns
  a status readout into a nightclub.

Goes bad when: Badge is used for status. You end up hand-mapping five domain
states onto five tones in every file, and two pages disagree about whether
"paused" is warning or neutral. Map your states onto `StatusPillStatus` once,
in a constant, and the whole app agrees:

```tsx
const STATE: Record<DaemonState, { label: string; status: StatusPillStatus }> = {
  healthy:  { label: "Healthy",   status: "good" },
  degraded: { label: "Degraded",  status: "watch" },
  failing:  { label: "Failing",   status: "risk" },
  paused:   { label: "Paused",    status: "unknown" },
};
```

### `Modal` vs `Drawer` vs `Toast` vs `InlineAlert`

- **Modal** — a decision that blocks. Confirmations, destructive actions,
  anything where continuing without answering is wrong. Centred, focus-trapped,
  scroll-locked, Escape and overlay-click close.
- **Drawer** — detail beside the list you came from. The row you clicked stays
  addressable in your head; the drawer holds a status line, a chart, a KeyValue
  block and a footer of actions. Same trapping and locking as Modal.
- **Toast** — something already happened and you don't need to act. Auto-dismiss
  at 5s by default; the one place an `action` is legitimate is undo.
- **InlineAlert** — a condition that persists and belongs to the page, not to
  the moment. "bank-sync has failed 6 consecutive runs". It sits above the
  content it is about, on one line, always.

Goes bad when: a Modal is used for detail. Detail is something people compare
across rows, and a modal makes them close it, find the next row, and re-open —
Drawer exists for exactly that traversal. In the other direction, a Toast used
for an error nobody has to acknowledge means the error scrolls away in five
seconds and the page never mentions it again.

`InlineAlert` is one line by construction. `title` is the headline; `children`
is the detail, and it renders behind an info glyph rather than as a second line
of prose. That keeps the alert a fixed height, so it can't shove the page around
when its text changes. If your detail cannot survive being one tooltip long, it
is not alert text — it is page content.

### `SummaryCard` vs a bare figure

`SummaryCard` is one component for the whole summary board. Its variants are
things left out, not props:

| Shape | How |
| --- | --- |
| Big metric | `value` + `caption` + a chart in `children` |
| Compact metric | `value` + `caption` |
| Status | `value` + `caption` + `aside={<Badge>Normal</Badge>}` |
| List | no `value`, `children={<KeyValue …/>}` |
| Split | no `value`, `children={<SummarySplit …/>}` |

`aside` is one slot on purpose. A card carries one verdict: a `MetricDelta` when
it reports a **change**, a `Badge` when it reports a **state**. Two props would
let a card try to do both.

Reach for a bare number in a `Card` when the figure is not a KPI — a total at
the foot of a list, a running count in a toolbar. SummaryCard's job is the
board, and a board of one card is not a board.

There is no `size` prop, because the type scale stops at 28px and the reference
"big" and "compact" cards both land on the same step. Card **width** does the
separating, which is the layout's job anyway.

### `Table` vs `KeyValue`

- **Table** — many records, same shape, scanned down. Render-prop columns, row
  hover, optional `onRowClick`.
- **KeyValue** — one record's fields, read once. Muted label, tabular value,
  hairline separators. This is what goes in a drawer.

Goes bad when: a Table with two columns is used for a fact list. You get a
header row you have to hide, a fixed column budget you have to guess, and no
label/value semantics. KeyValue renders `<dl>/<dt>/<dd>` and is a third the
code.

`KeyValue` has a second orientation, `columns`, which lays the pairs across the
container with the label above the value. Use it for a short set that reads as
one row of facts. Two caveats, both real: it stops being readable at about five
or six items on a narrow card (the labels run out of room first, and they
ellipsis rather than wrap — a "row of facts" that silently becomes two rows is
just the rows orientation with worse alignment); and the columns layout **centres**
its values, which makes a set of figures harder to compare than the default
rows orientation, where they are right-aligned and digit-aligned. If the numbers
are meant to be compared, use `rows`.

### `TrendChart` vs `BarChart` vs `CompareChart` vs `Sparkline`

- **Sparkline** — a shape, inline. No axes, no hover, no readout. It belongs in
  a table cell or beside a balance. Fixed `width`/`height` props; give it
  `width: 100%; height: auto` in CSS if you want it to fill.
- **TrendChart** — one series over time, with grid, y ticks in the left gutter,
  x labels at the ends, and a crosshair readout on hover. Optional area fill.
  Measures its own container, so it fills a fluid column.
- **CompareChart** — one measure over **two** periods on a shared scale, with a
  legend and a hover readout of both. No area fill on either line: two stacked
  gradients fight, and the subject is the gap between the periods, not the
  volume under them.
- **BarChart** — discrete buckets: requests per five minutes, runs per day. It
  brings its own head row (micro-label, headline figure, secondary counts) and
  start/end axis labels. This is the one that carries per-bar `tone`.

Goes bad when: TrendChart is used for bucketed counts. A line implies the value
existed between the samples; error counts per five-minute window did not.
Equally, BarChart with forty buckets of a continuous measure is a comb.

The two line charts share their geometry (gutter, padding, axis row) on purpose,
so a TrendChart and a CompareChart side by side line up. If you replace one with
the other, nothing moves.

### `Tabs` vs `SegmentedControl`

Both are exclusive pickers with the same keyboard contract (one tab stop, arrows
select). They differ in what they claim:

- **Tabs** — switching *views*. `role="tablist"`, an underline indicator, and it
  sits above the content it swaps.
- **SegmentedControl** — picking a *value*. `role="radiogroup"`, a raised active
  segment, and it sits in a toolbar or inside a FormField. Time ranges, units,
  appearance settings.

If the thing below it does not change wholesale, it's a value, not a view.

### `Select` vs `MultiSelect` vs `FilterToggle`

- **Select** — one of many, styled native `<select>`. Keeps the platform's
  picker on mobile, which is the right call.
- **MultiSelect** — several of many, with real checkboxes in the popover so it
  stays keyboard-navigable. It grows a filter row from eight options up; below
  that, a filter row is chrome on a list you can already see. Give it a `name`
  and it emits one hidden input per selected value, so `FormData.getAll(name)`
  reads it and an otherwise-uncontrolled form does not have to lift this one
  control into React state.
- **FilterToggle** — a toggle you want *visible* while it is on, with a count.
  Three to six of them across a table's toolbar is the pattern. Beyond that,
  MultiSelect.

`FilterToggle` carries its active state in the fill and border alone — no × inside
it. The chip *is* the toggle, so an × would be a second control for what the
whole chip already does, and it would make the active chip a different width
from the inactive one.

---

## Theming

Every semantic colour reads through `var(--brand-*, <default>)`, so retinting is
a handful of variable declarations — no fork, no build step, no `!important`
(your CSS is unlayered, so it already wins).

```css
:root {
  --brand-primary: #4C4CF5;      /* fills, active states, focus */
  --brand-chart-line: #0E7490;   /* charts only, UI untouched  */
}
```

Scope them wherever you like:

```css
:root                 { --brand-primary: #4C4CF5; }  /* both themes    */
[data-theme="light"]  { --brand-primary: #3A3AD8; }  /* per theme      */
[data-brand="ocean"]  { --brand-primary: #0E7490; }  /* one subtree    */
```

The full knob list — brand, surfaces, borders, the text ramp, semantic tones,
data-viz — is documented in `tokens/brand.css`, which declares nothing itself
and exists purely as the contract:

```ts
import "@mcleanstewart/ledger/tokens/brand.css";   // reference only
```

Two things to know before you start:

**Tinting everything undermines the semantic tones.** Set `--brand-primary` and
every primary Button, active nav item, focus ring, selected segment and chart
line becomes your hue. That is fine, and it also means colour no longer *only*
means something. Green and red then have to shout over a page that is already
coloured. If you want a brand hue somewhere, one accent is cheaper than all of
them.

**Charts are usually the only colour a dashboard actually wants.** Bars, the
area gradient and the hover wash all derive from `--chart-line`, so:

```css
:root { --brand-chart-line: #0E7490; }
```

retints every chart in the kit and leaves the interface monochrome. That is the
worked example in `brand.css` for a reason.

`--brand-secondary` is deliberately consumed by nothing in the kit. It exists
for app-level chrome you build yourself.

`--text-strong` has no knob on purpose — it is derived as a ratio of ink and
muted, and a hand-set value drifts out of step with the ramp as soon as you
change either end.

If you override `--brand-primary`, check `--brand-primary-fg` too. The default
foreground on the accent fill is near-black rather than white, and that is a
contrast decision: the house blue sits at ~3.2:1 against white (fails normal
text on a filled button) and ~6.5:1 against near-black.

---

## Layout

### `AppShell` — three header slots, not a flex row

```tsx
<AppShell
  rail={<Rail>…</Rail>}          // 56px icon column, bare on the page background
  header={…}                     // left: identity and location — breadcrumb, context
  search={…}                     // centre: search, optionally flanked by controls acting on it
  actions={…}                    // right: actions and view switches
>
  {children}                     {/* scrollable main */}
</AppShell>
```

The header is a three-column grid with equal outer fractions, so the centre cell
lands on the pane's true midpoint however long the breadcrumb is or however many
actions ride on the right. That is the whole reason it isn't a free-form flex
row: search sits dead centre in every app that uses this shell, so its position
is the shell's decision rather than something each page re-derives with margin
tricks.

Fill no slot and there is no header bar at all — `main` takes the whole pane,
and there is no divider hanging across nothing.

Structurally: the rail and header sit bare on the page background; the content
is a rounded pane floating beside them. Nothing is a "sidebar panel" with its
own fill and divider, because three regions with three backgrounds is three
boxes fighting over edges. The shell defaults to `100dvh`; size the root through
`className`/`style` to frame it inside something else.

One consequence worth knowing: the pane clips (`overflow: hidden`), and the
Rail's hover flyout labels pop sideways over it. They stay visible because the
rail column carries `--z-rail`. If you rebuild the rail yourself, you inherit
that problem.

### `PageColumn`

The one centred column every page hangs from. It reads `--page-max-width`
(1288px) and `--page-gutter` (16px), and the gutter is equal on all four sides —
an earlier version set only the inline padding and left every consumer to guess
its own vertical value, so the gap above the content never matched the gap
beside it.

`fullBleed` drops the max-width and the horizontal gutter while keeping the
vertical padding. It exists so you never need the negative-margin hack.

A `Table` that is the entire content of a full-bleed column inside an AppShell
sheds its own border and radius and runs edge to edge — the pane already draws
that frame, and a boxed table one gutter inside a boxed pane is a box in a box.
That is keyed off the layout in CSS, not a prop: nothing to remember, nothing to
get out of sync.

### The Table column-width budget

`Table` lays out **fixed**. That is deliberate: under auto layout every column is
measured from the cells currently rendered, so filtering a list — or one long
value arriving — silently re-cuts every column and the table jumps sideways.
Fixed means the columns are decided once, by `<colgroup>`, and a cell that
doesn't fit truncates with an ellipsis instead of shoving its neighbours.

The cost is that fixed layout has no minimum width. **Your `width` values are a
budget against the narrowest container the table will ever live in.** Overspend
it and the table does not scroll — every cell crushes to an ellipsis. We hit
this for real: a seven-column ticket table with about 43rem of declared widths,
dropped into a ~30rem split column, rendered as seven columns of "…".

Practical rules:

1. Leave exactly one column with no `width`. Unset columns split whatever is
   left over, and that column absorbs the slack. Make it the one whose content
   varies — a title, a name.
2. Don't use `width: "100%"` to mean "take the rest". Under fixed layout it
   takes *all* of it.
3. In a narrow split column, **drop columns rather than shrinking them**. The
   ticket table went from seven columns to four: the priority badge moved into
   the summary cell, and contractor and notes were already in the drawer.
4. Sum your fixed widths and compare them against the container before you add
   one more column.

Widths go on `<col>`, not `<th>`: while the header is hidden it is pulled out of
flow, so anything sized there never reaches layout. `<col>` is the one place a
width holds whether the header is showing or not.

### The header row, hidden by default

`Table`'s header is in the DOM but visually clipped. A column of dates under a
heading that says "Date" tells the reader what they already worked out, and on a
full-page table those labels are the only chrome left. Screen readers still get
them (clipped, not `display: none`, which would remove them from the
accessibility tree too), so the table stays navigable by column. Keep writing
`header` on your columns — it is doing work you can't see.

**That is a constraint on your columns, not just on the chrome.** If a column's
values do not say what they are, this `Table` cannot carry that column — there is
no heading coming to rescue it. We built one that rendered `3m ago`, `1m ago` and
a bare pid across five columns and shipped five anonymous columns of numbers. The
fix was redesigning the columns — merge the pair, put the unit in the value, move
the rest into a drawer — not switching the header back on. Read your columns on
their own before you build the table, not after.

The header un-hides itself when it has something to hold: a column marked
`sortable`, or row selection (`selectedKeys` + `onSelectionChange`). That is the
point where it stops restating the data and becomes a row of controls, so it
earns its space — and once visible it is sticky, so `maxHeight` scrolls the body
under it. Neither is a prop; both are keyed off what you passed, so there is
nothing to remember and nothing to get out of sync.

The corollary matters more than it looks: **on a plain table, a sort or filter
control cannot go in the header row** — it would be invisible. Put it in the page
toolbar, where it can say what it does. When you do want the control in the
header, mark the column `sortable` and own the comparator yourself — the kit
draws the affordance and the arrow, and never reorders your rows.
[Recipe 6](./recipes.md#6-sortable-selectable-table-with-a-bulk-action) wires
sorting and selection end to end.

---

## Known sharp edges

These are real. A guide that hides them costs you more than it saves.

**`FormField` clones `id` onto its single element child, so that child has to be
the control.** It clones the child to inject `id`, `aria-describedby` and
`aria-invalid`. That works for `Input`, `Textarea`, `Select`, `SearchField`,
`Switch`, `MultiSelect`, `DatePicker` and `Slider`, which all forward unknown
props down to a real focusable element.

When the child is *not* the control — a hand-built group whose root is a `<div>`
— the `id` lands on that wrapper instead. You get a duplicate id in the document
and a `<label htmlFor>` aimed at something that cannot take focus. The rule, and
it applies to every non-control child rather than any particular component:

> **If the child is not the focusable control, pass `group`.**

```tsx
{/* the kit's Input has no prefix slot, so a till-sized amount field is hand-built */}
<FormField label="Amount" group>
  <div className="amount-group">
    <span aria-hidden>£</span>
    <input inputMode="decimal" />
  </div>
</FormField>
```

`group` switches to the fieldset/legend shape — `role="group"` named by the
label, the error announced on the group, the label click forwarded to the first
tab stop inside — and clones nothing.

A child that is a plain host element outside the labelable set (`input`,
`select`, `textarea`, `button`, `meter`, `output`, `progress`) now warns in
development and the clone is skipped, so this fails loudly instead of silently.
A *component* child cannot be checked — its rendered root is unknowable from the
outside, and that is exactly the case the kit's own controls rely on — so the
rule is still worth knowing rather than waiting for.

`RadioGroup`, `SegmentedControl` and `RangeSlider` take the group shape on their
own: they carry a marker `FormField` recognises, so you do not pass `group` and
you do not need an `aria-label` to name them.

**`Table`'s `rowKey` defaults to the array index.** Fine for a static list;
wrong the moment rows are filtered, sorted or paged, because React will then
reuse a row's DOM — and its hover state, and any focus inside it — for a
different record. It is also the key row selection is tracked by, so on the
index fallback a selection follows a row's *position*: sort the table once and
every tick is on a different record. Always pass it:

```tsx
<Table columns={columns} rows={rows} rowKey={(r) => r.id} />
```

**`KeyValue orientation="columns"` centres its values.** Harder to compare than
the aligned figures of the default `rows` orientation. Use it for a row of
labelled facts, not for a set of numbers you want read against each other.

**Clickable table rows swallow nothing for you.** If you pass `onRowClick` and
also put a Menu or IconButton in a cell, stop the click yourself:

```tsx
const swallow = (e: MouseEvent<HTMLElement>) => e.stopPropagation();
// …
render: (row) => <span onClick={swallow}><Menu trigger={…} items={…} /></span>
```

**A function prop cannot reach a client component from a server component.**
Most of the kit carries `"use client"` (the [API index](./api/README.md) counts
them), and a function is not serialisable, so a server component that passes
`format`, `rowKey`, a column's `render` or any handler throws — after a clean
typecheck and a clean
`next build`, on the first render of the route. The API reference marks both
halves (**Client component**, and **·** `function` on the prop);
[recipe 7](./recipes.md#7-charts-and-tables-under-a-server-component) is the
wrapper. `format` and `rowKey` are the ones that get through review, because
formatting does not read as interaction.

**`Progress` is determinate only.** There is no indeterminate variant: a chunk
sliding back and forth reports nothing, and `Spinner` already covers "working,
duration unknown". If you can't measure it, don't draw a bar.

**Tooltips hide on scroll and resize.** They are portaled and fixed-positioned,
so they detach from their anchor otherwise. Expected, occasionally surprising.

**`SearchField` clears through a native setter.** It dispatches a real `input`
event so a controlled consumer's `onChange` fires with `""`. If you were relying
on `onClear` alone to know the field emptied, you will get both.
