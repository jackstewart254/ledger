import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import {
  Activity,
  Bell,
  Boxes,
  Info,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ScrollText,
  Settings,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import {
  AppShell,
  Badge,
  Button,
  Card,
  CommandMenu,
  CountBadge,
  Divider,
  Drawer,
  EmptyState,
  FilterToggle,
  Icon,
  IconButton,
  InlineAlert,
  KeyValue,
  Menu,
  MetricDelta,
  SummaryCard,
  PageColumn,
  Progress,
  Rail,
  RailItem,
  SearchField,
  SectionHeading,
  SegmentedControl,
  Skeleton,
  Sparkline,
  StatusDot,
  StatusPill,
  Table,
  TrendChart,
  pct,
} from "@mcleanstewart/ledger";
import type {
  LucideIcon,
  CommandMenuItem,
  StatusPillStatus,
  TableColumn,
} from "@mcleanstewart/ledger";
import OverviewPage from "./pages/OverviewPage";
import RunsPage from "./pages/RunsPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";
import "./dashboard.css";

/* ── fake ops data ─────────────────────────────────────────────────────── */

type DaemonState = "healthy" | "degraded" | "failing" | "paused" | "never";

interface Daemon {
  id: string;
  name: string;
  host: string;
  state: DaemonState;
  schedule: string;
  lastRun: string;
  nextRun: string;
  p95: string;
  queue: number;
  runsToday: number;
  successRate: number;
  uptime: string;
  owner: string;
  runs7d: number[];
  lastError?: string;
  consecutiveFailures: number;
}

const STATE: Record<DaemonState, { label: string; status: StatusPillStatus }> = {
  healthy: { label: "Healthy", status: "good" },
  degraded: { label: "Degraded", status: "watch" },
  failing: { label: "Failing", status: "risk" },
  paused: { label: "Paused", status: "unknown" },
  never: { label: "Never run", status: "unknown" },
};

const DAEMONS: Daemon[] = [
  {
    id: "atoms-sync",
    name: "atoms-sync",
    host: "fsn1-a",
    state: "healthy",
    schedule: "*/5 * * * *",
    lastRun: "2m ago",
    nextRun: "in 3m",
    p95: "412ms",
    queue: 0,
    runsToday: 288,
    successRate: 100,
    uptime: "31d 04h",
    owner: "jack",
    runs7d: [286, 288, 288, 287, 288, 288, 288],
    consecutiveFailures: 0,
  },
  {
    id: "bank-sync",
    name: "bank-sync",
    host: "fsn1-a",
    state: "failing",
    schedule: "0 */2 * * *",
    lastRun: "6m ago",
    nextRun: "held",
    p95: "1.94s",
    queue: 128,
    runsToday: 12,
    successRate: 41.7,
    uptime: "0d 06h",
    owner: "jack",
    runs7d: [12, 12, 12, 12, 11, 9, 5],
    lastError: "TrueLayer refresh token rejected (401) — reauth required",
    consecutiveFailures: 6,
  },
  {
    id: "shift-selector",
    name: "shift-selector",
    host: "hel1-b",
    state: "healthy",
    schedule: "*/15 * * * *",
    lastRun: "11m ago",
    nextRun: "in 4m",
    p95: "660ms",
    queue: 2,
    runsToday: 92,
    successRate: 98.9,
    uptime: "12d 19h",
    owner: "jack",
    runs7d: [96, 94, 96, 95, 93, 92, 92],
    consecutiveFailures: 0,
  },
  {
    id: "grad-jobs",
    name: "grad-jobs",
    host: "hel1-b",
    state: "degraded",
    schedule: "0 7,19 * * *",
    lastRun: "1h 12m ago",
    nextRun: "in 5h 48m",
    p95: "4.21s",
    queue: 41,
    runsToday: 2,
    successRate: 91.4,
    uptime: "8d 02h",
    owner: "jack",
    runs7d: [2, 2, 2, 2, 2, 1, 2],
    lastError: "3 of 34 boards timed out (gradcracker, brightnetwork, targetjobs)",
    consecutiveFailures: 0,
  },
  {
    id: "query-index",
    name: "query-index",
    host: "fsn1-a",
    state: "healthy",
    schedule: "@hourly",
    lastRun: "24m ago",
    nextRun: "in 36m",
    p95: "8.05s",
    queue: 5,
    runsToday: 9,
    successRate: 100,
    uptime: "31d 04h",
    owner: "jack",
    runs7d: [24, 24, 23, 24, 24, 24, 9],
    consecutiveFailures: 0,
  },
  {
    id: "groundtruth-crawler",
    name: "groundtruth-crawler",
    host: "hel1-b",
    state: "paused",
    schedule: "0 3 * * *",
    lastRun: "4d ago",
    nextRun: "paused",
    p95: "2m 41s",
    queue: 0,
    runsToday: 0,
    successRate: 96.8,
    uptime: "—",
    owner: "jack",
    runs7d: [1, 1, 1, 0, 0, 0, 0],
    consecutiveFailures: 0,
  },
  {
    id: "rugby-stats",
    name: "rugby-stats",
    host: "fsn1-c",
    state: "healthy",
    schedule: "*/30 * * * *",
    lastRun: "18m ago",
    nextRun: "in 12m",
    p95: "930ms",
    queue: 1,
    runsToday: 46,
    successRate: 97.8,
    uptime: "5d 11h",
    owner: "jack",
    runs7d: [48, 47, 48, 46, 47, 46, 46],
    consecutiveFailures: 0,
  },
  {
    id: "keystone-connector",
    name: "keystone-connector",
    host: "fsn1-c",
    state: "never",
    schedule: "*/10 * * * *",
    lastRun: "—",
    nextRun: "—",
    p95: "—",
    queue: 0,
    runsToday: 0,
    successRate: 0,
    uptime: "—",
    owner: "jack",
    runs7d: [0, 0, 0, 0, 0, 0, 0],
    consecutiveFailures: 0,
  },
];

const THROUGHPUT: Record<string, number[]> = {
  "24h": [
    41, 38, 34, 30, 29, 31, 44, 68, 91, 104, 98, 96, 102, 110, 118, 121, 96, 88,
    74, 69, 71, 58, 49, 44,
  ],
  "7d": [1412, 1388, 1451, 1402, 1361, 1194, 1284],
  "30d": [
    1290, 1341, 1388, 1402, 1377, 1198, 1240, 1310, 1366, 1391, 1412, 1388, 1204,
    1188, 1301, 1354, 1399, 1420, 1441, 1210, 1176, 1288, 1333, 1370, 1408, 1451,
    1402, 1361, 1194, 1284,
  ],
};

const HOSTS = [
  { id: "fsn1-a", label: "fsn1-a", load: 71, detail: "3 daemons · 8 vCPU", status: "good" as const },
  { id: "hel1-b", label: "hel1-b", load: 94, detail: "3 daemons · 4 vCPU", status: "watch" as const },
  { id: "fsn1-c", label: "fsn1-c", load: 22, detail: "2 daemons · 4 vCPU", status: "good" as const },
];

const RANGES = ["24h", "7d", "30d"];

/* ── rail routing ──────────────────────────────────────────────────────────
   Five demo pages behind one shell. The four beyond "daemons" are deliberately
   unrelated domains — the point is to see the kit against content shapes it
   wasn't designed around, not to build one coherent product. */

type PageId = "overview" | "daemons" | "runs" | "alerts" | "settings";

const RAIL: Array<{ id: PageId; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "daemons", label: "Daemons", icon: Boxes },
  { id: "runs", label: "Runs", icon: ScrollText },
  { id: "alerts", label: "Alerts", icon: Bell },
];

const PAGE_CRUMB: Record<PageId, { root: string; leaf: string }> = {
  overview: { root: "money", leaf: "overview" },
  daemons: { root: "ops", leaf: "daemons" },
  runs: { root: "jobs", leaf: "applications" },
  alerts: { root: "property", leaf: "maintenance" },
  settings: { root: "workspace", leaf: "settings" },
};

const PAGES: Record<PageId, ReactNode> = {
  overview: <OverviewPage />,
  daemons: null, // rendered inline below — it owns the Drawer and CommandMenu
  runs: <RunsPage />,
  alerts: <AlertsPage />,
  settings: <SettingsPage />,
};

/* ── page ──────────────────────────────────────────────────────────────── */

export interface DashboardProps {
  /** Playground-only slot in the shell header (view switch, theme). */
  toolbar?: ReactNode;
}

export default function Dashboard({ toolbar }: DashboardProps) {
  const [query, setQuery] = useState("");
  const [states, setStates] = useState<DaemonState[]>([]);
  const [range, setRange] = useState("24h");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [page, setPage] = useState<PageId>("daemons");
  const [alertOpen, setAlertOpen] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "k" || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      setCmdOpen((o) => !o);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DAEMONS.filter(
      (d) =>
        (q === "" || (d.name + " " + d.host).toLowerCase().includes(q)) &&
        (states.length === 0 || states.includes(d.state)),
    );
  }, [query, states]);

  const selected = DAEMONS.find((d) => d.id === selectedId);
  const runsToday = DAEMONS.reduce((n, d) => n + d.runsToday, 0);
  const queued = DAEMONS.reduce((n, d) => n + d.queue, 0);
  const failing = DAEMONS.filter((d) => d.state === "failing").length;

  const toggleState = (state: DaemonState) => (on: boolean) =>
    setStates((prev) => (on ? [...prev, state] : prev.filter((s) => s !== state)));

  const commands: CommandMenuItem[] = [
    ...DAEMONS.map((d) => ({
      id: d.id,
      label: d.name,
      group: "Daemons",
      icon: Boxes,
      keywords: `${d.host} ${d.state}`,
      onSelect: () => setSelectedId(d.id),
    })),
    { id: "run-all", label: "Run all due now", group: "Actions", icon: Play },
    { id: "pause-all", label: "Pause every daemon", group: "Actions", icon: Pause },
    { id: "rotate", label: "Rotate bank-sync credentials", group: "Actions", icon: ShieldCheck },
    { id: "logs", label: "Open combined log stream", group: "Actions", icon: ScrollText },
  ];

  const rowMenu = (d: Daemon) => [
    { label: "Run now", icon: Play, onSelect: () => setSelectedId(d.id) },
    { label: d.state === "paused" ? "Resume" : "Pause", icon: Pause },
    { label: "Open log", icon: ScrollText },
    { label: "Reset checkpoint", icon: RotateCcw, danger: true },
  ];

  /* Table rows are clickable, so a control inside one has to eat the click. */
  const swallow = (e: MouseEvent<HTMLElement>) => e.stopPropagation();

  const columns: TableColumn<Daemon>[] = [
    {
      key: "name",
      header: "Daemon",
      render: (d) => (
        <span className="pg-db-row pg-db-row--tight">
          {d.name}
          <span className="pg-db-muted">{d.host}</span>
        </span>
      ),
    },
    {
      key: "state",
      header: "Status",
      width: "10.5rem",
      render: (d) => (
        <StatusPill
          status={STATE[d.state].status}
          label={STATE[d.state].label}
          value={d.state === "never" ? undefined : pct(d.successRate)}
        />
      ),
    },
    {
      key: "runs7d",
      header: "Runs, 7d",
      width: "6rem",
      render: (d) => <Sparkline data={d.runs7d} width={64} height={20} />,
    },
    {
      key: "lastRun",
      header: "Last run",
      width: "7rem",
      align: "right",
      numeric: true,
      render: (d) => <span className="pg-db-muted">{d.lastRun}</span>,
    },
    { key: "p95", header: "p95", width: "6rem", align: "right", numeric: true },
    {
      key: "queue",
      header: "Queued",
      width: "5rem",
      align: "right",
      render: (d) =>
        d.queue === 0 ? (
          <span className="pg-db-dim">—</span>
        ) : (
          <CountBadge count={d.queue} tone={d.queue > 100 ? "danger" : "neutral"} />
        ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "4.5rem",
      align: "right",
      render: (d) => (
        <span onClick={swallow}>
          <Menu
            align="end"
            trigger={<IconButton icon={MoreHorizontal} label={`${d.name} actions`} />}
            items={rowMenu(d)}
          />
        </span>
      ),
    },
  ];

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
          <span className="pg-db-row pg-db-row--tight">
            <Icon as={Terminal} />
            {PAGE_CRUMB[page].root}
            <span className="pg-db-dim">/</span>
            <span className="pg-db-muted">{PAGE_CRUMB[page].leaf}</span>
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
            {/* Not onFocus: the palette's focus trap returns focus here on
                close, and that would reopen it on every dismissal. */}
            <SearchField
              placeholder="Search daemons, runs, hosts…"
              readOnly
              onClick={() => setCmdOpen(true)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                setCmdOpen(true);
              }}
            />
            {/* fleet controls belong to the fleet page, not to the shell */}
            {page === "daemons" && (
              <>
                <IconButton icon={Play} label="Run all due" />
                <Menu
                  align="end"
                  trigger={<IconButton icon={MoreHorizontal} label="Fleet actions" />}
                  items={[
                    { label: "Pause every daemon", icon: Pause },
                    { label: "Export run history", icon: ScrollText },
                    { label: "Reset all checkpoints", icon: RotateCcw, danger: true },
                  ]}
                />
              </>
            )}
          </>
        }
        actions={<span className="pg-db-switch">{toolbar}</span>}
      >
        {page !== "daemons" && PAGES[page]}
        {page === "daemons" && (
        <PageColumn>
          <div className="pg-db-stack">
            {/* No page title and no page-level action row: the shell header
                carries the breadcrumb, the environment and the fleet controls,
                so the content column starts on real content. */}

            {alertOpen && failing > 0 && (
              <InlineAlert
                tone="danger"
                title="bank-sync has failed 6 consecutive runs"
                action={
                  <IconButton icon={ScrollText} label="Open log" />
                }
                onClose={() => setAlertOpen(false)}
              >
                TrueLayer rejected the refresh token at 07:02. The schedule is held
                until credentials are rotated; 128 jobs are queued behind it.
              </InlineAlert>
            )}

            <div className="pg-db-kpis">
              <SummaryCard
                title="Runs today"
                value={runsToday.toLocaleString("en-GB")}
                caption="vs 415 yesterday"
                aside={<MetricDelta value={8.2} />}
              />
              <SummaryCard
                title="Success rate"
                value="96.2%"
                caption="vs 97.6% yesterday"
                aside={<MetricDelta value={-1.4} />}
              />
              <SummaryCard
                title="Queue depth"
                value={queued.toLocaleString("en-GB")}
                caption="vs 146 an hour ago"
                aside={<MetricDelta value={31} suffix="" polarity="lower-is-better" />}
              />
              <SummaryCard
                title="p95 latency"
                value="812ms"
                caption="vs 725ms yesterday"
                aside={<MetricDelta value={12} polarity="lower-is-better" />}
              />
            </div>

            <div className="pg-db-split">
              <div className="pg-db-col">
                <SectionHeading
                  title="Fleet"
                  actions={
                    <>
                      <FilterToggle
                        count={failing}
                        active={states.includes("failing")}
                        onChange={toggleState("failing")}
                      >
                        Failing
                      </FilterToggle>
                      <FilterToggle
                        count={DAEMONS.filter((d) => d.state === "degraded").length}
                        active={states.includes("degraded")}
                        onChange={toggleState("degraded")}
                      >
                        Degraded
                      </FilterToggle>
                      <FilterToggle
                        count={DAEMONS.filter((d) => d.state === "paused").length}
                        active={states.includes("paused")}
                        onChange={toggleState("paused")}
                      >
                        Paused
                      </FilterToggle>
                    </>
                  }
                />
                <div className="pg-db-toolbar">
                  <SearchField
                    className="pg-db-search"
                    placeholder="Filter daemons"
                    aria-label="Filter daemons"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <span className="pg-db-muted pg-db-count">
                    {rows.length} of {DAEMONS.length}
                  </span>
                </div>
                <Table
                  columns={columns}
                  rows={rows}
                  rowKey={(d) => d.id}
                  onRowClick={(d) => setSelectedId(d.id)}
                  empty={
                    <EmptyState
                      compact
                      title="No daemons match"
                    />
                  }
                />
              </div>

              <div className="pg-db-col">
                <Card
                  header={
                    <>
                      <span>Throughput</span>
                      <SegmentedControl
                        options={RANGES}
                        value={range}
                        onChange={setRange}
                        aria-label="Throughput range"
                      />
                    </>
                  }
                >
                  <TrendChart
                    className="pg-db-chart"
                    data={THROUGHPUT[range]}
                    width={320}
                    height={140}
                    format={(v) => `${Math.round(v)}`}
                  />
                </Card>

                <Card header={<span>Host load</span>}>
                  {HOSTS.map((h) => (
                    <div key={h.id} className="pg-db-meter">
                      <span className="pg-db-row pg-db-row--tight">
                        <StatusDot status={h.status} label={`${h.label} load`} />
                        {h.label}
                        <span className="pg-db-dim">{h.detail}</span>
                      </span>
                      <span className="pg-db-muted">{h.load}%</span>
                      <div className="pg-db-meter-bar">
                        <Progress value={h.load} aria-label={`${h.label} load`} />
                      </div>
                    </div>
                  ))}
                </Card>

                <Card
                  header={
                    <>
                      <span>Open incidents</span>
                      <IconButton
                        icon={Info}
                        label="bank-sync is failing with no incident open — page on-call to raise one"
                      />
                    </>
                  }
                >
                  <EmptyState compact icon={ShieldCheck} title="Nothing paging" />
                </Card>

                <Card header={<span>Cost, month to date</span>}>
                  <div className="pg-db-loading">
                    {[68, 44, 56].map((w) => (
                      <div key={w} className="pg-db-loading-row">
                        <Skeleton width={`${w}%`} />
                        <Skeleton width="14%" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </PageColumn>
        )}
      </AppShell>

      <Drawer
        open={selected !== undefined}
        onClose={() => setSelectedId(null)}
        width={420}
        title={
          selected && (
            <span className="pg-db-row pg-db-row--tight">
              {selected.name}
              <Badge tone="neutral">{selected.host}</Badge>
            </span>
          )
        }
        footer={
          <>
            <Button variant="primary">Run now</Button>
            <Button>{selected?.state === "paused" ? "Resume" : "Pause"}</Button>
            <Button variant="tertiary">Log</Button>
          </>
        }
      >
        {selected && (
          <div className="pg-db-drawer">
            <StatusPill
              status={STATE[selected.state].status}
              label={STATE[selected.state].label}
              value={selected.state === "never" ? undefined : pct(selected.successRate)}
            />
            {selected.lastError !== undefined && (
              <InlineAlert
                tone={selected.state === "failing" ? "danger" : "warning"}
                title={`${selected.consecutiveFailures || "Intermittent"} failures`}
              >
                {selected.lastError}
              </InlineAlert>
            )}
            <TrendChart
              className="pg-db-chart"
              data={selected.runs7d}
              width={380}
              height={120}
              format={(v) => `${Math.round(v)}`}
            />
            <Divider />
            <KeyValue
              items={[
                { label: "Host", value: selected.host },
                { label: "Schedule", value: selected.schedule },
                { label: "Last run", value: selected.lastRun },
                { label: "Next run", value: selected.nextRun },
                { label: "p95 duration", value: selected.p95 },
                { label: "Queued jobs", value: selected.queue },
                { label: "Runs today", value: selected.runsToday },
                { label: "Uptime", value: selected.uptime },
                { label: "Owner", value: selected.owner },
              ]}
            />
          </div>
        )}
      </Drawer>

      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} items={commands} />
    </>
  );
}
