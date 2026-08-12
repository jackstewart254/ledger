import type { CSSProperties, ReactNode } from "react";
import {
  Avatar,
  Badge,
  Button,
  CountBadge,
  Divider,
  Icon,
  IconButton,
  ICONS,
  Kbd,
  Link,
  StatusDot,
  StatusPill,
  type IconName,
} from "@mcleanstewart/ledger";

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  flexWrap: "wrap",
};

function Specimen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: "var(--space-8)" }}>
      <h3
        style={{
          margin: "0 0 var(--space-3)",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--fw-medium)",
          color: "var(--text-muted)",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function CoreSection() {
  return (
    <section id="core" className="pg-section">
      <h2 className="pg-section-title">Core</h2>

      <Specimen title="Icon">
        <div style={{ ...row, gap: "var(--space-2_5)", color: "var(--text-muted)" }}>
          {(Object.keys(ICONS) as IconName[]).map((name) => (
            <span key={name} title={name} style={{ display: "inline-flex" }}>
              <Icon name={name} />
            </span>
          ))}
        </div>
        <div style={{ ...row, marginTop: "var(--space-3)" }}>
          <Icon name="line-chart" size={12} />
          <Icon name="line-chart" />
          <Icon name="line-chart" size={20} />
          <Icon name="line-chart" size={28} />
        </div>
      </Specimen>

      <Specimen title="Button">
        <div style={row}>
          <Button variant="primary">New transaction</Button>
          <Button>Sync accounts</Button>
          <Button variant="tertiary">View all</Button>
          <Button variant="danger">Delete account</Button>
        </div>
        <div style={{ ...row, marginTop: "var(--space-3)" }}>
          <Button size="xs">Filter</Button>
          <Button size="sm">Export CSV</Button>
          <Button size="md">Export CSV</Button>
          <Button size="lg">Export CSV</Button>
        </div>
        <div style={{ ...row, marginTop: "var(--space-3)" }}>
          <Button variant="primary" icon="plus">
            Add position
          </Button>
          <Button icon="download">Download report</Button>
          <Button variant="tertiary" icon="refresh-cw">
            Refresh
          </Button>
          <Button disabled>Sync accounts</Button>
          <Button variant="primary" disabled>
            New transaction
          </Button>
        </div>
      </Specimen>

      <Specimen title="Icon button">
        <div style={row}>
          <IconButton icon="refresh-cw" label="Refresh" />
          <IconButton icon="download" label="Download" />
          <IconButton icon="sliders-horizontal" label="Adjust" />
          <IconButton icon="line-chart" label="Chart view" active />
          <IconButton icon="maximize" label="Expand" disabled />
        </div>
      </Specimen>

      <Specimen title="Badge">
        <div style={row}>
          <Badge>Pending</Badge>
          <Badge tone="accent">Core holding</Badge>
          <Badge tone="success">Settled</Badge>
          <Badge tone="warning">Review</Badge>
          <Badge tone="danger">Overdrawn</Badge>
        </div>
        <div style={{ ...row, marginTop: "var(--space-3)" }}>
          <Badge variant="solid" tone="success">Beat</Badge>
          <Badge variant="solid" tone="danger">Missed</Badge>
          <Badge variant="outline" tone="neutral">Draft</Badge>
          <Badge dot tone="success">Live</Badge>
          <Badge dot tone="warning">Syncing</Badge>
        </div>
      </Specimen>

      <Specimen title="Status pill">
        <div style={row}>
          <StatusPill status="good" label="Growth" />
          <StatusPill status="watch" label="Cash flow" />
          <StatusPill status="risk" label="Runway" />
          <StatusPill status="unknown" label="Brand safety" />
          <StatusPill status="good" label="Margin" value="18.2%" />
          <StatusPill status="risk" size="sm" label="Burn" value="£4,120" />
        </div>
      </Specimen>

      <Specimen title="Status dot">
        <div style={row}>
          <StatusDot status="good" label="bank-sync up" />
          <StatusDot status="watch" label="bank-sync morning run" />
          <StatusDot status="risk" label="soldiers down" />
          <StatusDot status="unknown" label="ingest idle" />
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            <StatusDot status="good" label="daemon up" />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>bank-sync</span>
          </span>
        </div>
      </Specimen>

      <Specimen title="Count badge">
        <div style={row}>
          <CountBadge count={3} />
          <CountBadge count={12} tone="accent" />
          <CountBadge count={4} tone="danger" />
          <CountBadge count={240} />
        </div>
      </Specimen>

      <Specimen title="Avatar">
        <div style={row}>
          <Avatar name="Jack Stewart" size={24} />
          <Avatar name="Jack Stewart" />
          <Avatar name="Jack Stewart" size={40} />
          <Avatar name="McLean Stewart" square size={40} />
          <Avatar name="Jack Stewart" size={40} indicator="success" />
          <Avatar name="Bank sync" size={40} indicator="danger" />
          <Avatar name="" size={40} />
        </div>
      </Specimen>

      <Specimen title="Kbd">
        <div style={row}>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <Kbd>Esc</Kbd>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </span>
        </div>
      </Specimen>

      <Specimen title="Divider">
        <div style={{ maxWidth: "var(--space-20)" }}>
          <Divider />
        </div>
        <div style={{ ...row, marginTop: "var(--space-3)", height: "var(--control-h-sm)" }}>
          <span>Overview</span>
          <Divider orientation="vertical" />
          <span>Positions</span>
          <Divider orientation="vertical" />
          <span>History</span>
        </div>
      </Specimen>

      <Specimen title="Link">
        <div style={row}>
          <Link href="#core">View full statement</Link>
          <span style={{ color: "var(--text-muted)" }}>
            Rates from <Link href="#core">Bank of England</Link>, updated daily.
          </span>
        </div>
      </Specimen>
    </section>
  );
}
