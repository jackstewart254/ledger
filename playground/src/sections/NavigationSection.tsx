import { useEffect, useState } from "react";
import {
  ChartLine,
  Check,
  Download,
  Ellipsis,
  Inbox,
  LayoutGrid,
  LogOut,
  Plus,
  PoundSterling,
  RefreshCw,
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

export default function NavigationSection() {
  const [railActive, setRailActive] = useState("overview");
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

      <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" }}>Command menu</h3>
      <Button onClick={() => setCmdOpen(true)}>Open command menu</Button>
      <CommandMenu open={cmdOpen} onClose={() => setCmdOpen(false)} items={COMMANDS} />
    </section>
  );
}
