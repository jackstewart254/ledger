# Feedback

Generated from `src/components/feedback` — do not edit by hand, run `npm run docs`.

- [Modal](#modal) — Centered dialog on the scrim.
- [Drawer](#drawer) — Right-side sheet for filters/details.
- [Toast](#toast) — Transient notification for the bottom-right stack.
- [ToastViewport](#toastviewport) — Fixed bottom-right stack for toasts — outranks every interactive layer.
- [Tooltip](#tooltip) — Hover/focus label.
- [InlineAlert](#inlinealert) — One line, always: tone glyph, the headline, an info glyph carrying the detail, then whatever you can do about it.
- [EmptyState](#emptystate) — A muted glyph, one line, and an action if there is one to take.
- [Skeleton](#skeleton) — Shimmer loading placeholder.
- [Spinner](#spinner) — Minimal stroke arc on currentColor; inherits the text color of its context.
- [Progress](#progress) — Hairline track + accent fill, 0 to max.

## Components

### Modal

Centered dialog on the scrim. Surface-raised panel, hairline border, the sanctioned shadow. Focus trapped, body scroll locked, Escape and overlay-click close. Title + footer slots. Portaled to &lt;body> so a transformed or filtered ancestor can never re-base its fixed positioning.

`Modal` · props `ModalProps` · [`packages/ledger/src/components/feedback/Modal.tsx`](../../packages/ledger/src/components/feedback/Modal.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` **·** required | `boolean` | — |  |
| `onClose` **·** required | `() => void` | — |  |
| `title` | `ReactNode` | — |  |
| `children` | `ReactNode` | — |  |
| `footer` | `ReactNode` | — | Right-aligned action slot under a hairline. |
| `width` | `number` | `480` | Panel width in px (dynamic — passed as a custom property). |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Modal
  open={open}
  onClose={close}
  title="Void invoice INV-2214"
  footer={
    <>
      <Button onClick={close}>Cancel</Button>
      <Button variant="danger" onClick={voidInvoice}>Void</Button>
    </>
  }
>
  This cannot be undone. The credit note stays on the ledger.
</Modal>
```

### Drawer

Right-side sheet for filters/details. Slides in over the scrim, focus trapped, scroll locked, Escape and overlay-click close. Header + scrollable body + optional sticky footer. Portaled to &lt;body> so a transformed or filtered ancestor can never re-base its fixed positioning.

`Drawer` · props `DrawerProps` · [`packages/ledger/src/components/feedback/Drawer.tsx`](../../packages/ledger/src/components/feedback/Drawer.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` **·** required | `boolean` | — |  |
| `onClose` **·** required | `() => void` | — |  |
| `title` | `ReactNode` | — |  |
| `children` | `ReactNode` | — |  |
| `footer` | `ReactNode` | — |  |
| `width` | `number` | `360` | Panel width in px (dynamic — passed as a custom property). |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Drawer open={open} onClose={close} title="Transaction detail" width={420}>
  <KeyValue items={detail} />
</Drawer>
```

### Toast

Transient notification for the bottom-right stack. Semantic tone colors the leading icon only; auto-dismisses via `duration` when `onClose` is provided. Render inside a ToastViewport, which owns the live region.

`Toast` · props `ToastProps` · [`packages/ledger/src/components/feedback/Toast.tsx`](../../packages/ledger/src/components/feedback/Toast.tsx)

There is no `warning` tone, by design. The line here is lifetime, not
severity: a toast is transient and takes its message with it when it
dismisses, so a warning the user has to ACT on cannot live in one — once it
is gone there is no way back to it. That case belongs in `InlineAlert`,
which persists next to the thing it is about. If the message is still true
after five seconds, it needs a component that is still on screen.

Nor is there an `info` tone: `neutral` is info.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `ToastTone` | `"neutral"` |  |
| `title` **·** required | `ReactNode` | — |  |
| `description` | `ReactNode` | — |  |
| `action` | `ReactNode` | — | Action slot (e.g. an undo button). |
| `onClose` | `() => void` | — |  |
| `duration` | `number` | `5000` | Auto-dismiss delay in ms; 0 disables. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Toast
  tone="success"
  title="Reconciled"
  description="42 transactions matched to invoices."
  onClose={dismiss}
  duration={5000}
/>
```

### ToastViewport

Fixed bottom-right stack for toasts — outranks every interactive layer. Carries the live region: it is mounted for the life of the page, so toasts appearing inside it are announced. A region inserted together with its own content routinely is not.

`ToastViewport` · props `ToastViewportProps` · [`packages/ledger/src/components/feedback/Toast.tsx`](../../packages/ledger/src/components/feedback/Toast.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` **·** required | `ReactNode` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<ToastViewport>
  {toasts.map((t) => (
    <Toast key={t.id} {...t} onClose={() => dismiss(t.id)} />
  ))}
</ToastViewport>
```

### Tooltip

Hover/focus label. Wraps a single child; shows on delay. Portaled to &lt;body> with fixed positioning, so no ancestor (overflow clip, transform, stacking context) can cut it off or re-base its coordinates. Pops from the anchor side on enter, fades on exit — CSS transitions only, which keeps the library zero-dep. Reduced motion lands the same end states instantly. The unmount is on a timer rather than transitionend, because a hidden tab may never fire one.

`Tooltip` · props `TooltipProps` · [`packages/ledger/src/components/feedback/Tooltip.tsx`](../../packages/ledger/src/components/feedback/Tooltip.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` **·** required | `ReactNode` | — |  |
| `side` | `TooltipSide` | `"top"` |  |
| `delay` | `number` | `150` | Hover intent delay in ms. |
| `children` **·** required | `ReactNode` | — |  |
| `className` | `string` | — | Passthrough for the tip itself. |
| `style` | `CSSProperties` | — |  |
| `wrapperClassName` | `string` | — |  |
| `wrapperStyle` | `CSSProperties` | — |  |

```tsx
<Tooltip label="Last synced 09:41" side="bottom">
  <StatusDot status="good" />
</Tooltip>
```

### InlineAlert

One line, always: tone glyph, the headline, an info glyph carrying the detail, then whatever you can do about it.

`InlineAlert` · props `InlineAlertProps` · [`packages/ledger/src/components/feedback/InlineAlert.tsx`](../../packages/ledger/src/components/feedback/InlineAlert.tsx)

The detail used to sit under the headline as a second line of muted prose,
which made every alert a two-line block whose second line most readers skip —
and gave the alert a variable height that shoved the page around. The
headline says what happened; the paragraph explaining it is reference
material, so it goes where reference material goes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `InlineAlertTone` | `"accent"` |  |
| `title` | `ReactNode` | — |  |
| `children` | `ReactNode` | — | The detail. Lives behind the info glyph, not on a second line. |
| `action` | `ReactNode` | — | Trailing action slot. |
| `onClose` | `() => void` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<InlineAlert tone="warning" title="Two statements unmatched" onClose={dismiss}>
  Upload the July statement to finish the quarter.
</InlineAlert>
```

### EmptyState

A muted glyph, one line, and an action if there is one to take.

`EmptyState` · props `EmptyStateProps` · [`packages/ledger/src/components/feedback/EmptyState.tsx`](../../packages/ledger/src/components/feedback/EmptyState.tsx)

No description slot on purpose. A paragraph of explanation is hint microcopy
(the kit bans it elsewhere for the same reason) and it lands where the reader
is least interested: a panel with nothing in it. Whatever the paragraph said
belongs in the title if it matters, or a tooltip on the panel's own control
if it doesn't.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `LucideIcon` | `Inbox` |  |
| `title` **·** required | `ReactNode` | — |  |
| `action` | `ReactNode` | — |  |
| `compact` | `boolean` | `false` |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<EmptyState
  icon={Inbox}
  title="Every transaction to 12 August is matched"
  action={<Button variant="primary">Import statement</Button>}
/>
```

### Skeleton

Shimmer loading placeholder. Shapes: text (one line), rect (block), circle. Size overrides are dynamic values, fed as custom properties.

`Skeleton` · props `SkeletonProps` · [`packages/ledger/src/components/feedback/Skeleton.tsx`](../../packages/ledger/src/components/feedback/Skeleton.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `shape` | `SkeletonShape` | `"text"` |  |
| `width` | `number \| string` | — |  |
| `height` | `number \| string` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Skeleton shape="text" width="60%" />
<Skeleton shape="circle" width={32} height={32} />
```

### Spinner

Minimal stroke arc on currentColor; inherits the text color of its context. Decorative unless a `label` is given. Single size on purpose — the kit ships one spinner size, no `size` prop.

`Spinner` · props `SpinnerProps` · [`packages/ledger/src/components/feedback/Spinner.tsx`](../../packages/ledger/src/components/feedback/Spinner.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | — | Accessible status label; omit for a purely decorative spinner. |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Spinner label="Fetching statements" />
```

### Progress

Hairline track + accent fill, 0 to max.

`Progress` · props `ProgressProps` · [`packages/ledger/src/components/feedback/Progress.tsx`](../../packages/ledger/src/components/feedback/Progress.tsx)

Determinate only. An indeterminate variant was tried and cut: a chunk
sliding back and forth reports nothing, and Spinner already covers "working,
duration unknown". If you can't measure it, don't draw a bar.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 0–max. |
| `max` | `number` | `100` |  |
| `aria-label` | `string` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<Progress value={68} max={100} aria-label="Importing statements" />
```

## Types

### ToastTone

```ts
type ToastTone = "neutral" | "success" | "danger";
```

### TooltipSide

```ts
type TooltipSide = "top" | "bottom" | "left" | "right";
```

### InlineAlertTone

InlineAlert — semantic subtle-bg row with a tone icon. The `accent` tone carries the house blue; `neutral` is the one that stays out of the way, and green/yellow/red are reserved for success/warning/danger.

```ts
type InlineAlertTone = "accent" | "neutral" | "success" | "warning" | "danger";
```

### SkeletonShape

```ts
type SkeletonShape = "text" | "rect" | "circle";
```
