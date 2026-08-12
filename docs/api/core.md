# Core

Generated from `src/components/core` — do not edit by hand, run `npm run docs`.

- [Icon](#icon) — The styling wrapper around a lucide-react glyph (ISC licensed, the system's one sanctioned runtime dependency).
- [Button](#button) — Single size on purpose — the kit ships one button height, no `size` prop.
- [IconButton](#iconbutton) — The icon-only control.
- [Badge](#badge)
- [StatusPill](#statuspill) — Single size on purpose — the kit ships one pill height, no `size` prop.
- [StatusDot](#statusdot)
- [CountBadge](#countbadge)
- [Avatar](#avatar)
- [Kbd](#kbd)
- [Divider](#divider)
- [Link](#link)

## Components

### Icon

The styling wrapper around a lucide-react glyph (ISC licensed, the system's one sanctioned runtime dependency). Every icon in the kit renders at the same default box, stroke and currentColor; consumers pass the component, not a name string:

`Icon` · props `IconProps` · [`packages/ledger/src/components/core/Icon.tsx`](../../packages/ledger/src/components/core/Icon.tsx)

```text
  import { Search } from "lucide-react";
  <Icon as={Search} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` **·** required | `LucideIcon` | — | Any lucide-react icon component. |
| `size` | `number` | `17` | Rendered box in px. Defaults to 17 — see the note on the component. |
| `strokeWidth` | `number` | `2` |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
import { Search } from "lucide-react";

<Icon as={Search} />
```

### Button

Single size on purpose — the kit ships one button height, no `size` prop. Text only: a control is either a word or a glyph, never both. Icon + label gives one action two competing readings and two widths for the same string. Reach for IconButton when the glyph is the whole message.

`Button` · props `ButtonProps` · [`packages/ledger/src/components/core/Button.tsx`](../../packages/ledger/src/components/core/Button.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `ButtonVariant` | `"secondary"` | primary = accent fill · secondary = surface + hairline · tertiary = ghost text · danger = the semantic red |
| `type` | `"submit" \| "reset" \| "button"` | `"button"` | _(inherited)_ |

Also accepts every prop of `ButtonHTMLAttributes<HTMLButtonElement>` — they are spread onto the underlying element.

```tsx
<Button variant="primary" onClick={createInvoice}>New invoice</Button>
```

### IconButton

The icon-only control. A glyph alone is only legible if it says what it is on hover, so the tooltip is built in rather than left to every caller to wrap: `title` was the browser's own chrome and could not be styled, shown on focus, or dismissed per WCAG 1.4.13.

`IconButton` · props `IconButtonProps` · [`packages/ledger/src/components/core/IconButton.tsx`](../../packages/ledger/src/components/core/IconButton.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` **·** required | `LucideIcon` | — |  |
| `label` **·** required | `string` | — | Accessible name — becomes aria-label and, by default, the tooltip. |
| `active` | `boolean` | `false` | Persistent pressed look (toolbar toggles). |
| `variant` | `"control" \| "bare"` | `"control"` | `control` (default) is the 36px box that lines up with Button. `bare` drops the box entirely — for a glyph annotating a heading or a row, where a control-sized target around a 17px icon is all chrome and no message. Still a button, so it keeps focus and the tooltip. |
| `tooltip` | `ReactNode \| false` | — | Override the tip text, or `false` to suppress it (menu triggers, toolbars that already name themselves). Defaults to `label`. |
| `tooltipSide` | `TooltipSide` | `"top"` |  |
| `type` | `"submit" \| "reset" \| "button"` | `"button"` | _(inherited)_ |

Also accepts every prop of `ButtonHTMLAttributes<HTMLButtonElement>` — they are spread onto the underlying element.

```tsx
<IconButton icon={RefreshCw} label="Refresh balances" onClick={reload} />
```

### Badge

`Badge` · props `BadgeProps` · [`packages/ledger/src/components/core/Badge.tsx`](../../packages/ledger/src/components/core/Badge.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `BadgeTone` | `"neutral"` |  |
| `variant` | `BadgeVariant` | `"subtle"` |  |
| `dot` | `boolean` | `false` | Leading status dot. |

Also accepts every prop of `HTMLAttributes<HTMLSpanElement>` — they are spread onto the underlying element.

```tsx
<Badge tone="warning" dot>Awaiting settlement</Badge>
```

### StatusPill

Single size on purpose — the kit ships one pill height, no `size` prop.

`StatusPill` · props `StatusPillProps` · [`packages/ledger/src/components/core/StatusPill.tsx`](../../packages/ledger/src/components/core/StatusPill.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `status` | `StatusPillStatus` | `"unknown"` |  |
| `label` | `ReactNode` | — | Names the pillar (e.g. "Growth", "Brand safety"). |
| `value` | `ReactNode` | — | Optional tabular numeric value beside the label. |

Also accepts every prop of `HTMLAttributes<HTMLSpanElement>` — they are spread onto the underlying element.

```tsx
<StatusPill status="watch" label="Faster Payments" value="98.2%" />
```

### StatusDot

`StatusDot` · props `StatusDotProps` · [`packages/ledger/src/components/core/StatusDot.tsx`](../../packages/ledger/src/components/core/StatusDot.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `status` | `StatusDotStatus` | `"unknown"` |  |
| `label` | `string` | — | Accessible name; defaults to the status word. |

Also accepts every prop of `HTMLAttributes<HTMLSpanElement>` — they are spread onto the underlying element.

```tsx
<StatusDot status="good" label="HMRC gateway" />
```

### CountBadge

`CountBadge` · props `CountBadgeProps` · [`packages/ledger/src/components/core/CountBadge.tsx`](../../packages/ledger/src/components/core/CountBadge.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` **·** required | `number` | — |  |
| `max` | `number` | `99` | Values above this render as "max+". Defaults to 99. |
| `tone` | `CountBadgeTone` | `"neutral"` |  |

Also accepts every prop of `HTMLAttributes<HTMLSpanElement>` — they are spread onto the underlying element.

```tsx
<CountBadge count={128} max={99} tone="accent" />
```

### Avatar

`Avatar` · props `AvatarProps` · [`packages/ledger/src/components/core/Avatar.tsx`](../../packages/ledger/src/components/core/Avatar.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | — |  |
| `name` | `string` | `""` |  |
| `size` | `number` | `32` | Box size in px. Defaults to 32. |
| `indicator` | `AvatarIndicator` | — | Small corner status dot. |
| `square` | `boolean` | `false` |  |
| `decorative` | `boolean` | `false` | Set when the same name is visibly adjacent — hides the avatar from AT. |

Also accepts every prop of `HTMLAttributes<HTMLSpanElement>` — they are spread onto the underlying element.

```tsx
<Avatar name="Priya Raghunathan" indicator="success" />
```

### Kbd

`Kbd` · props `KbdProps` · [`packages/ledger/src/components/core/Kbd.tsx`](../../packages/ledger/src/components/core/Kbd.tsx)

_No props of its own._

Also accepts every prop of `HTMLAttributes<HTMLElement>` — they are spread onto the underlying element.

```tsx
Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search
```

### Divider

`Divider` · props `DividerProps` · [`packages/ledger/src/components/core/Divider.tsx`](../../packages/ledger/src/components/core/Divider.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |  |

Also accepts every prop of `HTMLAttributes<HTMLDivElement>` — they are spread onto the underlying element.

```tsx
<Divider />
<Divider orientation="vertical" />
```

### Link

`Link` · props `LinkProps` · [`packages/ledger/src/components/core/Link.tsx`](../../packages/ledger/src/components/core/Link.tsx)

_No props of its own._

Also accepts every prop of `AnchorHTMLAttributes<HTMLAnchorElement>` — they are spread onto the underlying element.

```tsx
<Link href="https://find-and-update.company-information.service.gov.uk">
  Companies House
</Link>
```

## Types

### LucideIcon

Re-exported from `lucide-react`.

### ButtonVariant

```ts
type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
```

### BadgeTone

```ts
type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
```

### BadgeVariant

```ts
type BadgeVariant = "subtle" | "solid" | "outline";
```

### StatusPillStatus

```ts
type StatusPillStatus = "good" | "watch" | "risk" | "unknown";
```

### StatusDotStatus

```ts
type StatusDotStatus = "good" | "watch" | "risk" | "unknown";
```

### CountBadgeTone

```ts
type CountBadgeTone = "neutral" | "accent" | "danger";
```

### AvatarIndicator

```ts
type AvatarIndicator = "success" | "warning" | "danger" | "neutral" | "accent";
```
