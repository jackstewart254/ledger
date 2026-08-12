import type { CSSProperties } from "react";
import { Activity, Gauge, HardDrive, Layers, PoundSterling, ShieldCheck, Timer } from "lucide-react";
import { MetricDelta, KpiTileB } from "@mcleanstewart/ledger";

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

const grid = (n: number): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
  gap: "var(--space-4)",
});

/* Two hours of an ops window, 5-minute buckets. */
const RUNS = [
  14, 12, 17, 15, 19, 16, 21, 18, 24, 22, 19, 25, 23, 27, 24, 29, 26, 31, 28, 33, 30, 36, 32, 38,
];

/* The p95 that walked through its SLA at 15:20 and stayed there. */
const LATENCY_BREACH = [
  612, 634, 601, 658, 671, 640, 688, 712, 704, 749, 806, 861, 838, 902, 967, 1014, 1088, 1042, 1131,
  1176, 1149, 1208, 1194, 1240,
];

/* eu-west-2, same window, never left the envelope. */
const LATENCY_OK = [
  742, 718, 766, 731, 780, 754, 802, 776, 812, 788, 826, 799, 841, 807, 833, 796, 848, 812,
];

/* The deploy at 15:05 that started returning 502s on the write path. */
const SUCCESS = [
  99.7, 99.8, 99.6, 99.8, 99.7, 99.5, 99.6, 99.4, 98.9, 98.1, 97.4, 96.8, 96.1, 95.7, 96.0, 95.4,
  95.9, 96.4, 96.0, 96.6, 96.2, 96.5, 96.1, 96.2,
];

const BACKLOG = [
  3120, 3084, 3210, 3396, 3548, 3712, 3690, 3874, 4021, 4188, 4142, 4370, 4516, 4488, 4703, 4861,
  4790, 4948, 5102, 5064, 5218, 5347, 5290, 5412,
];

const SPEND = [
  18.4, 41.2, 66.9, 88.1, 114.7, 142.3, 168.0, 197.6, 224.1, 251.8, 279.4, 308.2, 336.7, 364.0,
  391.5, 419.8, 447.2, 476.6, 504.1, 532.9, 561.4, 589.0, 616.3, 642.1,
];

/* A cluster that has done nothing all window — the honest flat line. */
const FLAT = Array.from({ length: 24 }, () => 0);

const gbp = (v: number) =>
  `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function KpiLabB() {
  return (
    <section id="kpi-lab-b" className="pg-section">
      <h2 className="pg-section-title">KpiTile — lab B</h2>

      <h3 style={sub}>The three shapes</h3>
      <p style={note}>
        trend only · target only · both. The trend says which way and how sharply; the bar says
        whether the number is acceptable. The mark sits at the same position on every track, so
        "which of these has crossed" is one glance down the row rather than three separate readings.
      </p>
      <div style={grid(3)}>
        <KpiTileB
          icon={Activity}
          label="Runs today"
          value="449"
          delta={<MetricDelta value={8} />}
          trend={RUNS}
        />
        <KpiTileB
          icon={Timer}
          label="p95 latency"
          value="1,240 ms"
          delta={<MetricDelta value={18} polarity="lower-is-better" />}
          target={{
            value: 1240,
            threshold: 1000,
            polarity: "lower-is-better",
            label: "SLA 1,000 ms",
          }}
        />
        <KpiTileB
          icon={ShieldCheck}
          label="Success rate"
          value="96.2%"
          delta={<MetricDelta value={-3.5} />}
          trend={SUCCESS}
          target={{ value: 96.2, threshold: 99, label: "SLO floor 99%" }}
        />
      </div>

      <h3 style={sub}>The tone ladder</h3>
      <p style={note}>
        Blue is the data colour and carries no claim. Amber only appears when the caller has said
        where attention starts (<code>near</code>, in the metric's own units — a percentage band is
        meaningless on anything that lives near 100). Red is the only state that recolours the
        figure, because it is the only one that needs no interpretation.
      </p>
      <div style={grid(3)}>
        <KpiTileB
          icon={Timer}
          label="p95 latency · eu-west-2"
          value="812 ms"
          delta={<MetricDelta value={-2.1} polarity="lower-is-better" />}
          trend={LATENCY_OK}
          target={{
            value: 812,
            threshold: 1000,
            near: 900,
            polarity: "lower-is-better",
            label: "SLA 1,000 ms",
          }}
        />
        <KpiTileB
          icon={PoundSterling}
          label="Inference spend today"
          value="£642.10"
          delta={<MetricDelta value={12.4} polarity="lower-is-better" />}
          trend={SPEND}
          target={{
            value: 642.1,
            threshold: 700,
            near: 630,
            polarity: "lower-is-better",
            label: `Daily cap ${gbp(700)}`,
          }}
        />
        <KpiTileB
          icon={Timer}
          label="p95 latency · eu-central-1"
          value="1,240 ms"
          delta={<MetricDelta value={18} polarity="lower-is-better" />}
          trend={LATENCY_BREACH}
          target={{
            value: 1240,
            threshold: 1000,
            near: 900,
            polarity: "lower-is-better",
            label: "SLA 1,000 ms",
          }}
        />
      </div>

      <h3 style={sub}>The awkward cases</h3>
      <p style={note}>
        No slots at all, a label that will not fit on one line, an empty series, a single reading, a
        flat series, and a value 5.4× its threshold. None of them may render as a broken tile.
      </p>
      <div style={grid(3)}>
        <KpiTileB
          icon={Layers}
          label="Queue depth"
          value="177"
          delta={<MetricDelta value={41} polarity="lower-is-better" />}
        />
        <KpiTileB
          icon={HardDrive}
          label="Reconciliation backlog — Barclays business feed"
          value="5,412"
          delta={<MetricDelta value={73} polarity="lower-is-better" />}
          trend={BACKLOG}
          target={{
            value: 5412,
            threshold: 1000,
            polarity: "lower-is-better",
            label: "Alert at 1,000 rows",
          }}
        />
        <KpiTileB icon={Gauge} label="Cold starts" value="0" trend={[]} />
      </div>

      <div style={{ ...grid(3), marginTop: "var(--space-4)" }}>
        <KpiTileB label="Regions reporting" value="1" trend={[6]} />
        <KpiTileB icon={Activity} label="Worker heartbeats · idle pool" value="0" trend={FLAT} />
        <KpiTileB
          label="Uptime, 30 days"
          value="99.98%"
          target={{ value: 99.98, threshold: 99.9, near: 99.95 }}
        />
      </div>

      <h3 style={sub}>A dense row — no icons, no deltas</h3>
      <p style={note}>
        The tile still holds its shape at four across, and stretched grid rows keep the figures on
        one line and the context on another.
      </p>
      <div style={grid(4)}>
        <KpiTileB label="Runs today" value="449" trend={RUNS} />
        <KpiTileB
          label="Failed runs"
          value="34"
          target={{ value: 34, threshold: 20, polarity: "lower-is-better", label: "Budget 20/day" }}
        />
        <KpiTileB label="Net position" value="£12,480.22" delta={<MetricDelta value={3.2} />} />
        <KpiTileB
          label="Success rate"
          value="96.2%"
          trend={SUCCESS}
          target={{ value: 96.2, threshold: 99 }}
        />
      </div>
    </section>
  );
}
