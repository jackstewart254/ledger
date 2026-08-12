import type { CSSProperties } from "react";
import { MousePointerClick, Users, FileText, Timer } from "lucide-react";
import {
  KpiTileD,
  KpiPanelD,
  MetricDelta,
  SegmentedControl,
  TrendChart,
} from "@mcleanstewart/ledger";

const sub: CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
  margin: "var(--space-8) 0 var(--space-3)",
};

const row4: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "var(--space-4)",
};

const row2: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "var(--space-4)",
};

/* Two months of daily uniques, with the shape the reference had: a dip, a
   climb, a plateau. */
const UNIQUES = [
  512, 508, 496, 470, 455, 300, 288, 292, 305, 340, 402, 468, 520, 545, 560,
  575, 590, 640, 700, 742, 748, 750, 752, 760, 790, 830, 845, 827,
];
const VIEWS = [
  120, 140, 155, 160, 158, 162, 210, 260, 320, 380, 430, 470, 500, 505, 500,
  502, 498, 505, 520, 560, 590, 610, 618, 625, 630, 638, 642, 645,
];

export default function KpiLabD() {
  return (
    <section id="kpi-lab-d" className="pg-section">
      <h2 className="pg-section-title">KPI lab D — the stat-card family</h2>
      <p style={{ color: "var(--text-muted)", maxWidth: "var(--measure-text)" }}>
        Replicated from the reference. These carry no verdict: the icon colour
        identifies the metric, it does not say whether the number is good. That
        is the trade against labs A/B/C — use these for independent counters and
        those for metrics with a right and a wrong direction.
      </p>

      <h3 style={sub}>Stat cards — counters with a way through to detail</h3>
      <div style={row4}>
        <KpiTileD
          icon={Users}
          tone="warning"
          value="9"
          label="Active visitors"
          actionLabel="View details"
        />
        <KpiTileD
          icon={MousePointerClick}
          tone="success"
          value="2,231"
          label="Click events"
          actionLabel="View details"
        />
        <KpiTileD
          icon={FileText}
          tone="accent"
          value="2"
          label="Form submissions"
          actionLabel="View details"
        />
        <KpiTileD
          icon={Timer}
          tone="danger"
          value="812ms"
          label="p95 response time"
          actionLabel="View details"
        />
      </div>

      <h3 style={sub}>Stat cards — no detail link, long labels, no icon</h3>
      <div style={row4}>
        <KpiTileD icon={Users} value="41,208" label="Sessions this quarter" />
        <KpiTileD
          icon={FileText}
          tone="success"
          value="£12,480.22"
          label="Collected against invoices raised in August"
        />
        <KpiTileD value="0" label="Failed webhooks" />
        <KpiTileD value="—" label="Awaiting first sync" />
      </div>

      <h3 style={sub}>Panels — the figure, its change, and the series behind it</h3>
      <div style={row2}>
        <KpiPanelD
          title="Unique visitors"
          control={
            <SegmentedControl
              options={["3m", "6m", "12m"]}
              defaultValue="3m"
              aria-label="Unique visitors range"
            />
          }
          value="827"
          delta={<MetricDelta value={3} />}
        >
          <TrendChart data={UNIQUES} height={180} labels={["Jul", "Aug", "Sep"]} />
        </KpiPanelD>

        <KpiPanelD
          title="Page views"
          control={
            <SegmentedControl
              options={["3m", "6m", "12m"]}
              defaultValue="3m"
              aria-label="Page views range"
            />
          }
          value="645"
          delta={<MetricDelta value={-2.4} />}
        >
          <TrendChart data={VIEWS} height={180} labels={["Jul", "Aug", "Sep"]} />
        </KpiPanelD>
      </div>
    </section>
  );
}
