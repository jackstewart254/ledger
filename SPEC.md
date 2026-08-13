# ui-designs

Jack's design-system library. Many systems over time, iterated independently of any app, consumed across mcleanstewart projects. Public GitHub, published to npm.

## Repo layout

```
packages/<system>/   one npm package per design system
playground/          Vite + React app rendering every component of every system (dev-only, never published)
```

npm workspaces. TypeScript everywhere. One sanctioned runtime dependency per system — `lucide-react`, for icons (ESM, per-icon tree-shakeable, ISC). Nothing else.

## Package anatomy (per system)

```
src/tokens/          brand.css, colors.css, typography.css, spacing.css, radii.css, motion.css, z-index.css, index.css barrel
src/styles.css       imports tokens + all component CSS, everything inside @layer
src/components/<category>/<Name>.tsx + <name>.css
src/index.ts         barrel — the only sanctioned import path
```

- Build: `tsc` → `dist/` (`react-jsx`, `.d.ts` emitted from source — no hand-written sidecars), CSS copied verbatim. No bundler.
- Consumers: `import { Button } from '<scope>/<system>'` + `import '<scope>/<system>/styles.css'`.
- Token `@import`s use **string form only** — the `url()` form is silently dropped by Tailwind v4/lightningcss resolvers in consuming apps.

## DS #1 — ledger (refined Financial Terminal)

Package `@mcleanstewart/ledger`, class prefix `.lg-`, CSS layer `@layer lg`.

Doctrine: warm near-black `#171615`, hairlines not shadows, colour strictly semantic, Geist, tabular figures, sentence case, 120–180ms motion, one sanctioned tooltip shadow. Dark default on `:root`, light first-class via `[data-theme="light"]`, `color-scheme` set per theme.

One hue carries interaction. `--accent` ships `#0795FF` in dark and `#0A7BD8` in light — the same blue a step down in value, because #0795FF only reaches ~3:1 against the warm off-white and text on a filled button is the case that has to pass 4.5:1. It marks what you can DO: primary fills, active items, focus rings, chart series. Everything else stays where it was — surfaces, borders and the text ramp are warm neutrals, and the semantic tones are still the only other colour in the kit (green up, red wrong, yellow look-at-this). The point is unchanged: colour means something rather than decorates. It is now one hue for state plus the semantics, not ink plus the semantics.

Baseline scale: **the ms-dashboard port** (14px type base, 26/30/36/42 control heights, pill-height tokens) — not scout's original 16px scale.

### Tokens

Groups: color (two layers: raw palette + semantic names components read), typography, spacing, radii + the one shadow, motion, z-index. Rationale comments stay in the files.

Changes vs the dashboard port:

- Every value a component uses exists as a token — control paddings and gaps included. Kills the 81 raw-px literals found inside the old DS components.
- Dead tokens dropped (`--font-serif`, orphan aliases). Rule: every token has a consumer or a rationale comment.
- The DS loads no fonts. Consumer loads Geist (next/font or `<link>`); tokens declare the stack with system fallbacks only.

### CSS rules

- All component CSS inside `@layer` — any unlayered app CSS wins without `!important`.
- Per-system class prefix (e.g. `.xx-btn`). No collisions if two systems ever meet in one page/gallery.
- Static styles in CSS classes only; `style={}` reserved for dynamic values, passed as custom properties.
- States (`:hover`, `:active`, `:focus-visible`) live in CSS — no JS hover, no per-instance `<style>` tags.
- `:active` transform keeps its explicit `prefers-reduced-motion` guard (the global kill zeroes durations, not transforms).
- Zero raw hex/px in component CSS — tokens only. Lint-enforced (see Enforcement).

### Components — comprehensive dashboard kit

Everything required to build a dashboard, by category. This list is the barrels (`src/index.ts` → `components/*/index.ts`); if the two disagree, the barrels are right.

- **core**: Icon (styling wrapper over a lucide-react component passed as `as` — one default box, 17px at stroke 2, colour from `currentColor`; no name strings, an unknown icon is a compile error), Button (variants: primary / secondary / tertiary / danger — primary = accent fill, secondary = surface + hairline border, tertiary = ghost text, danger = the semantic red), IconButton, Badge, StatusPill, StatusDot (a bare dot — no glow ring, no breathe; the colour is the whole signal), CountBadge, Avatar, Kbd (shortcut cap — tooltip use only per the no-hint-microcopy rule), Divider, Link (styled anchor — Preflight-off means bare `<a>` is UA blue otherwise)
- **typography**: PageHeader (title + subtitle + actions — kills the 8×-copy-pasted heading block), SectionHeading
- **layout**: AppShell (fixed rail slot + header slot + scrollable content — kills per-app Shell rebuilds), PageColumn (tokenised max-width + gutters, full-bleed opt-out — kills the negative-margin hack), Card (the dashboard hand-rolls a CARD literal today)
- **navigation**: Rail + RailItem (icon-only 56px, hover/focus flyout labels), Tabs, Menu (anchored action/kebab menu), CommandMenu (Cmd+K palette — filterable list, keyboard nav)
- **forms**: FormField (label + hint + error wrapper), Input, Textarea, Select, MultiSelect, SearchField, Checkbox, RadioGroup, Switch, SegmentedControl, FilterToggle, Slider, RangeSlider (two-ended `{min, max}`, a pair of native ranges over one rail — no dependency), DatePicker (own month-grid popover on the `.lg-control` trigger — the native `<input type="date">` popup is the browser's own chrome, unstylable; still no picker dependency)
- **data**: Table (render-prop columns; header row hidden by default but left in the a11y tree, un-hiding and sticking once a `sortable` column or row selection gives it something to hold; sort and selection are controlled and the consumer orders the rows — see below), SummaryCard + SummarySplit (one card for the whole summary board: title, verdict, figure, caption, then whatever fills the rest), MetricDelta, Sparkline, TrendChart, BarChart, CompareChart (TrendChart's geometry, two series), KeyValue (label/value meta rows on `--row-h` with hairline separators), Pagination
- **feedback**: Modal, Drawer, Toast + ToastViewport, Tooltip (CSS transitions — no gsap, no animation dep), InlineAlert, EmptyState, Skeleton, Spinner, Progress
- **utils**: focusTrap (`trapFocus`/`useFocusTrap`), scrollLock (`lockBodyScroll`/`unlockBodyScroll`), format helpers (`compactNumber`/`pct`/`formatDate`)

54 exported components, counting `RailItem` and `ToastViewport` as their own. `ChartTooltip` and `src/internal/` (`cx`, `month-grid`) are shared internals and stay off the barrel on purpose. Later waves: whatever the next dashboard actually needs — nothing speculative beyond this kit.

Table's header row is hidden by default and un-hides itself when it has something to hold. Hidden is the default because a column of dates under a heading reading "Date" tells the reader what they already worked out: on a full-page table those labels are the only chrome left, so the row is clipped out of view and left in the accessibility tree. That default carries a constraint worth stating before it is rediscovered, because it was rediscovered the hard way — **a column whose values are not self-describing is a column this Table cannot carry.** A run list rendering `3m ago`, `1m ago` and a bare pid across five columns is five anonymous columns of numbers, and the answer is to redesign the columns (merge the pair, put the unit in the value, move the rest into a drawer), not to switch the header back on. That redesign belongs before the table is built, not after.

A `sortable` column or row selection puts a control in that row, and a control nobody can see or click is worse than none — so the header un-hides, and once visible it is sticky under `maxHeight`, because a table that scrolls its headings away is only ever worse. Both are keyed off the props rather than a `showHeader` knob: nothing to remember, nothing to get out of sync. Sorting and selection are fully controlled and neither touches `rows` — the kit draws the affordance and the direction arrow, the consumer owns the comparator. The corollary holds for everything else: a plain table keeps its hidden header, so a filter or a sort control on one belongs in the page toolbar where it can say what it does. Recipe 6 in `docs/recipes.md` wires the sortable/selectable case end to end.

### Component API conventions

- Typed props, no `any`. Variants are union-typed props mapping to modifier classes.
- `className` + `style` passthrough on every component root.
- Table keeps render-prop columns (the pattern the dashboard already consumes).
- One control height, and no `size` prop on a control. Button, IconButton, Tabs, SegmentedControl and every field on the shared `.lg-control` frame (Input, Select, SearchField, MultiSelect, DatePicker) sit at `--control-h-md` = 36px; Textarea composes the same frame but grows with its content. Two heights on one page means a toolbar where nothing shares a baseline, and the smaller variant shrinking its type until it stops being readable — emphasis is what `variant` is for, width is what layout is for.
- The rule is about control HEIGHTS, not a ban on the word. The deliberate exceptions, so the rule stays checkable: `Avatar` and `Icon` take `size`; `Skeleton` takes `width`/`height`; `Modal`, `Drawer` and `MultiSelect` take `width`; `Table` takes column `width` and `maxHeight`; `Sparkline`/`TrendChart`/`BarChart`/`CompareChart` take chart dimensions. Those are the size of a box, not a step on a control scale.
- Anything deliberately off the control height is fixed in CSS and never exposed as a prop: Badge and StatusPill 18px, CountBadge 16px, FilterToggle 26px, Pagination buttons 30px, Table row 42px, KeyValue row 48px. A marker is read as text, not as a control; when one looks wrong beside a button, the fault is that a marker was put in a row of controls.

## Enforcement

Port scout's adherence approach: token inventory JSON → generated eslint config (forbid raw hex/px/font-families, barrel-only imports). Wave 2, after the token set settles.

## Publishing

npm, semver per package, published from the public GitHub repo. Playground deploys nowhere (local only) until there's a reason.

## Non-goals

No Tailwind. No CSS-in-JS. No runtime dependencies beyond the one sanctioned icon dep, `lucide-react`. No app-specific components (logos, domain badges, platform tags).
