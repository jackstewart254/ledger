# Forms

Generated from `src/components/forms` — do not edit by hand, run `npm run docs`.

- [FormField](#formfield) — Label + control slot + error line.
- [Input](#input) — Text field on the shared .lg-control frame.
- [DatePicker](#datepicker) — .lg-control trigger + an anchored month grid.
- [Select](#select) — Styled native &lt;select> on the .lg-control frame, chevron overlay.
- [SearchField](#searchfield) — Input frame + search icon + clear button.
- [MultiSelect](#multiselect) — Trigger with chip summary + checkbox popover list.
- [FilterChip](#filterchip) — Toggleable chip.
- [Textarea](#textarea) — The Input voice, auto min-height via --row-h multiples.
- [Checkbox](#checkbox) — Styled native input, custom-drawn box, Lucide check/minus mark.
- [RadioGroup](#radiogroup) — Styled native radios, matches the Checkbox voice.
- [Switch](#switch) — Track + thumb toggle.
- [SegmentedControl](#segmentedcontrol) — Exclusive picker in a hairline group; the active segment raises to --surface-raised.
- [RangeInput](#rangeinput) — A native range with a filled track: the accent up to the thumb, faint after it, so the value reads at a glance instead of being inferred from the thumb's position against nothing.

## Components

### FormField

Label + control slot + error line. Wires aria-describedby / aria-invalid onto a single element child.

`FormField` · props `FormFieldProps` · [`packages/ledger/src/components/forms/FormField.tsx`](../../packages/ledger/src/components/forms/FormField.tsx)

There is deliberately NO hint slot. Explainer text under a field is a model
narrating its own interface; a field that needs a caption to be understood
needs a better label or a better control. Errors stay — those report
something the user could not have known in advance.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` **·** required | `ReactNode` | — |  |
| `error` | `ReactNode` | — | Error line — marks the control invalid. The only text under a field. |
| `htmlFor` | `string` | — | Control id — defaults to the child's id, else an auto id. |
| `children` **·** required | `ReactNode` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<FormField label="Sort code" htmlFor="sort-code" error={errors.sortCode}>
  <Input id="sort-code" placeholder="20-00-00" invalid={Boolean(errors.sortCode)} />
</FormField>
```

### Input

Text field on the shared .lg-control frame. className/style land on the frame; every other native prop reaches the inner &lt;input> (so FormField's aria wiring lands on the control itself).

`Input` · props `InputProps` · [`packages/ledger/src/components/forms/Input.tsx`](../../packages/ledger/src/components/forms/Input.tsx)

Single size on purpose — the kit ships one control height, no `size` prop.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `invalid` | `boolean` | `false` |  |
| `icon` | `LucideIcon` | — | Optional leading icon — a lucide-react component. |

Also accepts every prop of `Omit<ComponentProps<"input">, "size" | "ref">` — they are spread onto the underlying element.

```tsx
<Input icon={Building2} placeholder="Account name" defaultValue="Marlow Joinery Ltd" />
```

### DatePicker

.lg-control trigger + an anchored month grid. Replaces the native &lt;input type="date">, whose popup is the browser's own chrome and cannot be styled. Arrows move by day, PageUp/PageDown by month, Home/End to the week's ends, Enter/Space selects (native button activation); Escape or an outside click closes. Controlled or uncontrolled.

`DatePicker` · props `DatePickerProps` · [`packages/ledger/src/components/forms/DatePicker.tsx`](../../packages/ledger/src/components/forms/DatePicker.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Date \| string` | — | Controlled selection. Date, or an ISO `YYYY-MM-DD` string. |
| `defaultValue` | `Date \| string` | — |  |
| `onChange` | `(date: Date) => void` | — |  |
| `min` | `Date \| string` | — | Selectable range — days outside it render disabled. |
| `max` | `Date \| string` | — |  |
| `placeholder` | `string` | `"Select date"` |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

Also accepts every prop of `Omit<ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "ref">` — they are spread onto the underlying element.

```tsx
<DatePicker
  value={periodEnd}
  onChange={setPeriodEnd}
  min="2026-04-06"
  max="2027-04-05"
  placeholder="Period end"
/>
```

### Select

Styled native &lt;select> on the .lg-control frame, chevron overlay. Single size on purpose — the kit ships one control size, no `size` prop.

`Select` · props `SelectProps` · [`packages/ledger/src/components/forms/Select.tsx`](../../packages/ledger/src/components/forms/Select.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `invalid` | `boolean` | `false` |  |
| `options` | `SelectOption[]` | — | Option list — or pass &lt;option> children instead. |
| `placeholder` | `string` | — |  |

Also accepts every prop of `Omit<ComponentProps<"select">, "size" | "ref">` — they are spread onto the underlying element.

```tsx
<Select
  options={[
    { value: "gbp", label: "GBP — Pound sterling" },
    { value: "eur", label: "EUR — Euro" },
    { value: "usd", label: "USD — US dollar", disabled: true },
  ]}
  value={currency}
  onChange={(e) => setCurrency(e.target.value)}
/>
```

### SearchField

Input frame + search icon + clear button. Single size on purpose — the kit ships one control size, no `size` prop.

`SearchField` · props `SearchFieldProps` · [`packages/ledger/src/components/forms/SearchField.tsx`](../../packages/ledger/src/components/forms/SearchField.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `onClear` | `() => void` | — | Called after the clear button empties the field. |

Also accepts every prop of `Omit<ComponentProps<"input">, "size" | "type" | "ref">` — they are spread onto the underlying element.

```tsx
<SearchField
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  placeholder="Search transactions"
/>
```

### MultiSelect

Trigger with chip summary + checkbox popover list. Real checkboxes in the popover keep it keyboard accessible (tab + space); Esc or an outside click closes it. Controlled or uncontrolled.

`MultiSelect` · props `MultiSelectProps` · [`packages/ledger/src/components/forms/MultiSelect.tsx`](../../packages/ledger/src/components/forms/MultiSelect.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` **·** required | `MultiSelectOption[]` | — |  |
| `value` | `string[]` | — | Controlled selection. |
| `defaultValue` | `string[]` | — |  |
| `onChange` | `(next: string[]) => void` | — |  |
| `placeholder` | `string` | `"Any"` |  |
| `searchable` | `boolean` | — | Filter row inside the popover. Defaults to on from 8 options up — a short list doesn't earn one. |
| `width` | `number \| string` | `220` |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

Also accepts every prop of `Omit<ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "ref">` — they are spread onto the underlying element.

```tsx
<MultiSelect
  options={[
    { value: "barclays", label: "Barclays · Current", count: 412 },
    { value: "starling", label: "Starling · Business", count: 189 },
    { value: "revolut", label: "Revolut · EUR", count: 24 },
  ]}
  value={accounts}
  onChange={setAccounts}
  placeholder="All accounts"
  searchable
/>
```

### FilterChip

Toggleable chip. Active is carried by the fill and border shift alone: the chip IS the toggle, so an × inside it is a second control for the thing the whole chip already does, and it makes the active chip a different width from the inactive one.

`FilterChip` · props `FilterChipProps` · [`packages/ledger/src/components/forms/FilterChip.tsx`](../../packages/ledger/src/components/forms/FilterChip.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `boolean` | — | Controlled active state. |
| `defaultActive` | `boolean` | `false` |  |
| `onChange` | `(active: boolean) => void` | — |  |
| `count` | `number` | — |  |
| `onClear` | `() => void` | — | Called when the chip is toggled off. |
| `children` **·** required | `ReactNode` | — |  |

Also accepts every prop of `Omit<ComponentProps<"button">, "onChange" | "value" | "ref">` — they are spread onto the underlying element.

```tsx
<FilterChip active={unreconciled} onChange={setUnreconciled} count={8}>
  Unreconciled
</FilterChip>
```

### Textarea

The Input voice, auto min-height via --row-h multiples. Single size on purpose — the kit ships one control size, no `size` prop.

`Textarea` · props `TextareaProps` · [`packages/ledger/src/components/forms/Textarea.tsx`](../../packages/ledger/src/components/forms/Textarea.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `invalid` | `boolean` | `false` |  |
| `minRows` | `number` | `2` | Minimum height in --row-h multiples (not native rows). |

Also accepts every prop of `Omit<ComponentProps<"textarea">, "rows" | "ref">` — they are spread onto the underlying element.

```tsx
<Textarea
  minRows={3}
  placeholder="Note for the auditor"
  defaultValue="Cleared against remittance 8841."
/>
```

### Checkbox

Styled native input, custom-drawn box, Lucide check/minus mark. Controlled or uncontrolled via the native props.

`Checkbox` · props `CheckboxProps` · [`packages/ledger/src/components/forms/Checkbox.tsx`](../../packages/ledger/src/components/forms/Checkbox.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — |  |
| `indeterminate` | `boolean` | `false` |  |

Also accepts every prop of `Omit<ComponentProps<"input">, "type" | "size" | "ref">` — they are spread onto the underlying element.

```tsx
<Checkbox label="Include VAT" defaultChecked />
```

### RadioGroup

Styled native radios, matches the Checkbox voice.

`RadioGroup` · props `RadioGroupProps` · [`packages/ledger/src/components/forms/RadioGroup.tsx`](../../packages/ledger/src/components/forms/RadioGroup.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` **·** required | `RadioOption[]` | — |  |
| `value` | `string` | — | Controlled value. |
| `defaultValue` | `string` | — |  |
| `onChange` | `(value: string) => void` | — |  |
| `name` | `string` | — | Shared input name — auto-generated when unset. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |  |
| `disabled` | `boolean` | `false` |  |
| `aria-label` | `string` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<RadioGroup
  name="basis"
  options={[
    { value: "accrual", label: "Accrual" },
    { value: "cash", label: "Cash" },
  ]}
  value={basis}
  onChange={setBasis}
  orientation="horizontal"
/>
```

### Switch

Track + thumb toggle. Controlled or uncontrolled. Single size on purpose — the kit ships one control size, no `size` prop.

`Switch` · props `SwitchProps` · [`packages/ledger/src/components/forms/Switch.tsx`](../../packages/ledger/src/components/forms/Switch.tsx)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | — |  |
| `defaultChecked` | `boolean` | `false` |  |
| `onChange` | `(checked: boolean) => void` | — |  |
| `label` | `ReactNode` | — |  |

Also accepts every prop of `Omit<ComponentProps<"button">, "onChange" | "value" | "ref">` — they are spread onto the underlying element.

```tsx
<Switch checked={autoMatch} onChange={setAutoMatch} label="Auto-match payments" />
```

### SegmentedControl

Exclusive picker in a hairline group; the active segment raises to --surface-raised. Radio semantics (it picks a value, Tabs own the tablist pattern): one tab stop, arrow keys move the selection.

`SegmentedControl` · props `SegmentedControlProps` · [`packages/ledger/src/components/forms/SegmentedControl.tsx`](../../packages/ledger/src/components/forms/SegmentedControl.tsx)

Single size on purpose — the kit ships one control size, no `size` prop.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` **·** required | `Array<SegmentOption \| string>` | — |  |
| `value` | `string` | — | Controlled value. |
| `defaultValue` | `string` | — |  |
| `onChange` | `(value: string) => void` | — |  |
| `disabled` | `boolean` | `false` |  |
| `aria-label` | `string` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

```tsx
<SegmentedControl
  options={["Day", "Week", "Month"]}
  value={grain}
  onChange={setGrain}
  aria-label="Time grain"
/>
```

### RangeInput

A native range with a filled track: the accent up to the thumb, faint after it, so the value reads at a glance instead of being inferred from the thumb's position against nothing.

`RangeInput` · props `RangeInputProps` · [`packages/ledger/src/components/forms/RangeInput.tsx`](../../packages/ledger/src/components/forms/RangeInput.tsx)

Deliberately NOT wrapped in the `.lg-control` frame. A pill frame is the
shape for something you type into; around a slider it reads as a text field
someone dropped a dot into, and it forces a second rail inside the first.
The fill percentage rides a custom property because no browser exposes the
filled portion of a native range to CSS.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `min` | `string \| number` | `0` | _(inherited)_ |
| `max` | `string \| number` | `100` | _(inherited)_ |

Also accepts every prop of `Omit<ComponentProps<"input">, "type" | "size" | "ref">` — they are spread onto the underlying element.

```tsx
<RangeInput
  min={0}
  max={5000}
  step={50}
  value={threshold}
  onChange={(e) => setThreshold(Number(e.target.value))}
/>
```

## Types

### SelectOption

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `string` | — |  |
| `label` **·** required | `string` | — |  |
| `disabled` | `boolean` | — |  |

### MultiSelectOption

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `string` | — |  |
| `label` **·** required | `string` | — |  |
| `count` | `number` | — |  |

### RadioOption

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `string` | — |  |
| `label` **·** required | `ReactNode` | — |  |
| `disabled` | `boolean` | — |  |

### SegmentOption

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` **·** required | `string` | — |  |
| `label` **·** required | `ReactNode` | — |  |
| `disabled` | `boolean` | — |  |
