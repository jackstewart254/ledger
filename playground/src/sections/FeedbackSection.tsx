import { useState } from "react";
import {
  Button,
  Drawer,
  EmptyState,
  InlineAlert,
  Kbd,
  Modal,
  Progress,
  Skeleton,
  Spinner,
  Toast,
  ToastViewport,
  Tooltip,
  type ToastVariant,
} from "@mcleanstewart/ledger";

const H3: React.CSSProperties = { fontSize: "var(--text-md)", fontWeight: "var(--fw-semibold)" };
const ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  flexWrap: "wrap",
  marginBottom: "var(--space-8)",
};

interface ToastEntry {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

let toastId = 0;

export default function FeedbackSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [progress, setProgress] = useState(64);

  const pushToast = (variant: ToastVariant, title: string, description?: string) =>
    setToasts((t) => [...t, { id: ++toastId, variant, title, description }]);
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <section id="feedback" className="pg-section">
      <h2 className="pg-section-title">Feedback</h2>

      <h3 style={H3}>Overlays</h3>
      <div style={ROW}>
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Close position"
        description="This settles at the next market open."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setModalOpen(false)}>
              Close position
            </Button>
          </>
        }
      >
        Closing 120 units of AAPL at market. The estimated proceeds are shown on
        the order ticket before anything is committed.
      </Modal>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        footer={
          <>
            <Button variant="primary" onClick={() => setDrawerOpen(false)}>
              Apply
            </Button>
            <Button variant="tertiary" onClick={() => setDrawerOpen(false)}>
              Reset
            </Button>
          </>
        }
      >
        Filter controls land here — the drawer body scrolls independently while
        the footer stays pinned.
      </Drawer>

      <h3 style={H3}>Toast</h3>
      <div style={ROW}>
        <Button onClick={() => pushToast("neutral", "Report queued", "You will be notified when it is ready.")}>
          Neutral toast
        </Button>
        <Button onClick={() => pushToast("success", "Order filled", "120 units at 187.42.")}>
          Success toast
        </Button>
        <Button onClick={() => pushToast("danger", "Sync failed", "The bank connection timed out.")}>
          Danger toast
        </Button>
      </div>
      <ToastViewport>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            title={t.title}
            description={t.description}
            onClose={() => dismissToast(t.id)}
          />
        ))}
      </ToastViewport>

      <h3 style={H3}>Tooltip</h3>
      <div style={ROW}>
        <Tooltip label="Refresh data" side="top">
          <Button>Top</Button>
        </Tooltip>
        <Tooltip label="Download report" side="bottom">
          <Button>Bottom</Button>
        </Tooltip>
        <Tooltip label="Previous period" side="left">
          <Button>Left</Button>
        </Tooltip>
        <Tooltip
          side="right"
          label={
            <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1_5)" }}>
              Open command menu <Kbd>⌘K</Kbd>
            </span>
          }
        >
          <Button>Right</Button>
        </Tooltip>
      </div>

      <h3 style={H3}>Inline alert</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-8)" }}>
        <InlineAlert tone="info" title="Prices are delayed">
          Quotes refresh every fifteen minutes on the free data plan.
        </InlineAlert>
        <InlineAlert tone="success" title="Bank connected">
          Transactions will appear within a few minutes.
        </InlineAlert>
        <InlineAlert tone="warning" title="Statement pending">
          Last month's statement has not been generated yet.
        </InlineAlert>
        <InlineAlert tone="danger" title="Sync failed" onClose={() => undefined}>
          The connection to the provider was refused.
        </InlineAlert>
        <InlineAlert tone="neutral">A neutral note without a title.</InlineAlert>
      </div>

      <h3 style={H3}>Empty state</h3>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <EmptyState
          icon="inbox"
          title="No transactions yet"
          description="Connect an account and activity will appear here."
          action={<Button variant="primary">Connect account</Button>}
        />
      </div>

      <h3 style={H3}>Skeleton</h3>
      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start", marginBottom: "var(--space-8)" }}>
        <Skeleton shape="circle" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Skeleton shape="text" width="40%" />
          <Skeleton shape="text" />
          <Skeleton shape="rect" height={72} />
        </div>
      </div>

      <h3 style={H3}>Spinner</h3>
      <div style={ROW}>
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" label="Loading positions" />
        <span style={{ color: "var(--success-text)" }}>
          <Spinner size="md" />
        </span>
      </div>

      <h3 style={H3}>Progress</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: "24rem" }}>
        <Progress value={progress} aria-label="Upload progress" />
        <Progress indeterminate aria-label="Syncing" />
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button size="sm" onClick={() => setProgress((p) => Math.max(0, p - 10))}>
            Less
          </Button>
          <Button size="sm" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
            More
          </Button>
        </div>
      </div>
    </section>
  );
}
