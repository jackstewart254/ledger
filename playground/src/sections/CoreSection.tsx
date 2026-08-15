import type { CSSProperties, ReactNode } from "react";
import {
  Calendar,
  ChartLine,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Ellipsis,
  ExternalLink,
  Funnel,
  Info,
  Maximize,
  PoundSterling,
  RefreshCw,
  Search,
  SendHorizontal,
  SlidersHorizontal,
  Star,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  CountBadge,
  Divider,
  Icon,
  IconButton,
  Kbd,
  Link,
  StatusDot,
  StatusPill,
} from "@mcleanstewart/ledger";

/* the dozen a dashboard actually reaches for — any of Lucide's ~1,600 works */
const DASHBOARD_ICONS: LucideIcon[] = [
  Search,
  Funnel,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  TriangleAlert,
  Check,
  X,
  Ellipsis,
  Calendar,
  PoundSterling,
];

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
        <div style={{ ...row, gap: "var(--space-3)", color: "var(--text-muted)" }}>
          {DASHBOARD_ICONS.map((Glyph, i) => (
            <Icon key={i} as={Glyph} />
          ))}
        </div>
        <p style={{ color: "var(--text-muted)", marginTop: "var(--space-3)" }}>
          Any lucide-react icon works — import the component and pass it as <code>as</code>.
        </p>
        <div style={{ ...row, marginTop: "var(--space-3)" }}>
          <Icon as={ChartLine} size={12} />
          <Icon as={ChartLine} />
          <Icon as={ChartLine} size={20} />
          <Icon as={ChartLine} size={28} />
        </div>
      </Specimen>

      <Specimen title="Button">
        <div style={row}>
          <Button variant="primary">New transaction</Button>
          <Button>Sync accounts</Button>
          <Button variant="tertiary">View all</Button>
          <Button variant="danger">Delete account</Button>
        </div>
        {/* No size row — the kit is deliberately single-size. */}
        <div style={{ ...row, marginTop: "var(--space-3)" }}>
          <Button variant="primary">Add position</Button>
          <Button>Download report</Button>
          <Button variant="tertiary">Refresh</Button>
          <Button disabled>Sync accounts</Button>
          <Button variant="primary" disabled>
            New transaction
          </Button>
        </div>
      </Specimen>

      <Specimen title="Icon button">
        <div style={row}>
          <IconButton icon={RefreshCw} label="Refresh" />
          <IconButton icon={Download} label="Download" />
          <IconButton icon={SlidersHorizontal} label="Adjust" />
          <IconButton icon={ChartLine} label="Chart view" active />
          <IconButton icon={Maximize} label="Expand" disabled />
          <IconButton icon={SendHorizontal} label="Send" variant="primary" />
          <IconButton icon={SendHorizontal} label="Send" variant="primary" disabled />
        </div>
        {/* bare — annotation on the left, toggles on the right. The active
            treatment is a filled chip now, not a colour step. */}
        <div style={{ ...row, marginTop: "var(--space-3)", alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Year-end projection
          </span>
          <IconButton icon={Info} label="All rows, not just this page" variant="bare" />
          <IconButton icon={Star} label="Pin" variant="bare" />
          <IconButton icon={Star} label="Pinned" variant="bare" active />
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
          <StatusPill status="risk" label="Burn" value="£4,120" />
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
