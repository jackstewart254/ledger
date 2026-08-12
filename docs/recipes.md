# Ledger — recipes

Composed patterns, pulled from the five demo pages in the playground rather than
invented for the document. Every sample compiles against the barrel; the layout
CSS beside each one is written the way the playground writes it — grid and
spacing only, kit tokens only, its own class prefix, no colour or type or chrome
that a component already draws.

Assumes you have done the setup in [guide.md](./guide.md): the stylesheet
imported once, `data-theme` on `<html>`, Geist loaded.

1. [Dashboard shell with a routing rail](#1-dashboard-shell-with-a-routing-rail)
2. [Filterable table page, with empty and loading states](#2-filterable-table-page-with-empty-and-loading-states)
3. [Settings form with validation](#3-settings-form-with-validation)
4. [A KPI row](#4-a-kpi-row)
5. [Detail drawer opened from a table row](#5-detail-drawer-opened-from-a-table-row)

---

## 1. Dashboard shell with a routing rail

The chrome: an icon rail that routes, a three-slot header, and a command palette
on `⌘K`. The rail's active item is state you own — it works the same wired to a
router, with `href` on `RailItem` instead of `onClick`.

Note what is *not* here: no `PageHeader` on the page below. The shell header
already carries the breadcrumb, the environment marker and the view-level
actions, so the content column starts on real content. Adding a page title under
a header that already names the page is the most common way to make a page built
with this kit look wrong.

```tsx
import { useEffect, useState, type ReactNode } from "react";
import { Activity, Bell, Boxes, MoreHorizontal, Play, RefreshCw, ScrollText, Settings, Terminal } from "lucide-react";
import {
  AppShell,
  Badge,
  Icon,
  IconButton,
  Menu,
  Rail,
  RailItem,
  SearchField,
  CommandMenu,
} from "@mcleanstewart/ledger";
import type { CommandMenuItem, LucideIcon } from "@mcleanstewart/ledger";
import "./shell.css";

type PageId = "overview" | "daemons" | "runs" | "alerts" | "settings";

const RAIL: Array<{ id: PageId; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "daemons", label: "Daemons", icon: Boxes },
  { id: "runs", label: "Runs", icon: ScrollText },
  { id: "alerts", label: "Alerts", icon: Bell },
];

const CRUMB: Record<PageId, { root: string; leaf: string }> = {
  overview: { root: "ops", leaf: "overview" },
  daemons: { root: "ops", leaf: "daemons" },
  runs: { root: "ops", leaf: "runs" },
  alerts: { root: "ops", leaf: "alerts" },
  settings: { root: "workspace", leaf: "settings" },
};

export default function Shell({ pages }: { pages: Record<PageId, ReactNode> }) {
  const [page, setPage] = useState<PageId>("daemons");
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "k" || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      setCmdOpen((open) => !open);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const commands: CommandMenuItem[] = RAIL.map((r) => ({
    id: r.id,
    label: r.label,
    group: "Go to",
    icon: r.icon,
    onSelect: () => setPage(r.id),
  }));

  return (
    <>
      <AppShell
        rail={
          <Rail
            aria-label="Ops"
            footer={
              <RailItem
                icon={Settings}
                label="Settings"
                active={page === "settings"}
                onClick={() => setPage("settings")}
              />
            }
          >
            {RAIL.map((r) => (
              <RailItem
                key={r.id}
                icon={r.icon}
                label={r.label}
                active={page === r.id}
                onClick={() => setPage(r.id)}
              />
            ))}
          </Rail>
        }
        header={
          <span className="rc-row">
            <Icon as={Terminal} />
            {CRUMB[page].root}
            <span className="rc-dim">/</span>
            <span className="rc-muted">{CRUMB[page].leaf}</span>
            {page === "daemons" && (
              <Badge tone="neutral" variant="outline" dot>
                prod
              </Badge>
            )}
          </span>
        }
        search={
          <>
            <IconButton icon={RefreshCw} label="Refresh" tooltip="Last swept 09:41" />
            {/* read-only: the field is a door to the palette, not a second search */}
            <SearchField
              placeholder="Search daemons, runs, hosts…"
              readOnly
              onFocus={() => setCmdOpen(true)}
              onClick={() => setCmdOpen(true)}
            />
            {/* page-level controls belong to the page, not to the shell */}
            {page === "daemons" && (
              <>
                <IconButton icon={Play} label="Run all due" />
                <Menu
                  align="end"
                  trigger={<IconButton icon={MoreHorizontal} label="Fleet actions" />}
                  items={[
                    { label: "Pause every daemon", icon: Play },
                    { label: "Export run history", icon: ScrollText },
                    { label: "Reset all checkpoints", icon: ScrollText, danger: true },
                  ]}
                />
              </>
            )}
          </>
        }
        actions={<IconButton icon={Bell} label="Notifications" />}
      >
        {pages[page]}
      </AppShell>

      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} items={commands} />
    </>
  );
}
```

```css
/* shell.css — layout only. */
.rc-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  min-width: 0;
}
.rc-muted { color: var(--text-muted); }
.rc-dim   { color: var(--text-subtle); }
```

**Why it is shaped like this**

- `Rail` renders glyphs only; the label lives in a flyout that pops on hover and
  focus. Never inline labels in the rail, never letter tiles.
- The `search` slot takes a *cluster*, not just the field — the controls that
  act on what the search is pointed at sit either side of it. Only the field is
  width-constrained (`--search-w`), so the cluster stays centred on the pane.
- `Menu` items carry `danger` for destructive actions rather than a red button
  in the row.
- `CommandMenu` is fully controlled: you own `open` and the item list. It
  filters on `label` plus `keywords`.

---

## 2. Filterable table page, with empty and loading states

The pattern for any "list of records with filters" page: a SectionHeading with
the count and a refresh, a toolbar row of controls, a chip row, the table, and a
footer with the range and pagination.

```tsx
import { useMemo, useState } from "react";
import { ExternalLink, MoreHorizontal, RefreshCw, SearchX, Trash2, X } from "lucide-react";
import {
  Button,
  Card,
  DatePicker,
  EmptyState,
  FilterChip,
  IconButton,
  Menu,
  PageColumn,
  Pagination,
  SearchField,
  SectionHeading,
  Select,
  Skeleton,
  StatusPill,
  Table,
  formatDate,
} from "@mcleanstewart/ledger";
import type { SelectOption, StatusPillStatus, TableColumn } from "@mcleanstewart/ledger";
import "./list-page.css";

type Stage = "applied" | "screening" | "interview" | "offer" | "rejected";

interface Application {
  id: string;
  role: string;
  employer: string;
  location: string;
  salary: string;
  stage: Stage;
  /** ISO `YYYY-MM-DD`. */
  deadline: string;
  activity: string;
}

/* Domain states map onto the four pill states ONCE, here — not per call site. */
const STAGE: Record<Stage, { label: string; status: StatusPillStatus }> = {
  applied: { label: "Applied", status: "unknown" },
  screening: { label: "Screening", status: "watch" },
  interview: { label: "Interview", status: "watch" },
  offer: { label: "Offer", status: "good" },
  rejected: { label: "Rejected", status: "risk" },
};

const STAGES: Stage[] = ["applied", "screening", "interview", "offer", "rejected"];

const PAGE_SIZE = 8;
const SKELETON_WIDTHS = ["58%", "72%", "44%", "63%", "51%", "68%", "47%", "60%"];

/** Local midnight from `YYYY-MM-DD` — `new Date(iso)` is UTC and drifts a day. */
const parseDay = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function ApplicationsPage({ data }: { data: Application[] }) {
  const [query, setQuery] = useState("");
  const [stages, setStages] = useState<Stage[]>([]);
  const [location, setLocation] = useState("");
  const [closingBy, setClosingBy] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const locations: SelectOption[] = [
    { value: "", label: "All locations" },
    ...Array.from(new Set(data.map((a) => a.location)))
      .sort((a, b) => a.localeCompare(b))
      .map((l) => ({ value: l, label: l })),
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = closingBy?.getTime();
    return data.filter(
      (a) =>
        (q === "" || `${a.role} ${a.employer} ${a.location}`.toLowerCase().includes(q)) &&
        (stages.length === 0 || stages.includes(a.stage)) &&
        (location === "" || a.location === location) &&
        (cutoff === undefined || parseDay(a.deadline).getTime() <= cutoff),
    );
  }, [data, query, stages, location, closingBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  /* Clamped, not reset by an effect: filtering down to fewer pages must not
     leave the table empty on a page that no longer exists. */
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const toggleStage = (stage: Stage) => (on: boolean) =>
    setStages((prev) => (on ? [...prev, stage] : prev.filter((s) => s !== stage)));

  const reset = () => {
    setQuery("");
    setStages([]);
    setLocation("");
    setClosingBy(undefined);
    setPage(1);
  };

  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1200);
  };

  /* Seven columns of declared width would crush in a narrow container — see the
     column-width budget in the guide. This page is full width, so it can afford
     them; count the rem before you add one. */
  const columns: TableColumn<Application>[] = [
    {
      key: "role",
      header: "Role",
      /* the only column with no width — it absorbs the slack */
      render: (a) => (
        <span className="rc-cell">
          <span>{a.role}</span>
          <span className="rc-muted">{a.employer}</span>
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      width: "9rem",
      render: (a) => <span className="rc-muted">{a.location}</span>,
    },
    { key: "salary", header: "Salary", width: "7.5rem", align: "right", numeric: true },
    {
      key: "stage",
      header: "Stage",
      width: "9.5rem",
      render: (a) => <StatusPill status={STAGE[a.stage].status} label={STAGE[a.stage].label} />,
    },
    {
      key: "deadline",
      header: "Closes",
      width: "10rem",
      align: "right",
      render: (a) => <span className="rc-muted">{formatDate(parseDay(a.deadline))}</span>,
    },
    {
      key: "activity",
      header: "Last activity",
      width: "7.5rem",
      align: "right",
      render: (a) => <span className="rc-muted">{a.activity}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      width: "4.5rem",
      align: "right",
      render: (a) => (
        <Menu
          align="end"
          trigger={<IconButton icon={MoreHorizontal} label={`${a.employer} actions`} />}
          items={[
            { label: "Open posting", icon: ExternalLink },
            { label: "Delete application", icon: Trash2, danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <PageColumn>
      <div className="rc-stack">
        <SectionHeading
          title="Applications"
          actions={
            <>
              <span className="rc-count">
                {filtered.length} of {data.length}
              </span>
              <IconButton
                icon={RefreshCw}
                label="Refresh"
                tooltip="Last synced 09:12 — 3 boards"
                onClick={refresh}
              />
            </>
          }
        />

        <div className="rc-toolbar">
          <SearchField
            className="rc-search"
            placeholder="Search role, employer, city"
            aria-label="Search applications"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            options={locations}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
          />
          <span className="rc-date">
            <DatePicker
              value={closingBy}
              onChange={setClosingBy}
              min="2026-08-01"
              max="2026-12-31"
              placeholder="Closing on or before"
              aria-label="Closing on or before"
            />
            {closingBy !== undefined && (
              <IconButton
                icon={X}
                label="Clear closing date"
                variant="bare"
                onClick={() => setClosingBy(undefined)}
              />
            )}
          </span>
        </div>

        <div className="rc-chips">
          {STAGES.map((stage) => (
            <FilterChip
              key={stage}
              count={data.filter((a) => a.stage === stage).length}
              active={stages.includes(stage)}
              onChange={toggleStage(stage)}
            >
              {STAGE[stage].label}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          /* Skeleton rows mirror the table's row height so the swap doesn't jump. */
          <Card>
            <div className="rc-skeleton">
              {SKELETON_WIDTHS.map((w) => (
                <div key={w} className="rc-skeleton-row">
                  <Skeleton width={w} />
                  <Skeleton width="60%" />
                  <Skeleton width="45%" />
                  <Skeleton width="70%" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Table
            columns={columns}
            rows={rows}
            rowKey={(a) => a.id}
            empty={
              <EmptyState
                icon={SearchX}
                title="No applications match these filters"
                action={<Button onClick={reset}>Clear filters</Button>}
              />
            }
          />
        )}

        <div className="rc-footer">
          <span className="rc-muted">
            {filtered.length === 0
              ? "Nothing to show"
              : `Showing ${start + 1}–${start + rows.length} of ${filtered.length}`}
          </span>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>
    </PageColumn>
  );
}
```

```css
/* list-page.css — layout only. */
.rc-stack {
  display: grid;
  gap: var(--space-4);
  align-content: start;
}

/* Filters run as one wrapping row: search flexes, the rest keep their measure. */
.rc-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.rc-search {
  flex: 1 1 auto;
  min-width: 0;
}
.rc-date {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
}

.rc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* Two strings stacked in one cell (role over employer). */
.rc-cell {
  display: grid;
  gap: var(--space-0_5);
  min-width: 0;
}
.rc-cell > span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.rc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

/* Reserved measure + tabular figures: the count sits beside a flexing field and
   must not resize it as the digits change. */
.rc-count {
  flex: none;
  min-width: 9ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
}

.rc-skeleton { display: grid; }
.rc-skeleton-row {
  display: grid;
  grid-template-columns: minmax(0, 2.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: var(--space-4);
  height: var(--control-h-lg);
}
.rc-skeleton-row + .rc-skeleton-row {
  border-top: var(--space-px) solid var(--border-subtle);
}

.rc-muted { color: var(--text-muted); }
```

**Three states, three components**

| State | Component | Note |
| --- | --- | --- |
| Loading | `Skeleton` rows in a `Card` | Match the row height, or the swap jumps |
| Filtered to nothing | `Table`'s `empty` slot with `EmptyState` | Give it the action that undoes the filter |
| Genuinely empty | Same slot, different copy | "Nothing here yet", and the action that creates the first one |

`EmptyState` has no description slot. If the title cannot carry it, it belongs in
a tooltip on the panel's own control.

---

## 3. Settings form with validation

Sections of `Card`, each headed by a `SectionHeading`, each a two-column grid of
`FormField`s. Validation is derived, not stored — the error is a function of the
value, and the save button reads the same expression.

```tsx
import { useState, type ChangeEvent } from "react";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  FormField,
  Input,
  MultiSelect,
  PageColumn,
  RadioGroup,
  SectionHeading,
  SegmentedControl,
  Select,
  Switch,
  Textarea,
} from "@mcleanstewart/ledger";
import "./settings.css";

const WORKSPACE_DOMAIN = "harbourside.co.uk";

const TIMEZONES = [
  { value: "europe-london", label: "London — GMT+1" },
  { value: "europe-dublin", label: "Dublin — GMT+1" },
  { value: "utc", label: "UTC" },
];

/* 8 options — MultiSelect earns its filter row from here up. */
const EVENTS = [
  { value: "invoice-paid", label: "Invoice paid" },
  { value: "invoice-overdue", label: "Invoice overdue", count: 2 },
  { value: "payment-failed", label: "Payment failed" },
  { value: "client-added", label: "New client added" },
  { value: "quote-accepted", label: "Quote accepted" },
  { value: "card-expiring", label: "Card expiring" },
  { value: "vat-due", label: "VAT return due", count: 1 },
  { value: "digest-ready", label: "Weekly summary ready" },
];

export default function SettingsPage() {
  const [name, setName] = useState("Nadia Ellery");
  const [email, setEmail] = useState("nadia.ellery@gmail.com");
  const [timezone, setTimezone] = useState("europe-london");
  const [bio, setBio] = useState("Runs the books for a four-person studio in Bristol.");
  const [theme, setTheme] = useState("system");
  const [weekStart, setWeekStart] = useState("mon");
  const [events, setEvents] = useState<string[]>(["invoice-overdue"]);
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [productUpdates, setProductUpdates] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* Derived, not stored. One expression drives the error line, the control's
     invalid state and the disabled save. */
  const emailError = email.trim().toLowerCase().endsWith(`@${WORKSPACE_DOMAIN}`)
    ? undefined
    : `Sign-in requires a ${WORKSPACE_DOMAIN} address`;

  const toggleChannel = (value: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setChannels((prev) => (e.target.checked ? [...prev, value] : prev.filter((c) => c !== value)));

  return (
    <PageColumn>
      <div className="rc-set-stack">
        <section className="rc-set-section">
          <SectionHeading title="Profile" />
          <Card>
            <div className="rc-set-grid">
              <FormField label="Full name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormField>

              <FormField label="Work email" error={emailError}>
                <Input
                  type="email"
                  invalid={emailError !== undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <FormField label="Time zone">
                <Select
                  options={TIMEZONES}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </FormField>

              <FormField label="Account ID">
                <Input disabled value="acct_8f3ad02c9b41" />
              </FormField>

              <FormField label="About" className="rc-set-span">
                <Textarea minRows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </FormField>
            </div>

            <Divider className="rc-set-rule" />

            <div className="rc-set-actions">
              <Button variant="tertiary">Discard</Button>
              <Button variant="primary" disabled={emailError !== undefined}>
                Save changes
              </Button>
            </div>
          </Card>
        </section>

        <section className="rc-set-section">
          <SectionHeading title="Preferences" />
          <Card>
            <div className="rc-set-grid">
              {/* Group controls need their own aria-label inside FormField —
                  FormField's htmlFor wiring does not reach them. */}
              <FormField label="Appearance">
                <SegmentedControl
                  aria-label="Appearance"
                  options={["System", "Light", "Dark"].map((label) => ({
                    value: label.toLowerCase(),
                    label,
                  }))}
                  value={theme}
                  onChange={setTheme}
                />
              </FormField>

              <FormField label="Weeks start on">
                <RadioGroup
                  aria-label="Weeks start on"
                  orientation="horizontal"
                  options={[
                    { value: "mon", label: "Monday" },
                    { value: "sun", label: "Sunday" },
                  ]}
                  value={weekStart}
                  onChange={setWeekStart}
                />
              </FormField>

              <FormField label="Tell me about" className="rc-set-span">
                <MultiSelect
                  aria-label="Tell me about"
                  options={EVENTS}
                  value={events}
                  onChange={setEvents}
                  placeholder="Nothing yet"
                  width="100%"
                />
              </FormField>

              <FormField label="Send to" className="rc-set-span">
                <div className="rc-set-checks">
                  <Checkbox
                    label="Email"
                    checked={channels.includes("email")}
                    onChange={toggleChannel("email")}
                  />
                  <Checkbox
                    label="In-app"
                    checked={channels.includes("in-app")}
                    onChange={toggleChannel("in-app")}
                  />
                  <Checkbox label="SMS" disabled />
                </div>
              </FormField>
            </div>

            <Divider className="rc-set-rule" />

            <div className="rc-set-toggles">
              <Switch
                label="Product updates and release notes"
                checked={productUpdates}
                onChange={setProductUpdates}
              />
              <Switch label="Security and sign-in alerts" checked disabled />
            </div>
          </Card>
        </section>

        <section className="rc-set-section">
          <SectionHeading title="Danger zone" />
          <Card>
            <div className="rc-set-danger">
              <Checkbox
                label="Delete Harbourside Studio, its 214 invoices and every API key"
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
              />
              <Button variant="danger" disabled={!confirmDelete}>
                Delete workspace
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </PageColumn>
  );
}
```

```css
/* settings.css — layout only. */
.rc-set-stack {
  display: grid;
  gap: var(--space-8);
  align-content: start;
}
.rc-set-section {
  display: grid;
  gap: var(--space-3);
}

.rc-set-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  align-items: start;
}
.rc-set-span { grid-column: 1 / -1; }

.rc-set-rule { margin: var(--space-4) 0; }

.rc-set-actions,
.rc-set-danger {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
}
.rc-set-danger { justify-content: space-between; }

.rc-set-checks,
.rc-set-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
}
```

**Form rules worth stating**

- `FormField` has `label` and `error`. There is no hint slot — if a field needs
  a caption, the label or the control is wrong.
- `error` and `invalid` are separate on purpose: `error` prints the line and
  sets `aria-invalid`; `invalid` on the control paints its border. Pass both,
  from the same expression.
- A destructive action is gated by a checkbox naming what will be destroyed, not
  by a "type DELETE" field.
- `Checkbox` and `Switch` differ in when they apply: a Checkbox is part of a form
  you will submit, a Switch takes effect immediately.
- `SegmentedControl` and `RadioGroup` need an explicit `aria-label` inside a
  FormField (see the sharp edges in the guide).

---

## 4. A KPI row

Four `SummaryCard`s across an equal grid. Every card is the same component with
different things left out, so the row lines up without any per-card sizing.

```tsx
import { Badge, KeyValue, MetricDelta, SummaryCard, SummarySplit, pct } from "@mcleanstewart/ledger";
import "./kpis.css";

export default function KpiRow() {
  return (
    <div className="rc-kpis">
      {/* change → MetricDelta in the aside */}
      <SummaryCard
        title="Runs today"
        value="449"
        caption="vs 415 yesterday"
        aside={<MetricDelta value={8.2} />}
      />

      {/* a metric where DOWN is good — polarity, not a flipped colour */}
      <SummaryCard
        title="p95 latency"
        value="812ms"
        caption="vs 725ms yesterday"
        aside={<MetricDelta value={12} polarity="lower-is-better" />}
      />

      {/* a raw count rather than a percentage — suffix, not a format function */}
      <SummaryCard
        title="Queue depth"
        value="146"
        caption="vs 111 an hour ago"
        aside={<MetricDelta value={31} suffix="" polarity="lower-is-better" />}
      />

      {/* state, not change → a Badge in the same slot */}
      <SummaryCard
        title="Success rate"
        value={pct(96.2)}
        caption="Users left after viewing 1 page"
        aside={<Badge>Normal</Badge>}
      />
    </div>
  );
}

/* The other two shapes of the same card — drop `value`, fill `children`. */
export function SummaryPanels() {
  return (
    <div className="rc-kpis">
      <SummaryCard title="Traffic sources">
        <KeyValue
          items={[
            { label: "Organic search", value: "1,412" },
            { label: "Direct", value: "968" },
            { label: "Referral", value: "431" },
          ]}
        />
      </SummaryCard>

      <SummaryCard title="Sessions by device">
        <SummarySplit
          parts={[
            { value: "64%", label: "Mobile" },
            { value: "30%", label: "Desktop" },
            { value: "6%", label: "Tablet" },
          ]}
        />
      </SummaryCard>
    </div>
  );
}
```

```css
/* kpis.css — layout only. */
.rc-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}
```

**The rules this row is obeying**

- `MetricDelta` renders no arrow and no `+`. The sign is in the number and the
  colour carries the direction; an arrow would be the third copy of one fact.
- `polarity` is how a falling number reads as good. Latency, queue depth and
  error rate are `lower-is-better`; everything else defaults to
  `higher-is-better`.
- Zero renders grey and unsigned. You do not need to special-case it.
- Non-finite values render nothing at all, so a delta computed from a missing
  baseline will not print `NaN%`.
- `SummarySplit` takes its emphasis from **order** — `parts[0]` is the leading
  share by definition. There is no highlight index, because it could only ever
  disagree with the sort.
- A card whose body names its own parts (a `columns` KeyValue where every cell
  is labelled) can drop `title` entirely; the head row disappears rather than
  sitting there empty.

To put a chart inside a card, pass it as `children` — `CompareChart` at
`height={140}` is the shape the summary board was designed around:

```tsx
<SummaryCard
  title="Sessions"
  value="24,318"
  caption="vs 21,640 last month"
  aside={<MetricDelta value={12.4} />}
>
  <CompareChart
    current={{ label: "This month", data: [5980, 6120, 6040, 6178] }}
    previous={{ label: "Last month", data: [5480, 5310, 5400, 5450] }}
    labels={["W1", "W2", "W3", "W4"]}
    height={140}
  />
</SummaryCard>
```

---

## 5. Detail drawer opened from a table row

The traversal pattern: click a row, the record opens beside the list, the list
stays where it was. A confirmation `Modal` sits on top of the drawer for the
destructive action, and a `Toast` reports the result with an undo.

```tsx
import { useState, type MouseEvent } from "react";
import { ClipboardCheck, MoreHorizontal, PhoneOutgoing } from "lucide-react";
import {
  Badge,
  Button,
  Divider,
  Drawer,
  EmptyState,
  IconButton,
  InlineAlert,
  KeyValue,
  Menu,
  Modal,
  PageColumn,
  StatusPill,
  Table,
  Toast,
  ToastViewport,
  formatDate,
} from "@mcleanstewart/ledger";
import type { StatusPillStatus, TableColumn, ToastTone } from "@mcleanstewart/ledger";
import "./tickets.css";

type TicketState = "overdue" | "open" | "scheduled" | "resolved";

interface Ticket {
  id: string;
  property: string;
  summary: string;
  trade: string;
  state: TicketState;
  due: string;
  contractor: string;
  detail: string;
  tenant: string;
  notes: number;
}

const STATE: Record<TicketState, { label: string; status: StatusPillStatus }> = {
  overdue: { label: "Overdue", status: "risk" },
  open: { label: "Open", status: "watch" },
  scheduled: { label: "Scheduled", status: "unknown" },
  resolved: { label: "Resolved", status: "good" },
};

interface ToastEntry {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Ticket to put back if the reader takes the undo. */
  undo?: string;
}

let toastSeq = 0;

export default function TicketsPage({ tickets }: { tickets: Ticket[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [resolved, setResolved] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const stateOf = (t: Ticket): TicketState => (resolved.includes(t.id) ? "resolved" : t.state);
  const rows = tickets.filter((t) => stateOf(t) !== "resolved");
  const selected = tickets.find((t) => t.id === openId);
  const confirming = tickets.find((t) => t.id === confirmId);

  const push = (toast: Omit<ToastEntry, "id">) =>
    setToasts((prev) => [...prev, { ...toast, id: ++toastSeq }]);
  const dropToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const confirmResolve = () => {
    if (!confirming) return;
    setResolved((prev) => [...prev, confirming.id]);
    setConfirmId(null);
    setOpenId(null);
    push({
      tone: "success",
      title: `${confirming.id} marked resolved`,
      description: `${confirming.property} — the tenant will be sent a survey tonight.`,
      undo: confirming.id,
    });
  };

  const undo = (ticketId: string, toastId: number) => {
    setResolved((prev) => prev.filter((id) => id !== ticketId));
    dropToast(toastId);
  };

  /* Rows are clickable, so a control inside one has to eat the click. */
  const swallow = (e: MouseEvent<HTMLElement>) => e.stopPropagation();

  const columns: TableColumn<Ticket>[] = [
    {
      key: "summary",
      header: "Ticket",
      render: (t) => (
        <span className="rc-tk-cell">
          <span>{t.summary}</span>
          <span className="rc-muted">
            {t.id} · {t.property} · {t.contractor}
          </span>
        </span>
      ),
    },
    {
      key: "state",
      header: "Status",
      width: "8rem",
      render: (t) => <StatusPill status={STATE[stateOf(t)].status} label={STATE[stateOf(t)].label} />,
    },
    {
      key: "due",
      header: "Due",
      width: "8rem",
      align: "right",
      numeric: true,
      render: (t) => <span className="rc-muted">{formatDate(t.due)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      width: "4.5rem",
      align: "right",
      render: (t) => (
        <span onClick={swallow}>
          <Menu
            align="end"
            trigger={<IconButton icon={MoreHorizontal} label={`${t.id} actions`} />}
            items={[
              {
                label: `Chase ${t.contractor}`,
                icon: PhoneOutgoing,
                onSelect: () => push({ tone: "neutral", title: `Chased ${t.contractor}` }),
              },
            ]}
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageColumn>
        <Table
          columns={columns}
          rows={rows}
          rowKey={(t) => t.id}
          onRowClick={(t) => setOpenId(t.id)}
          empty={<EmptyState compact icon={ClipboardCheck} title="Every ticket is closed" />}
        />
      </PageColumn>

      <Drawer
        open={selected !== undefined}
        onClose={() => setOpenId(null)}
        width={440}
        title={
          selected && (
            <span className="rc-row">
              {selected.id}
              <Badge tone="neutral">{selected.trade}</Badge>
            </span>
          )
        }
        footer={
          <>
            <Button variant="primary" onClick={() => selected && setConfirmId(selected.id)}>
              Mark resolved
            </Button>
            <Button onClick={() => push({ tone: "neutral", title: "Reassignment requested" })}>
              Reassign
            </Button>
            <Button variant="tertiary" onClick={() => setOpenId(null)}>
              Close
            </Button>
          </>
        }
      >
        {selected && (
          <div className="rc-tk-drawer">
            <StatusPill
              status={STATE[stateOf(selected)].status}
              label={STATE[stateOf(selected)].label}
            />

            {/* headline on the line, the paragraph behind the info glyph */}
            <InlineAlert
              tone={stateOf(selected) === "overdue" ? "danger" : "accent"}
              title={selected.summary}
            >
              {selected.detail}
            </InlineAlert>

            <Divider />

            <KeyValue
              items={[
                { label: "Property", value: selected.property },
                { label: "Tenant", value: selected.tenant },
                { label: "Trade", value: selected.trade },
                { label: "Due", value: formatDate(selected.due) },
                { label: "Contractor", value: selected.contractor },
                { label: "Notes on file", value: selected.notes },
              ]}
            />
          </div>
        )}
      </Drawer>

      <Modal
        open={confirming !== undefined}
        onClose={() => setConfirmId(null)}
        width={460}
        title={confirming && `Mark ${confirming.id} resolved`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmResolve}>
              Mark resolved
            </Button>
          </>
        }
      >
        {confirming && (
          <p className="rc-tk-prose">
            Closing this ticket stops the SLA clock at {formatDate(confirming.due)}, notifies{" "}
            {confirming.tenant} and releases {confirming.contractor} to invoice. A closed ticket can
            only be reopened by a scheme manager.
          </p>
        )}
      </Modal>

      <ToastViewport>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            title={t.title}
            description={t.description}
            onClose={() => dropToast(t.id)}
            action={
              t.undo && (
                <Button variant="tertiary" onClick={() => t.undo && undo(t.undo, t.id)}>
                  Undo
                </Button>
              )
            }
          />
        ))}
      </ToastViewport>
    </>
  );
}
```

```css
/* tickets.css — layout only. */
.rc-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  min-width: 0;
}
.rc-tk-cell {
  display: grid;
  gap: var(--space-0_5);
  min-width: 0;
}
.rc-tk-cell > span {
  overflow: hidden;
  text-overflow: ellipsis;
}
.rc-tk-drawer {
  display: grid;
  gap: var(--space-4);
  align-content: start;
}
.rc-tk-prose {
  margin: 0;
  max-width: var(--measure-text);
  color: var(--text-muted);
}
.rc-muted { color: var(--text-muted); }
```

**What this pattern gets right**

- The drawer is driven by an id in state, not by a boolean plus a stashed
  record. `open={selected !== undefined}` cannot desynchronise from what is
  rendered inside it.
- `ToastViewport` is mounted for the life of the page. It carries the live
  region, and a region inserted at the same moment as its content routinely
  fails to announce.
- Escape closes only the innermost open layer: the Modal marks the key handled,
  so the Drawer behind it stays put.
- The undo lives on the Toast, not as a confirmation step before the action. One
  confirmation for the destructive case, one undo for the reversible result.
- Both overlays portal to `<body>`, so no transformed or filtered ancestor can
  re-base their fixed positioning or clip them.

---

## Composing beyond these

Two habits carry most of the way:

**Let the components draw the chrome.** Every stylesheet above is grid, gap and
overflow. The moment your page CSS starts setting a colour, a font size, a
border or a radius, check whether a component already owns that job — a `Card`
around a `Table` doubles the border, and a hand-rolled heading row is a
`SectionHeading`.

**Reach for the token, not the value.** `var(--space-4)`, `var(--text-muted)`,
`var(--control-h-lg)`, `var(--measure-text)`. The kit's own components carry zero
raw hex and zero raw px, and page CSS that follows the same rule keeps working
when a theme changes underneath it.
