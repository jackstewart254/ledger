import {
  Info,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  Divider,
  IconButton,
  KeyValue,
  Link,
  MetricDelta,
  SummaryCard,
  PageColumn,
  Progress,
  SectionHeading,
  Sparkline,
  StatusDot,
  Table,
  formatDate,
  pct,
} from "@mcleanstewart/ledger";
import type { StatusDotStatus, TableColumn } from "@mcleanstewart/ledger";
import "./overview-page.css";

/* ── fake money data — August 2026 ──────────────────────────────────────── */

interface Account {
  id: string;
  name: string;
  meta: string;
  balance: number;
  status: StatusDotStatus;
  trend: number[];
  marker?: { label: string; tone: "danger" | "warning" };
}

const ACCOUNTS: Account[] = [
  {
    id: "monzo",
    name: "Monzo current",
    meta: "•• 4417",
    balance: 2418.63,
    status: "good",
    trend: [1980, 2140, 2065, 2310, 2402, 2288, 2418],
  },
  {
    id: "starling",
    name: "Starling joint",
    meta: "•• 8802",
    balance: 684.12,
    status: "watch",
    trend: [1460, 1320, 1180, 1044, 902, 771, 684],
  },
  {
    id: "barclays",
    name: "Barclays everyday",
    meta: "•• 1290",
    balance: -312.48,
    status: "risk",
    trend: [220, 148, 96, 12, -84, -196, -312],
    marker: { label: "Overdrawn", tone: "danger" },
  },
  {
    id: "chase",
    name: "Chase saver",
    meta: "3.85% AER",
    balance: 11250,
    status: "good",
    trend: [9800, 10050, 10300, 10550, 10800, 11000, 11250],
  },
  {
    id: "amex",
    name: "Amex cashback",
    meta: "Limit £5,000",
    balance: -1043.77,
    status: "watch",
    trend: [-410, -560, -612, -740, -845, -960, -1043],
    marker: { label: "Due 24 Aug", tone: "warning" },
  },
];

interface Txn {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number;
  pending?: boolean;
}

const TXNS: Txn[] = [
  { id: "t1", merchant: "Waitrose", category: "Groceries", date: "2026-08-11", amount: -112.85 },
  {
    id: "t2",
    merchant: "Trainline",
    category: "Travel",
    date: "2026-08-11",
    amount: -86.4,
    pending: true,
  },
  { id: "t3", merchant: "Screwfix", category: "Home", date: "2026-08-10", amount: -234.61 },
  { id: "t4", merchant: "Kier Group", category: "Salary", date: "2026-08-08", amount: 2940.18 },
  { id: "t5", merchant: "Dishoom", category: "Eating out", date: "2026-08-08", amount: -68.5 },
  { id: "t6", merchant: "Zara", category: "Shopping", date: "2026-08-07", amount: -74 },
  { id: "t7", merchant: "Sainsbury's", category: "Groceries", date: "2026-08-06", amount: -41.28 },
];

interface DirectDebit {
  id: string;
  name: string;
  date: string;
  amount: number;
  awaiting?: boolean;
}

const DIRECT_DEBITS: DirectDebit[] = [
  { id: "d1", name: "Octopus Energy", date: "14 Aug", amount: 96 },
  { id: "d2", name: "Vitality health", date: "15 Aug", amount: 42.75 },
  { id: "d3", name: "Santander mortgage", date: "18 Aug", amount: 1184.32 },
  { id: "d4", name: "Thames Water", date: "22 Aug", amount: 38.1, awaiting: true },
  { id: "d5", name: "Vodafone", date: "28 Aug", amount: 22 },
];

interface Goal {
  id: string;
  name: string;
  saved: number;
  target: number;
  marker?: string;
}

const GOALS: Goal[] = [
  { id: "g1", name: "Japan, March 2027", saved: 2850, target: 3000, marker: "£150 to go" },
  { id: "g2", name: "Emergency fund", saved: 8200, target: 12000 },
  { id: "g3", name: "New kitchen", saved: 1340, target: 9500 },
];

interface Category {
  id: string;
  name: string;
  spent: number;
  budget: number;
}

const CATEGORIES: Category[] = [
  { id: "c1", name: "Groceries", spent: 412.6, budget: 450 },
  { id: "c2", name: "Bills & utilities", spent: 386.9, budget: 520 },
  { id: "c3", name: "Travel", spent: 248.15, budget: 300 },
  { id: "c4", name: "Eating out", spent: 196.4, budget: 150 },
  { id: "c5", name: "Shopping", spent: 174, budget: 250 },
];

const NET_WORTH_90D = [
  44210, 44680, 45120, 44890, 45640, 46310, 46080, 46920, 47340, 47110, 47880,
  48260, 48040, 48710, 49120, 48930, 49322,
];

/* ── formatting ────────────────────────────────────────────────────────── */

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const GBP_WHOLE = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const money = (n: number) => GBP.format(n);
const signed = (n: number) => (n > 0 ? `+${GBP.format(n)}` : GBP.format(n));

/* ── page ──────────────────────────────────────────────────────────────── */

export default function OverviewPage() {
  const cash = ACCOUNTS.filter((a) => a.id !== "amex").reduce((n, a) => n + a.balance, 0);
  const ddTotal = DIRECT_DEBITS.reduce((n, d) => n + d.amount, 0);

  const columns: TableColumn<Txn>[] = [
    {
      key: "merchant",
      header: "Merchant",
      render: (t) => (
        <span className="pg-ov-row">
          <Avatar name={t.merchant} size={22} square decorative />
          <span className="pg-ov-name">{t.merchant}</span>
          {t.pending && (
            <Badge tone="warning" variant="outline">
              Pending
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: "9rem",
      render: (t) => <span className="pg-ov-muted">{t.category}</span>,
    },
    {
      key: "date",
      header: "Date",
      width: "9rem",
      numeric: true,
      render: (t) => <span className="pg-ov-muted">{formatDate(t.date)}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      width: "8rem",
      align: "right",
      numeric: true,
      render: (t) => (
        <span className={t.amount > 0 ? "pg-ov-credit" : undefined}>{signed(t.amount)}</span>
      ),
    },
  ];

  return (
    <PageColumn>
      <div className="pg-ov-stack">
        <div className="pg-ov-kpis">
          <SummaryCard
            title="Net worth"
            value={GBP_WHOLE.format(49322)}
            caption="vs £48,167 last month"
            aside={<MetricDelta value={2.4} />}
          />
          <SummaryCard
            title="Cash across accounts"
            value={money(cash)}
            caption="vs £14,594.10 last month"
            aside={<MetricDelta value={-3.8} />}
          />
          <SummaryCard
            title="Spent, August"
            value={money(1862.44)}
            caption="vs £1,672.30 to this point in July"
            aside={<MetricDelta value={11.4} polarity="lower-is-better" />}
          />
          <SummaryCard
            title="Savings rate"
            value={pct(18.2)}
            caption="vs 17.6% last month"
            aside={<MetricDelta value={3.1} />}
          />
        </div>

        <div className="pg-ov-split">
          <div className="pg-ov-col">
            <div className="pg-ov-section">
              <SectionHeading
                title="Accounts"
                actions={<Link href="#accounts">Manage accounts</Link>}
              />
              <Card>
                {ACCOUNTS.map((a) => (
                  <div key={a.id} className="pg-ov-account">
                    <span className="pg-ov-row">
                      <StatusDot status={a.status} label={`${a.name} health`} />
                      <span className="pg-ov-name">{a.name}</span>
                      <span className="pg-ov-dim">{a.meta}</span>
                      {a.marker && (
                        <Badge tone={a.marker.tone} variant="outline">
                          {a.marker.label}
                        </Badge>
                      )}
                    </span>
                    <Sparkline data={a.trend} width={72} height={20} />
                    <span className={a.balance < 0 ? "pg-ov-num pg-ov-debt" : "pg-ov-num"}>
                      {money(a.balance)}
                    </span>
                  </div>
                ))}
                <Divider />
                <div className="pg-ov-total">
                  <span className="pg-ov-muted">Cash, excluding credit</span>
                  <span className="pg-ov-num">{money(cash)}</span>
                </div>
              </Card>
            </div>

            <div className="pg-ov-section">
              <SectionHeading
                title="Recent transactions"
                actions={<Link href="#transactions">View all</Link>}
              />
              {/* Table brings its own surface — a Card around it doubles the border. */}
              <Table columns={columns} rows={TXNS} rowKey={(t) => t.id} />
            </div>
          </div>

          <div className="pg-ov-col">
            <Card
              header={
                <>
                  <span>Net worth</span>
                  <MetricDelta value={2.4} />
                </>
              }
            >
              <div className="pg-ov-figure">
                <span className="pg-ov-figure-value">{GBP_WHOLE.format(49322)}</span>
                <span className="pg-ov-muted">90 days</span>
              </div>
              <Sparkline
                className="pg-ov-chart"
                data={NET_WORTH_90D}
                width={300}
                height={56}
                fill
              />
              <Divider />
              <KeyValue
                items={[
                  { label: "Cash", value: money(cash) },
                  { label: "Stocks & shares ISA", value: money(19480.55) },
                  { label: "Workplace pension", value: money(16845.12) },
                  {
                    label: "Credit cards",
                    value: <span className="pg-ov-debt">{money(-1043.77)}</span>,
                  },
                ]}
              />
            </Card>

            <Card
              header={
                <>
                  <span>Upcoming direct debits</span>
                  <IconButton
                    variant="bare"
                    icon={Info}
                    label="Taken on the next working day if the date falls on a weekend"
                  />
                </>
              }
            >
              <KeyValue
                items={DIRECT_DEBITS.map((d) => ({
                  label: (
                    <span className="pg-ov-row">
                      {d.awaiting && <StatusDot status="watch" label="Awaiting confirmation" />}
                      <span className="pg-ov-name">{d.name}</span>
                      <span className="pg-ov-dim">{d.date}</span>
                    </span>
                  ),
                  value: money(d.amount),
                }))}
              />
              <Divider />
              <div className="pg-ov-total">
                <span className="pg-ov-muted">Leaving before 1 September</span>
                <span className="pg-ov-num">{money(ddTotal)}</span>
              </div>
            </Card>

            <Card header={<span>Savings goals</span>}>
              {GOALS.map((g) => (
                <div key={g.id} className="pg-ov-meter">
                  <div className="pg-ov-meter-head">
                    <span className="pg-ov-row">
                      <span className="pg-ov-name">{g.name}</span>
                      {g.marker && <Badge tone="accent">{g.marker}</Badge>}
                    </span>
                    <span className="pg-ov-num pg-ov-muted">
                      {money(g.saved)} of {money(g.target)}
                    </span>
                  </div>
                  <Progress
                    value={g.saved}
                    max={g.target}
                    aria-label={`${g.name} progress`}
                  />
                </div>
              ))}
            </Card>

            <Card
              header={
                <>
                  <span>Spend by category</span>
                  <span className="pg-ov-muted">August</span>
                </>
              }
            >
              {CATEGORIES.map((c) => (
                <div key={c.id} className="pg-ov-meter">
                  <div className="pg-ov-meter-head">
                    <span className="pg-ov-row">
                      <span className="pg-ov-name">{c.name}</span>
                      {c.spent > c.budget && (
                        <Badge tone="danger" variant="outline">
                          Over
                        </Badge>
                      )}
                    </span>
                    <span className="pg-ov-num pg-ov-muted">
                      {money(c.spent)} of {money(c.budget)}
                    </span>
                  </div>
                  <Progress
                    value={c.spent}
                    max={c.budget}
                    aria-label={`${c.name} against budget`}
                  />
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </PageColumn>
  );
}
