import type { CSSProperties } from "react";
import { BarChart, Sparkline, TrendChart } from "@mcleanstewart/ledger";
import type { BarChartDatum } from "@mcleanstewart/ledger";

const sub: CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
  margin: "var(--space-8) 0 var(--space-3)",
};

const grid2: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "var(--space-8)",
};

const grid3: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "var(--space-8)",
};

/* 5-minute buckets from 14:00 — the shape a log panel actually ships. */
const clock = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const bucket = (i: number) => `${clock(840 + i * 5)}–${clock(845 + i * 5)}`;

const REQUESTS = [
  612, 588, 641, 703, 674, 719, 688, 731, 702, 766, 812, 794, 758, 803, 841, 877, 826, 791, 848,
  902, 884, 851, 918, 947, 903, 812, 704, 388, 402, 517, 733, 869, 941, 988, 1024, 997, 1043, 1011,
  968, 1032, 1078, 1041, 996, 1054, 1102, 1069, 1013, 1058,
];
// 14:15–14:30 — the pod that OOM-killed and took the queue with it.
const ERRORED = new Set([27, 28, 29]);

const REQUEST_SERIES: BarChartDatum[] = REQUESTS.map((value, i) => ({
  label: bucket(i),
  value,
  tone: ERRORED.has(i) ? "danger" : undefined,
}));

const JOB_RUNS: BarChartDatum[] = [
  38, 41, 39, 44, 40, 37, 42, 45, 39, 36, 41, 43, 40, 38, 44, 42, 39, 41, 37, 43, 40, 42, 38, 44,
].map((value, i) => ({
  label: bucket(i * 3),
  value,
  tone: i === 12 ? "danger" : i === 7 || i === 17 ? "warning" : i === 23 ? "success" : undefined,
}));

/* The awkward cases. */
const FLAT: BarChartDatum[] = Array.from({ length: 24 }, (_, i) => ({
  label: bucket(i),
  value: 240,
}));

const SINGLE_SPIKE: BarChartDatum[] = Array.from({ length: 24 }, (_, i) => ({
  label: bucket(i),
  value: i === 15 ? 214 : i % 5 === 0 ? 2 : 0,
  tone: i === 15 ? "danger" : undefined,
}));

const EMPTY: BarChartDatum[] = [];

const LATENCY_P95 = [
  118, 121, 114, 126, 132, 119, 128, 141, 137, 129, 144, 152, 148, 139, 151, 163, 158, 147, 155,
  171, 166, 154, 162, 149,
];

const SPARK_RPS = [4, 6, 5, 8, 7, 9, 11, 10, 12, 11, 13, 14];
const SPARK_ERRORS = [0, 0, 1, 0, 0, 3, 9, 6, 2, 1, 0, 0];
const SPARK_QUEUE = [5, 5, 6, 5, 7, 6, 6, 7, 6, 7, 7, 8];

const req = (v: number) => `${v.toLocaleString("en-GB")} req`;

export default function ChartsSection() {
  return (
    <section id="charts" className="pg-section">
      <h2 className="pg-section-title">Charts</h2>

      <h3 style={sub}>BarChart — request log, 4 hours in 5-minute buckets</h3>
      <BarChart
        data={REQUEST_SERIES}
        label="Requests"
        value="38,412"
        meta="1,247 errors · 3.2% error rate"
        format={req}
        xStartLabel="14:00"
        xEndLabel="18:00"
      />

      <h3 style={sub}>BarChart — in a fluid grid (the width comes from the container)</h3>
      <div style={grid2}>
        <BarChart
          data={JOB_RUNS}
          label="Job runs"
          value="972"
          meta="1 failed · 2 retried"
          format={(v) => `${v} runs`}
          xStartLabel="14:00"
          xEndLabel="20:00"
        />
        <BarChart
          data={REQUEST_SERIES}
          label="Requests"
          value="38,412"
          meta="1,247 errors"
          format={req}
          height="var(--space-20)"
          xStartLabel="14:00"
          xEndLabel="18:00"
        />
      </div>

      <h3 style={sub}>BarChart — the awkward cases</h3>
      <div style={grid3}>
        <BarChart
          data={FLAT}
          label="Heartbeats"
          value="5,760"
          meta="no variance"
          format={(v) => `${v} beats`}
          xStartLabel="14:00"
          xEndLabel="16:00"
        />
        <BarChart
          data={SINGLE_SPIKE}
          label="5xx responses"
          value="222"
          meta="one incident"
          format={(v) => `${v} errors`}
          xStartLabel="14:00"
          xEndLabel="16:00"
        />
        <BarChart
          data={EMPTY}
          label="Cold starts"
          value="0"
          meta="no data in range"
          xStartLabel="14:00"
          xEndLabel="16:00"
        />
      </div>

      <h3 style={sub}>TrendChart — p95 latency, 2 hours</h3>
      <TrendChart
        data={LATENCY_P95}
        labels={LATENCY_P95.map((_, i) => clock(840 + i * 5))}
        format={(v) => `${Math.round(v)} ms`}
      />

      <h3 style={sub}>TrendChart — flat and single-point series</h3>
      <div style={grid2}>
        <TrendChart data={Array.from({ length: 24 }, () => 140)} format={(v) => `${v} ms`} />
        <TrendChart data={[]} format={(v) => `${v} ms`} />
      </div>

      <h3 style={sub}>Sparkline — inline in a status row</h3>
      <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center" }}>
        <Sparkline data={SPARK_RPS} />
        <Sparkline data={SPARK_ERRORS} fill />
        <Sparkline data={SPARK_QUEUE} width={140} height={32} fill />
        <Sparkline data={[]} />
      </div>
    </section>
  );
}
