import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Columns3, ListFilter, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  formatDate,
  IconButton,
  KeyValue,
  MetricDelta,
  SearchField,
  StatusDot,
  SummaryCard,
  Pagination,
  Sparkline,
  Table,
  TableCard,
  TrendChart,
} from "@mcleanstewart/ledger";
import type { BadgeTone, StatusDotStatus, TableColumn, TableRowKey, TableSort } from "@mcleanstewart/ledger";

const sub: CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
  margin: "var(--space-8) 0 var(--space-3)",
};

const gbp = (v: number) =>
  `${v < 0 ? "−" : ""}£${Math.abs(v).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface Txn {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

const TXNS: Txn[] = [
  { id: "t1", date: "2026-08-12", description: "Sainsbury's", category: "Groceries", amount: -42.17 },
  { id: "t2", date: "2026-08-11", description: "Client invoice — McLean", category: "Income", amount: 1250.0 },
  { id: "t3", date: "2026-08-11", description: "TfL travel", category: "Transport", amount: -8.6 },
  { id: "t4", date: "2026-08-10", description: "Hetzner", category: "Infrastructure", amount: -21.34 },
  { id: "t5", date: "2026-08-09", description: "Pret a Manger", category: "Eating out", amount: -6.85 },
  { id: "t6", date: "2026-08-08", description: "Refund — ASOS", category: "Shopping", amount: 34.99 },
  { id: "t7", date: "2026-08-07", description: "Anthropic", category: "Infrastructure", amount: -90.0 },
];

const TXN_COLUMNS: TableColumn<Txn>[] = [
  {
    key: "date",
    header: "Date",
    width: "120px",
    numeric: true,
    render: (r) => formatDate(r.date),
  },
  { key: "description", header: "Description" },
  { key: "category", header: "Category", render: (r) => <span style={{ color: "var(--text-muted)" }}>{r.category}</span> },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    numeric: true,
    width: "120px",
    render: (r) => (
      <span style={{ color: r.amount < 0 ? "var(--danger-text)" : "var(--success-text)" }}>
        {gbp(r.amount)}
      </span>
    ),
  },
];

/* Same columns, with the sort affordance switched on for the three that have a
   meaningful order. Category is a label, not a scale. */
const TXN_SORT_COLUMNS: TableColumn<Txn>[] = TXN_COLUMNS.map((c) => ({
  ...c,
  sortable: c.key !== "category",
}));

/* The comparator lives out here, in the app, because the app is the only thing
   that knows "amount" is a number and "description" is not. */
const compareTxn = (a: Txn, b: Txn, key: string) =>
  key === "amount" ? a.amount - b.amount : String(a[key as keyof Txn]).localeCompare(String(b[key as keyof Txn]));

interface Daemon {
  id: string;
  name: string;
  status: string;
  uptime: string;
  cpu: string;
}

const DAEMONS: Daemon[] = [
  { id: "d1", name: "atoms-sync", status: "live", uptime: "14d 2h", cpu: "0.4%" },
  { id: "d2", name: "money-ingest", status: "live", uptime: "14d 2h", cpu: "1.1%" },
  { id: "d3", name: "planner-tick", status: "live", uptime: "3d 11h", cpu: "0.2%" },
  { id: "d4", name: "soldiers-relay", status: "degraded", uptime: "0d 6h", cpu: "7.8%" },
  { id: "d5", name: "archive-gc", status: "live", uptime: "14d 2h", cpu: "0.1%" },
];

/* Row link demo: the identifying column is the first, so the anchor lands
   there by default and takes the daemon's name as its accessible name. */
const DAEMON_COLUMNS: TableColumn<Daemon>[] = [
  { key: "name", header: "Daemon", numeric: true },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <span style={{ color: r.status === "live" ? "var(--success-text)" : "var(--warning-text)" }}>
        {r.status}
      </span>
    ),
  },
  { key: "uptime", header: "Uptime", align: "right", numeric: true },
  { key: "cpu", header: "CPU", align: "right", numeric: true },
];

/* Same columns, with the row's control pushed off the first column — the
   `link` flag is the escape hatch for tables that lead with a status dot. */
const DAEMON_LINK_LAST: TableColumn<Daemon>[] = DAEMON_COLUMNS.map((c) => ({
  ...c,
  link: c.key === "cpu",
}));

const BALANCE_SERIES = [
  12180, 12140, 12210, 12190, 12080, 11960, 12040, 12110, 12100, 12230, 12310, 12280, 12190, 12240,
  12330, 12410, 12380, 12290, 12350, 12440, 12420, 12360, 12470, 12480,
];

/* ── TableCard demo: a caseload list ─────────────────────────────────────
   The shape the kit's tables are tuned for — an identity column, a run of
   secondary text, pills carrying state, and a row action. Names are invented. */
interface Resident {
  id: string;
  name: string;
  photo?: string;
  /** null = not yet housed; the cell shows a pill instead of an address. */
  place: string | null;
  worker: string | null;
  stage: "Pre-housing" | "Housed" | "Exited";
  payment: "In payment" | "Not in payment" | null;
  due: string | null;
  /** true renders `due` as an overdue count rather than a date. */
  dueOverdue?: boolean;
  session: { label: string; state: StatusDotStatus };
}

const RESIDENTS: Resident[] = [
  { id: "r1", name: "Aaron Bevan", place: null, worker: "Priya Sandhu", stage: "Pre-housing", payment: null, due: null, session: { label: "Today", state: "good" } },
  { id: "r2", name: "Nadia Okonkwo", place: "Grove Lane · Room 3", worker: "Priya Sandhu", stage: "Housed", payment: "In payment", due: "01 Oct 2026", session: { label: "2 days ago", state: "good" } },
  { id: "r3", name: "Tomas Lindqvist", place: "Grove Lane · Room 7", worker: "Marcus Reid", stage: "Housed", payment: "Not in payment", due: "79 days overdue", dueOverdue: true, session: { label: "5 days ago", state: "watch" } },
  { id: "r4", name: "Bella Carrington", place: "Ashworth House · Room 1", worker: "Marcus Reid", stage: "Housed", payment: "In payment", due: "14 Oct 2026", session: { label: "1 day ago", state: "good" } },
  { id: "r5", name: "Idris Haddad", place: null, worker: null, stage: "Pre-housing", payment: null, due: null, session: { label: "No sessions", state: "risk" } },
  { id: "r6", name: "Shauna Whelan", place: "Ashworth House · Room 4", worker: "Priya Sandhu", stage: "Housed", payment: "In payment", due: "22 Oct 2026", session: { label: "6 days ago", state: "watch" } },
  { id: "r7", name: "Kwame Baptiste", place: "Marsh Court · Room 2", worker: "Elena Vargas", stage: "Exited", payment: null, due: null, session: { label: "11 days ago", state: "risk" } },
  { id: "r8", name: "Fiona Del Rosario", place: "Marsh Court · Room 9", worker: "Elena Vargas", stage: "Housed", payment: "In payment", due: "03 Nov 2026", session: { label: "3 days ago", state: "good" } },
];

const STAGE_TONE: Record<Resident["stage"], BadgeTone> = {
  "Pre-housing": "info",
  Housed: "success",
  Exited: "muted",
};

/* The healthy state colours the DOT and leaves the text muted; only warning and
   overdue colour the words. A green label on every fresh row would make "fine"
   the loudest thing on the page. */
const SESSION_COLOUR: Record<StatusDotStatus, string> = {
  good: "var(--text-muted)",
  watch: "var(--tone-warning)",
  risk: "var(--tone-danger)",
  unknown: "var(--text-muted)",
};

const muted: CSSProperties = { color: "var(--text-muted)" };
const dash = <span style={muted}>-</span>;

const RESIDENT_COLUMNS: TableColumn<Resident>[] = [
  {
    key: "name",
    header: "Name",
    width: "234px",
    render: (r) => (
      <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2_5)", minWidth: 0 }}>
        <Avatar name={r.name} src={r.photo} size={34} decorative />
        <span style={{ fontWeight: "var(--fw-emphasis)", overflow: "hidden", textOverflow: "ellipsis" }}>
          {r.name}
        </span>
      </span>
    ),
  },
  {
    key: "place",
    header: "Property / Room",
    width: "232px",
    render: (r) =>
      r.place ?? (
        <Badge tone="warning" variant="subtle">
          No house
        </Badge>
      ),
  },
  { key: "worker", header: "Support worker", width: "130px", render: (r) => r.worker ?? dash },
  {
    key: "stage",
    header: "Stage",
    width: "109px",
    render: (r) => (
      <Badge tone={STAGE_TONE[r.stage]} variant="subtle">
        {r.stage}
      </Badge>
    ),
  },
  {
    key: "payment",
    header: "Payment",
    width: "127px",
    render: (r) =>
      r.payment == null ? (
        dash
      ) : (
        <Badge tone={r.payment === "In payment" ? "success" : "warning"} variant="subtle">
          {r.payment}
        </Badge>
      ),
  },
  {
    key: "due",
    header: "UC statement due",
    width: "133px",
    render: (r) =>
      r.due == null ? (
        dash
      ) : (
        <span
          style={
            r.dueOverdue
              ? { color: "var(--tone-danger)", fontWeight: "var(--fw-emphasis)" }
              : muted
          }
        >
          {r.due}
        </span>
      ),
  },
  {
    key: "session",
    header: "Last session",
    width: "117px",
    render: (r) => (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          color: SESSION_COLOUR[r.session.state],
        }}
      >
        <StatusDot status={r.session.state} label={`Last session ${r.session.label}`} />
        {r.session.label}
      </span>
    ),
  },
  {
    key: "action",
    header: "",
    width: "120px",
    align: "right",
    render: (r) =>
      r.place == null ? (
        // The row itself is a link; the button is a different action inside it.
        <Button variant="secondary" onClick={(e) => e.stopPropagation()}>
          Add to a room
        </Button>
      ) : null,
  },
];

const SPARK_A = [4, 6, 5, 8, 7, 9, 11, 10, 12, 11, 13, 14];
const SPARK_B = [14, 12, 13, 11, 12, 9, 10, 8, 9, 7, 8, 6];
const SPARK_C = [5, 5, 6, 5, 7, 6, 6, 7, 6, 7, 7, 8];

export default function DataSection() {
  const [page, setPage] = useState(3);
  const [sort, setSort] = useState<TableSort>({ key: "date", dir: "desc" });
  const [selected, setSelected] = useState<ReadonlySet<TableRowKey>>(new Set());
  const [opened, setOpened] = useState<string | null>(null);
  const [hash, setHash] = useState("");
  const [residentPage, setResidentPage] = useState(1);
  const [residentQuery, setResidentQuery] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const residents = useMemo(() => {
    const q = residentQuery.trim().toLowerCase();
    if (q === "") return RESIDENTS;
    return RESIDENTS.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.place ?? "").toLowerCase().includes(q),
    );
  }, [residentQuery]);

  const sortedTxns = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...TXNS].sort((a, b) => compareTxn(a, b, sort.key) * dir);
  }, [sort]);

  return (
    <section id="data" className="pg-section">
      <h2 className="pg-section-title">Data</h2>

      <h3 style={{ ...sub, marginTop: "var(--space-6)" }}>
        TableCard — toolbar, sticky header, pinned footer
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-3)" }}>
        Fixed height, so the body is the only thing that scrolls: scroll it and the toolbar, the
        column headings and the pager all stay put.
      </p>
      <TableCard
        height="420px"
        toolbar={
          <>
            <SearchField
              placeholder="Search by name or property"
              value={residentQuery}
              onChange={(e) => setResidentQuery(e.target.value)}
              onClear={() => setResidentQuery("")}
            />
            <IconButton icon={ListFilter} label="Filter" variant="outline" tooltip={false} />
            <IconButton icon={Columns3} label="Columns" variant="outline" tooltip={false} />
            <IconButton
              icon={X}
              label="Clear filters"
              variant="outline"
              tooltip={false}
              disabled={residentQuery === ""}
              onClick={() => setResidentQuery("")}
            />
          </>
        }
        footer={
          <>
            <span>
              1-{residents.length} of 144 residents · Payment status derived from the remittance,
              w/c 07 Sep 2026
            </span>
            <Pagination compact page={residentPage} pageCount={3} onPageChange={setResidentPage} />
          </>
        }
      >
        <Table
          columns={RESIDENT_COLUMNS}
          rows={residents}
          rowKey={(r) => r.id}
          rowHref="#resident-{id}"
          empty="No residents match that search."
        />
      </TableCard>

      <h3 style={sub}>KpiTile + MetricDelta</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <SummaryCard
          title="Net position"
          value="£12,480.22"
          caption="vs £12,093.60 last month"
          aside={<MetricDelta value={3.2} />}
        />
        <SummaryCard
          title="Spend this week"
          value="£642.10"
          caption="vs £701.02 last week"
          aside={<MetricDelta value={-8.4} />}
        />
        <SummaryCard title="Daemons live" value="7" caption="unchanged since Tuesday" aside={<MetricDelta value={0} />} />
        <SummaryCard
          title="Runs today"
          value="148"
          caption="vs 160 yesterday"
          aside={<MetricDelta value={-12} format={(v) => `${v} vs yday`} />}
        />
      </div>

      <h3 style={sub}>MetricDelta</h3>
      <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "center" }}>
        <MetricDelta value={3.2} />
        <MetricDelta value={-1.8} />
        <MetricDelta value={0} />
        <MetricDelta value={-8.4} />
        <MetricDelta value={-90} format={gbp} />
      </div>

      <h3 style={sub}>Table — transactions ( £ amounts)</h3>
      <Table
        columns={TXN_COLUMNS}
        rows={TXNS}
        rowKey={(r) => r.id}
        maxHeight="280px"
      />

      <h3 style={sub}>Table — daemons</h3>
      <Table columns={DAEMON_COLUMNS} rows={DAEMONS} rowKey={(r) => r.id} />

      <h3 style={sub}>Table — rowHref (serialisable template, keyboard-reachable)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-3)" }}>
        Tab into the table: each row is one stop. Enter follows the link, ⌘/middle-click opens a
        tab. Current hash: <code>{hash || "—"}</code>
      </p>
      <Table
        columns={DAEMON_COLUMNS}
        rows={DAEMONS}
        rowKey={(r) => r.id}
        rowHref="#daemon-{id}"
      />

      <h3 style={sub}>Table — onRowClick, control moved to the CPU column</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-3)" }}>
        No URL to point at, so the cell holds a button — Enter and Space both fire it.{" "}
        {opened ? `Opened ${opened}` : "Nothing opened"}
      </p>
      <Table
        columns={DAEMON_LINK_LAST}
        rows={DAEMONS}
        rowKey={(r) => r.id}
        onRowClick={(r) => setOpened(r.name)}
      />

      <h3 style={sub}>Table — sortable, selectable, sticky header</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: "0 0 var(--space-3)" }}>
        {selected.size === 0 ? "Nothing selected" : `${selected.size} selected`} · sorted by {sort.key} ({sort.dir})
      </p>
      <Table
        columns={TXN_SORT_COLUMNS}
        rows={sortedTxns}
        rowKey={(r) => r.id}
        maxHeight="240px"
        sort={sort}
        onSortChange={setSort}
        selectedKeys={selected}
        onSelectionChange={setSelected}
        // Without this the checkbox reads out "Select t3" — the rowKey, which is
        // an opaque id here and a uuid in a real app.
        selectLabel={(t) => `Select ${t.description}, ${formatDate(t.date)}`}
      />

      <h3 style={sub}>Sparkline</h3>
      <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center" }}>
        <Sparkline data={SPARK_A} />
        <Sparkline data={SPARK_B} fill />
        <Sparkline data={SPARK_C} width={140} height={32} fill />
      </div>

      <h3 style={sub}>TrendChart — balance, 24 days</h3>
      <TrendChart
        data={BALANCE_SERIES}
        width={720}
        format={(v) => `£${Math.round(v).toLocaleString("en-GB")}`}
      />

      <h3 style={sub}>KeyValue</h3>
      <div style={{ maxWidth: "420px" }}>
        <KeyValue
          items={[
            { label: "Reference", value: "TXN-2026-081142" },
            { label: "Merchant", value: "Sainsbury's" },
            { label: "Settled", value: "12 Aug 2026, 09:14" },
            {
              label: "Amount",
              value: <span style={{ color: "var(--danger-text)" }}>{gbp(-42.17)}</span>,
              hint: "Gross — the merchant's own fee is settled separately.",
            },
            { label: "Balance after", value: "£12,480.22" },
          ]}
        />
      </div>

      <h3 style={sub}>KeyValue — columns, one item qualified</h3>
      {/* the hint is what keeps this label the same length as its neighbours */}
      <Card>
        <KeyValue
          orientation="columns"
          items={[
            { label: "Inflow", value: "£18,420" },
            { label: "Outflow", value: "£11,905" },
            { label: "Net", value: "£6,515" },
            { label: "Projection", value: "£78,180", hint: "Year-end, all rows — not just this page." },
            { label: "Accounts", value: "9" },
          ]}
        />
      </Card>

      <h3 style={sub}>Pagination</h3>
      <Pagination page={page} pageCount={12} onPageChange={setPage} />
    </section>
  );
}
