import type { CSSProperties } from "react";
import { Banknote, Clock, Layers, Play, ServerCrash, ShieldCheck, Snowflake, Timer, Wallet } from "lucide-react";
import { MetricDelta, KpiTileA } from "@mcleanstewart/ledger";

const sub: CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
  margin: "var(--space-8) 0 var(--space-3)",
};

const note: CSSProperties = {
  fontSize: "var(--text-xs)",
  color: "var(--text-subtle)",
  margin: "0 0 var(--space-3)",
  maxWidth: "var(--measure-text)",
};

const grid4: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "var(--space-4)",
  alignItems: "stretch",
};

/* ---- Series — 24 hourly buckets, the shape an ops panel actually ships ---- */

const RUNS = [
  8, 6, 5, 4, 6, 9, 14, 22, 31, 38, 34, 29, 33, 41, 37, 30, 26, 22, 19, 17, 14, 11, 9, 12,
];

/* The p95 that walked off the SLA at 14:00 and never came back. */
const LATENCY_BREACH = [
  318, 306, 294, 311, 288, 302, 341, 377, 402, 438, 461, 502, 548, 604, 712, 806, 884, 951, 1004,
  1088, 1142, 1196, 1214, 1240,
];
/* Same shape, but it levelled off under the line. */
const LATENCY_OK = [
  402, 388, 371, 394, 366, 380, 421, 447, 492, 528, 551, 602, 648, 704, 782, 806, 844, 871, 854,
  838, 826, 819, 814, 812,
];

const SUCCESS = [
  99.4, 99.5, 99.4, 99.6, 99.5, 99.3, 99.4, 99.2, 98.9, 98.6, 98.8, 98.4, 98.1, 97.6, 97.9, 97.2,
  96.8, 97.1, 96.4, 96.0, 96.3, 95.8, 96.1, 96.2,
];

/* Cumulative spend through the day — GBP, egress + compute. */
const SPEND = [
  18.4, 34.9, 51.2, 66.8, 84.1, 108.6, 141.2, 186.7, 238.4, 291.9, 336.5, 372.8, 411.4, 458.2,
  497.6, 528.3, 556.1, 578.9, 597.4, 612.2, 624.8, 632.6, 638.1, 642.1,
];

const SETTLEMENT = [3.1, 3.0, 3.2, 2.9, 2.8, 2.9, 2.7, 2.6, 2.7, 2.5, 2.6, 2.4, 2.5, 2.4, 2.3, 2.4];

const FLAT_ZERO = Array.from({ length: 24 }, () => 0);

/* ---- Gap formatters — signed, the sign carries the direction --------------- */
const ms = (n: number) => `${n > 0 ? "+" : ""}${Math.round(n)}ms`;
const pp = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}pp`;
const gbp = (n: number) =>
  `${n > 0 ? "+" : "-"}£${Math.abs(n).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const count = (n: number) => `${n > 0 ? "+" : ""}${n.toLocaleString("en-GB")}`;
const days = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}d`;

export default function KpiLabA() {
  return (
    <section id="kpi-lab-a" className="pg-section">
      <h2 className="pg-section-title">KPI lab — A</h2>

      <h3 style={sub}>The row you'd put at the top of an ops dashboard</h3>
      <p style={note}>
        Trend only, target only, both, neither — left to right. The breach turns the whole tile: bar,
        series and figure.
      </p>
      <div style={grid4}>
        <KpiTileA
          icon={Play}
          label="Runs today"
          value="449"
          delta={<MetricDelta value={8.2} />}
          trend={RUNS}
        />
        <KpiTileA
          icon={Timer}
          label="p95 latency"
          value="1,240ms"
          current={1240}
          target={{ value: 1000, label: "SLA 1s" }}
          polarity="lower-is-better"
          format={ms}
          delta={<MetricDelta value={22} polarity="lower-is-better" />}
        />
        <KpiTileA
          icon={ShieldCheck}
          label="Success rate"
          value="96.2%"
          current={96.2}
          target={{ value: 99, label: "SLO 99%" }}
          trend={SUCCESS}
          format={pp}
          delta={<MetricDelta value={-1.4} />}
        />
        <KpiTileA
          icon={Layers}
          label="Queue depth"
          value="177"
          delta={<MetricDelta value={31} suffix="" polarity="lower-is-better" />}
        />
      </div>

      <h3 style={sub}>The gate holds its position</h3>
      <p style={note}>
        Same threshold, four metrics that share nothing else. The gate sits at a fixed 75% of every
        track, so "just inside" and "way past" are comparable down the row without reading a single
        number.
      </p>
      <div style={grid4}>
        <KpiTileA
          icon={Timer}
          label="p95 latency · eu-west-2"
          value="812ms"
          current={812}
          target={{ value: 1000, label: "SLA 1s" }}
          polarity="lower-is-better"
          trend={LATENCY_OK}
          format={ms}
        />
        <KpiTileA
          icon={Timer}
          label="p95 latency · us-east-1"
          value="1,240ms"
          current={1240}
          target={{ value: 1000, label: "SLA 1s" }}
          polarity="lower-is-better"
          trend={LATENCY_BREACH}
          format={ms}
        />
        <KpiTileA
          icon={Wallet}
          label="Spend today"
          value="£642.10"
          current={642.1}
          target={{ value: 2000, label: "Budget £2,000" }}
          polarity="lower-is-better"
          trend={SPEND}
          format={gbp}
        />
        <KpiTileA
          icon={Banknote}
          label="Infra spend, month to date"
          value="£1,842.60"
          current={1842.6}
          target={{ value: 2000, label: "Budget £2,000" }}
          polarity="lower-is-better"
          tone="warning"
          format={gbp}
          delta={<MetricDelta value={14} polarity="lower-is-better" />}
        />
      </div>
      <p style={note}>
        The fourth is inside its budget and would derive green. At 92% of it with eight days of the
        month to run, green is a lie — and no component can know that, so the tile takes{" "}
        <code>tone="warning"</code> from the caller. There is no automatic amber band.
      </p>

      <h3 style={sub}>The awkward cases</h3>
      <div style={grid4}>
        <KpiTileA
          icon={Clock}
          label="Median settlement time, GBP payouts to external banks"
          value="2.4 days"
          current={2.4}
          target={{ value: 2, label: "Contractual 2 days" }}
          polarity="lower-is-better"
          trend={SETTLEMENT}
          format={days}
        />
        <KpiTileA
          icon={Snowflake}
          label="Cold starts"
          value="0"
          trend={[]}
          delta={<MetricDelta value={0} />}
        />
        <KpiTileA
          icon={ServerCrash}
          label="5xx responses"
          value="0"
          current={0}
          target={{ value: 0, label: "Target 0" }}
          polarity="lower-is-better"
          trend={FLAT_ZERO}
          format={count}
        />
        <KpiTileA
          icon={Layers}
          label="Queue depth"
          value="177"
          current={177}
          target={{ value: 50 }}
          polarity="lower-is-better"
          trend={[12, 14, 11, 18, 24, 31, 47, 62, 88, 104, 131, 158, 166, 177]}
          format={count}
        />
      </div>

      <h3 style={sub}>Degraded, in order</h3>
      <p style={note}>
        No slots, one slot, one point, one number. Nothing here is broken — it is just a shorter
        tile, and the context that IS there still lands on the floor.
      </p>
      <div style={grid4}>
        <KpiTileA label="Daemons live" value="7" />
        <KpiTileA label="Net position" value="£12,480.22" delta={<MetricDelta value={3.2} />} />
        <KpiTileA label="Retries queued" value="42" trend={[42]} />
        <KpiTileA
          label="Runs today"
          value="449"
          delta={<MetricDelta value={-12} format={(v) => `${v} vs yday`} />}
          trend={RUNS}
        />
      </div>
    </section>
  );
}
