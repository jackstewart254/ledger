import type { CSSProperties } from "react";
import {
  Badge,
  CompareChart,
  KeyValue,
  MetricDelta,
  SegmentedControl,
  SummaryCard,
  SummarySplit,
} from "@mcleanstewart/ledger";

/* The board: main area three cards wide, a narrow rail down the right.
   The list cards flow into the same main grid, so all six cards in the main
   area share one set of gutters. */
const board: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "var(--space-4)",
  alignItems: "start",
};

const main: CSSProperties = {
  gridColumn: "span 3",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "var(--space-4)",
};

const rail: CSSProperties = {
  display: "grid",
  gap: "var(--space-4)",
  alignContent: "start",
};

const headRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-4)",
  margin: "var(--space-8) 0 var(--space-3)",
};

const headTitle: CSSProperties = {
  margin: 0,
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
};

const RANGE = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "12m", label: "12m" },
];

/* Four weeks of the current month against the same four of the last. */
const WEEKS = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];

const SESSIONS = { label: "This month", data: [5120, 6040, 6380, 6778] };
const SESSIONS_PREV = { label: "Last month", data: [5480, 5310, 5400, 5450] };

const CONVERSION = { label: "This month", data: [3.4, 3.51, 3.38, 3.42] };
const CONVERSION_PREV = { label: "Last month", data: [3.29, 3.44, 3.5, 3.45] };

const LOAD = { label: "This month", data: [878, 851, 824, 812] };
const LOAD_PREV = { label: "Last month", data: [902, 884, 871, 866] };

export default function KpiLabE() {
  return (
    <section id="summary" className="pg-section">
      <h2 className="pg-section-title">KPI lab E — key performance summary</h2>
      <p style={{ color: "var(--text-muted)", maxWidth: "var(--measure-text)" }}>
        One card shape for the whole board. The big metric, the compact metric
        and the status card are the same component with different things left
        out; the list card is that card wrapped around KeyValue and the split
        card around SummarySplit. Deltas are MetricDelta, so green and red still
        mean good and bad rather than up and down — the two lower-is-better
        metrics here (load time, cost per acquisition) fall and read green.
      </p>

      <div style={headRow}>
        <h3 style={headTitle}>Key performance summary</h3>
        <SegmentedControl
          options={RANGE}
          defaultValue="30d"
          aria-label="Time range"
        />
      </div>

      <div style={board}>
        <div style={main}>
          {/* ---- Three large metric cards ---- */}
          <SummaryCard
            title="Sessions"
            aside={<MetricDelta value={12.4} />}
            value="24,318"
            caption="vs 21,640 last month"
          >
            <CompareChart
              current={SESSIONS}
              previous={SESSIONS_PREV}
              labels={WEEKS}
              height={140}
            />
          </SummaryCard>

          {/* the flat case — no movement at all, grey pill, no sign */}
          <SummaryCard
            title="Conversion rate"
            aside={<MetricDelta value={0} />}
            value="3.42%"
            caption="vs 3.42% last month"
          >
            <CompareChart
              current={CONVERSION}
              previous={CONVERSION_PREV}
              labels={WEEKS}
              format={(v) => `${v.toFixed(2)}%`}
              height={140}
            />
          </SummaryCard>

          {/* long title (wraps, no ellipsis) + a metric where down is good */}
          <SummaryCard
            title="Average page load time across all monitored regions"
            aside={<MetricDelta value={-6.2} polarity="lower-is-better" />}
            value="812ms"
            caption="vs 866ms last month"
          >
            <CompareChart
              current={LOAD}
              previous={LOAD_PREV}
              labels={WEEKS}
              format={(v) => `${v}ms`}
              height={140}
            />
          </SummaryCard>

          {/* ---- Three list cards ---- */}
          <SummaryCard title="Traffic sources">
            <KeyValue
              items={[
                { label: "Organic search", value: "1,412" },
                { label: "Direct", value: "968" },
                { label: "Referral", value: "431" },
                { label: "Paid social", value: "219" },
                { label: "Email", value: "87" },
              ]}
            />
          </SummaryCard>

          {/* one value far wider than the rest — the label wraps, the figures
              stay right-aligned and tabular */}
          <SummaryCard title="Paid performance">
            <KeyValue
              items={[
                { label: "Clicks", value: "4,308" },
                { label: "Cost per click", value: "78p" },
                { label: "Media spend year to date", value: "£1,284,930.55" },
                { label: "Return on ad spend", value: "4.1×" },
                { label: "Assisted conversions", value: "312" },
              ]}
            />
          </SummaryCard>

          <SummaryCard title="Top pages">
            <KeyValue
              items={[
                { label: "/pricing", value: "3,204" },
                { label: "/blog/analytics-2026", value: "2,871" },
                { label: "/", value: "2,440" },
                { label: "/docs/getting-started", value: "1,109" },
                { label: "/changelog", value: "642" },
              ]}
            />
          </SummaryCard>
        </div>

        {/* ---- The right-hand rail ---- */}
        <div style={rail}>
          <SummaryCard
            title="New users"
            aside={<MetricDelta value={8.1} />}
            value="6,204"
            caption="vs 5,738 last month"
          />

          <SummaryCard
            title="Cost per acquisition"
            aside={<MetricDelta value={-3.6} polarity="lower-is-better" />}
            value="£18.40"
            caption="vs £19.09 last month"
          />

          {/* status card — a state, not a change, so a neutral badge */}
          <SummaryCard
            title="Bounce rate"
            aside={<Badge>Normal</Badge>}
            value="42.8%"
            caption="Users left after viewing 1 page"
          />

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
      </div>
    </section>
  );
}
