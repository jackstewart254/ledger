import type { CSSProperties } from "react";
import { Activity, HardDrive, Layers, Timer, Wallet } from "lucide-react";
import { MetricDelta, KpiTileC } from "@mcleanstewart/ledger";

/* The tile's CSS is imported here rather than from the data barrel — this page
   is a lab, and nothing in the package is wired to it yet. */

const sub: CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
  margin: "var(--space-8) 0 var(--space-3)",
};

const note: CSSProperties = {
  fontSize: "var(--text-xs)",
  color: "var(--text-subtle)",
  margin: "calc(var(--space-2) * -1) 0 var(--space-3)",
  maxWidth: "var(--measure-text)",
};

const grid = (n: number): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
  gap: "var(--space-4)",
});

/* ---- formatters ---------------------------------------------------------- */
const ms = (v: number) => `${Math.round(v)} ms`;
const pts = (v: number) => `${v} pts`;
const pct = (v: number) => `${v}%`;
const gbp = (v: number) =>
  `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ---- series — 24 hourly buckets, the shape an ops panel actually ships ---- */
const RUNS = [
  12, 9, 7, 6, 5, 8, 14, 21, 26, 24, 22, 25, 27, 23, 21, 24, 28, 31, 27, 22, 18, 15, 11, 13,
];

const SUCCESS_RATE = [
  99.4, 99.5, 99.3, 99.6, 99.4, 99.2, 99.5, 99.1, 98.7, 98.2, 97.4, 96.8, 95.9, 96.4, 97.1, 96.2,
  95.4, 95.9, 96.6, 96.1, 95.8, 96.3, 96.0, 96.2,
];

const LATENCY = [
  742, 761, 738, 780, 812, 795, 826, 871, 903, 942, 988, 1024, 1071, 1110, 1064, 1132, 1198, 1241,
  1187, 1205, 1263, 1219, 1252, 1240,
];

const SPEND = [
  102, 218, 341, 402, 517, 640, 748, 812, 903, 1011, 1104, 1188, 1263, 1341, 1402, 1488, 1551, 1610,
  1672, 1719, 1764, 1798, 1822, 1843,
];

/* The awkward series: nothing, one reading, and twenty-four flat zeroes. */
const EMPTY: number[] = [];
const SINGLE = [177];
const ZEROES = Array.from({ length: 24 }, () => 0);

export default function KpiLabC() {
  return (
    <section id="kpi-lab-c" className="pg-section">
      <h2 className="pg-section-title">KPI lab — C</h2>

      <h3 style={sub}>The four shapes</h3>
      <p style={note}>
        Trend only, target only, both, neither. The tone is the verdict: blue is
        &ldquo;no line to judge this against&rdquo;, green is within the line, amber is next to
        it, red is past it. One tone per tile, read by the bar, the trend and the gap text.
      </p>
      <div style={grid(4)}>
        <KpiTileC
          label="Runs today"
          value="449"
          icon={Activity}
          delta={<MetricDelta value={8.2} />}
          trend={RUNS}
        />
        <KpiTileC
          label="p95 latency"
          value="1.24 s"
          icon={Timer}
          delta={<MetricDelta value={18.4} polarity="lower-is-better" />}
          current={1240}
          target={{ value: 1000, label: "1 s SLA", format: ms }}
          polarity="lower-is-better"
        />
        <KpiTileC
          label="Success rate"
          value="96.2%"
          delta={<MetricDelta value={-3.2} />}
          current={96.2}
          target={{ value: 99, min: 95, label: "99% SLA", format: pts }}
          trend={SUCCESS_RATE}
        />
        <KpiTileC
          label="Queue depth"
          value="177"
          icon={Layers}
          delta={<MetricDelta value={41} polarity="lower-is-better" />}
        />
      </div>

      <h3 style={sub}>The verdict ladder — same metric, three readings</h3>
      <p style={note}>
        The threshold marker sits at a fixed 66% of the track for any value within about 1.5× of the
        line, so a row of tiles marks its lines in the same place and you scan the row by comparing
        fills against one rule. Past that the domain stretches to the value and the mark slides left
        — which is the correct reading of a bad breach.
      </p>
      <div style={grid(4)}>
        <KpiTileC
          label="p95 latency"
          value="612 ms"
          icon={Timer}
          current={612}
          target={{ value: 1000, label: "1 s SLA", format: ms }}
          polarity="lower-is-better"
        />
        <KpiTileC
          label="Disk usage"
          value="78%"
          icon={HardDrive}
          current={78}
          target={{ value: 85, label: "85% cap", format: pct }}
          polarity="lower-is-better"
        />
        <KpiTileC
          label="p95 latency"
          value="1.24 s"
          icon={Timer}
          current={1240}
          target={{ value: 1000, label: "1 s SLA", format: ms }}
          polarity="lower-is-better"
        />
        <KpiTileC
          label="p95 latency"
          value="4.02 s"
          icon={Timer}
          current={4020}
          target={{ value: 1000, label: "1 s SLA", format: ms }}
          polarity="lower-is-better"
        />
      </div>

      <h3 style={sub}>Higher-is-better, and a target with a floor</h3>
      <p style={note}>
        A success rate on a 0–100 track is useless — 96.2% and 99% are the same pixel. Set{" "}
        <code>target.min</code> to the bottom of the range that matters and the bar spends its whole
        width on 95–100.
      </p>
      <div style={grid(3)}>
        <KpiTileC
          label="Success rate — no floor (0–100)"
          value="96.2%"
          current={96.2}
          target={{ value: 99, label: "99% SLA", format: pts }}
        />
        <KpiTileC
          label="Success rate — floor at 95"
          value="96.2%"
          current={96.2}
          target={{ value: 99, min: 95, label: "99% SLA", format: pts }}
        />
        <KpiTileC
          label="Uptime this month"
          value="99.97%"
          current={99.97}
          target={{ value: 99.9, min: 99.5, label: "99.9% SLA", format: pts }}
        />
      </div>

      <h3 style={sub}>Money — infrastructure spend against budget</h3>
      <div style={grid(3)}>
        <KpiTileC
          label="Spend this month"
          value="£1,842.60"
          icon={Wallet}
          delta={<MetricDelta value={12.1} polarity="lower-is-better" />}
          current={1842.6}
          target={{ value: 2000, label: "£2,000 budget", format: gbp }}
          polarity="lower-is-better"
          trend={SPEND}
        />
        <KpiTileC
          label="Spend this month"
          value="£2,214.80"
          icon={Wallet}
          delta={<MetricDelta value={34.7} polarity="lower-is-better" />}
          current={2214.8}
          target={{ value: 2000, label: "£2,000 budget", format: gbp }}
          polarity="lower-is-better"
          trend={SPEND.map((v) => v * 1.2)}
        />
        <KpiTileC
          label="Net position"
          value="£12,480.22"
          icon={Wallet}
          delta={<MetricDelta value={3.2} />}
        />
      </div>

      <h3 style={sub}>The awkward cases</h3>
      <p style={note}>
        A long label ellipses rather than wrapping the tile out of a grid. An empty series, a
        single reading and a flat run of zeroes all drop the trend strip instead of drawing an empty
        box. A <code>target</code> with no <code>current</code> has nothing to compare and drops the
        bar.
      </p>
      <div style={grid(4)}>
        <KpiTileC
          label="Reconciliation backlog — unmatched Stripe payouts since 01 Aug"
          value="1,204"
          icon={Layers}
          delta={<MetricDelta value={-22} polarity="lower-is-better" />}
          current={1204}
          target={{ value: 500, label: "500 item ceiling", format: (v) => `${v} items` }}
          polarity="lower-is-better"
        />
        <KpiTileC label="Cold starts" value="0" trend={EMPTY} />
        <KpiTileC label="Queue depth" value="177" icon={Layers} trend={SINGLE} />
        <KpiTileC label="5xx responses" value="0" trend={ZEROES} />
      </div>

      <h3 style={sub}>Exactly on the line, and a target with no current</h3>
      <div style={grid(4)}>
        <KpiTileC
          label="Concurrency"
          value="32"
          current={32}
          target={{ value: 32, label: "32 worker cap" }}
          polarity="lower-is-better"
        />
        <KpiTileC
          label="Daemons live"
          value="7"
          current={7}
          target={{ value: 7, label: "7 expected" }}
        />
        <KpiTileC
          label="Cache hit rate"
          value="—"
          target={{ value: 90, min: 50, label: "90% target", format: pts }}
        />
        <KpiTileC label="Runs today" value="449" trend={RUNS} />
      </div>

      <h3 style={sub}>Narrow column — 200px</h3>
      <div style={{ ...grid(1), maxWidth: "200px" }}>
        <KpiTileC
          label="p95 latency"
          value="1.24 s"
          icon={Timer}
          delta={<MetricDelta value={18.4} polarity="lower-is-better" />}
          current={1240}
          target={{ value: 1000, label: "1 s SLA", format: ms }}
          polarity="lower-is-better"
          trend={LATENCY}
        />
      </div>
    </section>
  );
}
