# Typography

Generated from `src/components/typography` — do not edit by hand, run `npm run docs`.

- [PageHeader](#pageheader) — The view title block (replaces the 8×-copy-pasted heading).
- [SectionHeading](#sectionheading)

## Components

### PageHeader

The view title block (replaces the 8×-copy-pasted heading).

`PageHeader` · props `PageHeaderProps` · [`packages/ledger/src/components/typography/PageHeader.tsx`](../../packages/ledger/src/components/typography/PageHeader.tsx)

`actions` exists because every page put buttons beside its title and had to
hand-roll the flex row to do it — SectionHeading already owned that slot, and
the more important header didn't. Markers (a Badge naming the environment)
belong inside `title`, not in `actions`: a 18px pill in a row of 36px
controls steps the row.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` **·** required | `ReactNode` | — |  |
| `subtitle` | `ReactNode` | — | Muted one-liner under the title. |
| `actions` | `ReactNode` | — | Right-hand controls, on the title's baseline. |

Also accepts every prop of `Omit<HTMLAttributes<HTMLElement>, "title">` — they are spread onto the underlying element.

```tsx
<PageHeader
  title="Reconciliation"
  subtitle="Barclays current account · 12 August 2026"
  actions={<Button variant="primary">Export CSV</Button>}
/>
```

### SectionHeading

`SectionHeading` · props `SectionHeadingProps` · [`packages/ledger/src/components/typography/SectionHeading.tsx`](../../packages/ledger/src/components/typography/SectionHeading.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` **·** required | `ReactNode` | — |  |
| `actions` | `ReactNode` | — | Right-aligned slot for actions (buttons, filters). |

Also accepts every prop of `Omit<HTMLAttributes<HTMLDivElement>, "title">` — they are spread onto the underlying element.

```tsx
<SectionHeading
  title="Outstanding invoices"
  actions={<Link href="/invoices">View all</Link>}
/>
```
