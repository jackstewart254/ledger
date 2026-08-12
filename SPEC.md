# ui-designs

Jack's design-system library. Many systems over time, iterated independently of any app, consumed across mcleanstewart projects. Public GitHub, published to npm.

## Repo layout

```
packages/<system>/   one npm package per design system
playground/          Vite + React app rendering every component of every system (dev-only, never published)
```

npm workspaces. TypeScript everywhere. Zero runtime dependencies per system.

## Package anatomy (per system)

```
src/tokens/          colors.css, typography.css, spacing.css, radii.css, motion.css, z-index.css, index.css barrel
src/styles.css       imports tokens + all component CSS, everything inside @layer
src/components/<category>/<Name>.tsx + <name>.css
src/index.ts         barrel — the only sanctioned import path
```

- Build: `tsc` → `dist/` (`react-jsx`, `.d.ts` emitted from source — no hand-written sidecars), CSS copied verbatim. No bundler.
- Consumers: `import { Button } from '<scope>/<system>'` + `import '<scope>/<system>/styles.css'`.
- Token `@import`s use **string form only** — the `url()` form is silently dropped by Tailwind v4/lightningcss resolvers in consuming apps.

## DS #1 — ledger (refined Financial Terminal)

Package `@mcleanstewart/ledger`, class prefix `.lg-`, CSS layer `@layer lg`.

Doctrine unchanged from the accepted taste: warm near-black `#171615`, hairlines not shadows, almost-monochrome with accent = ink, colour strictly semantic, Geist, tabular figures, sentence case, 120–180ms motion, one sanctioned tooltip shadow. Dark default on `:root`, light first-class via `[data-theme="light"]`, `color-scheme` set per theme.

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

### Components — comprehensive dashboard kit (one wave, ~35)

Everything required to build a dashboard, by category:

- **core**: Icon (typed name union — unknown icon is a compile error, not a silent circle fallback), Button (variants: primary / secondary / tertiary / danger — in this doctrine primary = ink-inverse fill, secondary = surface + hairline border, tertiary = ghost text), IconButton, Badge, StatusPill, StatusDot (bare dot + soft glow + slow breathe — the daemon-dot signature), CountBadge, Avatar, Kbd (shortcut cap — tooltip use only per the no-hint-microcopy rule), Divider, Link (styled anchor — Preflight-off means bare `<a>` is UA blue otherwise)
- **typography**: PageHeader (title + subtitle — kills the 8×-copy-pasted heading block), SectionHeading
- **layout**: AppShell (fixed rail slot + header slot + scrollable content — kills per-app Shell rebuilds), PageColumn (tokenised max-width + gutters, full-bleed opt-out — kills the negative-margin hack), Card (the dashboard hand-rolls a CARD literal today)
- **navigation**: Rail (icon-only 56px, hover/focus flyout labels), Tabs, Menu (anchored action/kebab menu), CommandMenu (Cmd+K palette — filterable list, keyboard nav)
- **forms**: FormField (label + hint + error wrapper), Input, Textarea, Select, MultiSelect, SearchField, Checkbox, RadioGroup, Switch, SegmentedControl, FilterChip, RangeInput, DateInput (styled native `<input type="date">` — no picker lib)
- **data**: Table (render-prop columns, sticky header, sortable), KpiTile, MetricDelta, Sparkline, TrendChart, KeyValue (label/value meta rows on `--row-h` with hairline separators), Pagination
- **feedback**: Modal, Drawer, Toast, Tooltip (CSS transitions — no gsap, keeps the library zero-dep), InlineAlert, EmptyState, Skeleton, Spinner, Progress
- **utils**: focusTrap, scrollLock, format helpers (`compactNumber`/`pct`)

~47 components. Later waves: whatever the next dashboard actually needs — nothing speculative beyond this kit.

### Component API conventions

- Typed props, no `any`. Variants are union-typed props mapping to modifier classes.
- `className` + `style` passthrough on every component root.
- Table keeps render-prop columns (the pattern the dashboard already consumes).

## Enforcement

Port scout's adherence approach: token inventory JSON → generated eslint config (forbid raw hex/px/font-families, barrel-only imports). Wave 2, after the token set settles.

## Publishing

npm, semver per package, published from the public GitHub repo. Playground deploys nowhere (local only) until there's a reason.

## Non-goals

No Tailwind. No CSS-in-JS. No runtime dependencies. No app-specific components (logos, domain badges, platform tags).
