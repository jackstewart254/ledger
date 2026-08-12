# @mcleanstewart/ledger

A dashboard design system. Dark-first, one accent hue on warm neutrals,
hairlines instead of shadows, tabular figures. Typed React components and
vanilla CSS — no bundler in the build, no CSS-in-JS, and one runtime dependency
(`lucide-react`, for icons).

```bash
npm install @mcleanstewart/ledger
```

## Use it

```tsx
import { AppShell, SummaryCard, MetricDelta, Table } from "@mcleanstewart/ledger";
import "@mcleanstewart/ledger/styles.css";   // once, at your app root

export default function App() {
  return (
    <SummaryCard
      title="Runs today"
      value="449"
      caption="vs 415 yesterday"
      aside={<MetricDelta value={8.2} />}
    />
  );
}
```

## Three things that will catch you out

**1. It loads no fonts.** The tokens declare a stack with system fallbacks and
stop there — a design system that pulls down a webfont is a design system that
decides your app's network waterfall. The kit is drawn for Geist; load it
yourself (`next/font`, a `<link>`, whatever you use) and it will pick it up:

```tsx
import { GeistSans } from "geist/font/sans";
<html className={GeistSans.className}>
```

**2. Import the stylesheet, don't re-declare it.** Everything ships inside
`@layer lg`, so any unlayered CSS you write outranks the kit without
`!important`. That is the intended override path.

**3. If you use Tailwind v4 or lightningcss, keep `@import` in string form.**
`@import "./tokens/index.css"` resolves; `@import url("./tokens/index.css")`
does not — those resolvers leave the nested file as a literal rule and then
drop it, and every token silently vanishes from your build. This bit us; it is
why every `@import` in the source is string-form.

## Themes

Dark is the default. Light is first-class, not an afterthought:

```html
<html data-theme="dark">   <!-- or "light" -->
```

Both set `color-scheme`, so native form controls and scrollbars follow.

## Theming

Every semantic colour reads through `var(--brand-*, <default>)`, so you retint
the kit by declaring a handful of variables — no fork, no build step:

```css
:root {
  --brand-primary: #0795FF;      /* fills, active states, focus */
  --brand-chart-line: #0E7490;   /* charts only, UI stays as-is */
}
```

Scope them anywhere — `:root`, `[data-theme="light"]`, or a subtree. The full
knob list (brand, surfaces, borders, text ramp, semantic tones, data-viz) is
documented in `dist/tokens/brand.css`, which declares nothing itself:

```ts
import "@mcleanstewart/ledger/tokens/brand.css";  // reference only
```

One caveat worth reading before you reach for `--brand-primary`: this kit spends
exactly one hue, and the colour left over is reserved for meaning — green is
"this went up", red is "this is wrong". Swapping the accent is the knob doing
its job, but keep clear of those tones (a green primary stops "up" reading as a
verdict, a red one makes every page look like an error) and check
`--brand-primary-fg` against your fill — a hue swap breaks the text-on-fill
contrast ratio silently.

## What's in it

**core** Icon · Button · IconButton · Badge · StatusPill · StatusDot ·
CountBadge · Avatar · Kbd · Divider · Link
**typography** PageHeader · SectionHeading
**layout** AppShell · PageColumn · Card
**navigation** Rail · Tabs · Menu · CommandMenu
**forms** FormField · Input · Textarea · Select · MultiSelect · SearchField ·
Checkbox · RadioGroup · Switch · SegmentedControl · FilterChip · RangeInput ·
DatePicker
**data** Table · SummaryCard · SummarySplit · MetricDelta · KeyValue ·
Sparkline · TrendChart · BarChart · CompareChart · Pagination
**feedback** Modal · Drawer · Toast · Tooltip · InlineAlert · EmptyState ·
Skeleton · Spinner · Progress
**utils** focusTrap · scrollLock · `compactNumber` · `pct` · `formatDate`

## Conventions

- One control height, 36px, and no `size` prop on a control — emphasis is what
  `variant` is for, width is what layout is for. Boxes still take dimensions:
  `Avatar` and `Icon` take `size`, `Skeleton` takes `width`/`height`, `Modal`,
  `Drawer` and `MultiSelect` take `width`, `Table` takes column `width` and
  `maxHeight`, and the charts take their own. That is the size of a box, not a
  step on a control scale.
- A control is a word or a glyph, never both — `Button` takes text, `IconButton`
  takes an icon and carries its own tooltip.
- Colour is semantic. `tone` on a component is a claim about the data.
- `className` and `style` pass through on every component root.

## Licence

MIT © Jack Stewart
