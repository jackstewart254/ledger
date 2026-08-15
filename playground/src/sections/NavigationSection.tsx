import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  ChartLine,
  Check,
  Download,
  Ellipsis,
  FileText,
  Inbox,
  LayoutGrid,
  LogOut,
  Plus,
  PoundSterling,
  RefreshCw,
  Settings,
  SunMoon,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  Button,
  CommandMenu,
  IconButton,
  Menu,
  Rail,
  RailItem,
  Tabs,
  type CommandMenuItem,
} from "@mcleanstewart/ledger";

const COMMANDS: CommandMenuItem[] = [
  { id: "overview", label: "Go to overview", group: "Navigate", icon: LayoutGrid },
  { id: "money", label: "Go to money", group: "Navigate", icon: PoundSterling },
  { id: "charts", label: "Go to charts", group: "Navigate", icon: ChartLine },
  { id: "refresh", label: "Refresh data", group: "Actions", icon: RefreshCw },
  { id: "download", label: "Download report", group: "Actions", icon: Download },
  { id: "sign-out", label: "Sign out", group: "Actions", icon: LogOut },
];

/* enough routes to outgrow a short viewport — the scrolling rail demo */
const LONG_RAIL = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "charts", label: "Charts", icon: ChartLine },
  { id: "money", label: "Money", icon: PoundSterling },
  { id: "wallets", label: "Wallets", icon: Wallet },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "entities", label: "Entities", icon: Building2 },
  { id: "people", label: "People", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function NavigationSection() {
  const [railActive, setRailActive] = useState("overview");
  const [longRailActive, setLongRailActive] = useState("overview");
  const [tab, setTab] = useState("positions");
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="navigation" className="pg-section">
      <h2 className="pg-section-title">Navigation</h2>

      <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" }}>Rail</h3>
      <div
        style={{
          height: "260px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          display: "flex",
          marginBottom: "var(--space-8)",
        }}
      >
        <Rail
          footer={<RailItem icon={LogOut} label="Sign out" onClick={() => undefined} />}
        >
          <RailItem
            icon={LayoutGrid}
            label="Overview"
            active={railActive === "overview"}
            onClick={() => setRailActive("overview")}
          />
          <RailItem
            icon={ChartLine}
            label="Charts"
            active={railActive === "charts"}
            onClick={() => setRailActive("charts")}
          />
          <RailItem
            icon={PoundSterling}
            label="Money"
            active={railActive === "money"}
            onClick={() => setRailActive("money")}
          />
          <RailItem
            icon={Inbox}
            label="Inbox"
            active={railActive === "inbox"}
            onClick={() => setRailActive("inbox")}
          />
        </Rail>
        <div style={{ padding: "var(--space-4)", color: "var(--text-muted)" }}>
          Hover or focus an item for its flyout label.
        </div>
      </div>

      <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" }}>
        Rail — more routes than height
      </h3>
      <div
        style={{
          height: "400px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          marginBottom: "var(--space-8)",
        }}
      >
        <Rail
          aria-label="Long primary"
          footer={
            <>
              <RailItem icon={SunMoon} label="Theme" onClick={() => undefined} />
              <RailItem icon={LogOut} label="Sign out" onClick={() => undefined} />
            </>
          }
        >
          {LONG_RAIL.map((item) => (
            <RailItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={longRailActive === item.id}
              onClick={() => setLongRailActive(item.id)}
            />
          ))}
        </Rail>
        <div style={{ padding: "var(--space-4)", color: "var(--text-muted)" }}>
          Ten routes in 400px: the items scroll (bar appears on hover), the footer stays pinned.
        </div>
      </div>

      <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" }}>Tabs</h3>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <Tabs
          aria-label="Portfolio views"
          value={tab}
          onChange={setTab}
          items={[
            { value: "positions", label: "Positions" },
            { value: "orders", label: "Orders" },
            { value: "history", label: "History" },
            { value: "settled", label: "Settled", disabled: true },
          ]}
        />
      </div>

      <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" }}>Menu</h3>
      <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        <Menu
          trigger={<Button>Actions</Button>}
          items={[
            { label: "Rename", icon: Check },
            { label: "Duplicate", icon: Plus },
            { label: "Download", icon: Download, disabled: true },
            { label: "Delete", icon: X, danger: true },
          ]}
        />
        <Menu
          align="end"
          trigger={<IconButton icon={Ellipsis} label="More" />}
          items={[
            { label: "Refresh" },
            { label: "Sign out", danger: true },
          ]}
        />
      </div>

      {/* The case JAC-302 was filed for: before portaling, both panels below
          were cut off at the box edge. The second one also has nowhere to open
          downward, so it should flip above its trigger. */}
      <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" }}>
        Menu inside a clipping ancestor
      </h3>
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          overflow: "hidden",
          height: "56px",
          alignItems: "center",
          padding: "0 var(--space-4)",
          marginBottom: "var(--space-8)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-surface)",
        }}
      >
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>overflow: hidden</span>
        <Menu
          trigger={<Button>Clipped actions</Button>}
          items={[
            { label: "Rename", icon: Check },
            { label: "Duplicate", icon: Plus },
            { label: "Delete", icon: X, danger: true },
          ]}
        />
        <div style={{ overflow: "auto", maxHeight: "40px", padding: "var(--space-1)" }}>
          <Menu
            align="end"
            trigger={<IconButton icon={Ellipsis} label="Scroll-container actions" />}
            items={[{ label: "Refresh" }, { label: "Sign out", danger: true }]}
          />
        </div>
      </div>

      <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" }}>Command menu</h3>
      <Button onClick={() => setCmdOpen(true)}>Open command menu</Button>
      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} items={COMMANDS} />
    </section>
  );
}
