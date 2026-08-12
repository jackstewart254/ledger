import type { CSSProperties } from "react";
import { AppShell, Button, Card, EmptyState, PageColumn, Table, formatDate } from "@mcleanstewart/ledger";
import type { TableColumn } from "@mcleanstewart/ledger";

const sub: CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
  margin: "var(--space-8) 0 var(--space-3)",
};

interface Row {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

const ROWS: Row[] = [
  { id: "r1", date: "2026-08-12", description: "Sainsbury's", category: "Groceries", amount: -42.17 },
  { id: "r2", date: "2026-08-11", description: "Client invoice — McLean", category: "Income", amount: 1250 },
  { id: "r3", date: "2026-08-11", description: "TfL travel", category: "Transport", amount: -8.6 },
  { id: "r4", date: "2026-08-10", description: "Hetzner", category: "Infrastructure", amount: -21.34 },
  { id: "r5", date: "2026-08-09", description: "Pret a Manger", category: "Eating out", amount: -6.85 },
  { id: "r6", date: "2026-08-08", description: "Refund — ASOS", category: "Shopping", amount: 34.99 },
  { id: "r7", date: "2026-08-07", description: "Anthropic", category: "Infrastructure", amount: -90 },
  { id: "r8", date: "2026-08-06", description: "Gymbox", category: "Health", amount: -62 },
];

const gbp = (n: number) =>
  `${n < 0 ? "−" : ""}£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLUMNS: TableColumn<Row>[] = [
  { key: "date", header: "Date", width: "120px", numeric: true, render: (r) => formatDate(r.date) },
  { key: "description", header: "Description" },
  { key: "category", header: "Category" },
  {
    key: "amount",
    header: "Amount",
    width: "120px",
    numeric: true,
    align: "right",
    render: (r) => (
      <span style={{ color: r.amount < 0 ? "var(--danger-text)" : "var(--success-text)" }}>
        {gbp(r.amount)}
      </span>
    ),
  },
];

export default function LayoutSection() {
  return (
    <section id="layout" className="pg-section">
      <h2 className="pg-section-title">Layout</h2>

      <h3 style={sub}>Card</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <Card>
          <div style={{ color: "var(--text-muted)" }}>
            Plain card — hairline border, inner top-highlight, border-only hover.
          </div>
        </Card>
        <Card
          header={
            <>
              <span>Recent activity</span>
              <span style={{ color: "var(--text-subtle)", fontSize: "var(--text-xs)" }}>
                Last 24h
              </span>
            </>
          }
        >
          <div style={{ color: "var(--text-muted)" }}>
            Card with the optional header row on --row-h.
          </div>
        </Card>
      </div>

      <h3 style={sub}>PageColumn</h3>
      <div
        style={{
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <PageColumn>
          <div
            style={{
              background: "var(--surface-hover)",
              padding: "var(--space-3)",
              margin: "var(--space-3) 0",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
            }}
          >
            Centered column — max-width var(--page-max-width), gutters var(--page-gutter).
          </div>
        </PageColumn>
        <PageColumn fullBleed>
          <div
            style={{
              background: "var(--surface-hover)",
              padding: "var(--space-3)",
              marginBottom: "var(--space-3)",
              color: "var(--text-muted)",
            }}
          >
            fullBleed — no max-width, no gutters (the old negative-margin hack, retired).
          </div>
        </PageColumn>
      </div>

      <h3 style={sub}>AppShell</h3>
      {/* miniature framed demo — the shell itself defaults to 100dvh */}
      <div
        style={{
          height: "360px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <AppShell
          style={{ height: "100%" }}
          rail={
            <>
              {["var(--text)", "var(--text-subtle)", "var(--text-subtle)"].map((c, i) => (
                <span
                  key={i}
                  style={{
                    width: "var(--space-6)",
                    height: "var(--space-6)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-hover)",
                    border: `1px solid ${i === 0 ? "var(--border-strong)" : "var(--border)"}`,
                    display: "inline-block",
                    color: c,
                  }}
                />
              ))}
            </>
          }
          header={
            <>
              <span style={{ fontWeight: "var(--fw-medium)" }}>Overview</span>
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--text-subtle)",
                  fontSize: "var(--text-xs)",
                }}
              >
                7 daemons live
              </span>
            </>
          }
        >
          <PageColumn style={{ height: "100%", display: "grid", placeItems: "center" }}>
            <EmptyState
              title="No transactions yet"
              action={<Button>Connect account</Button>}
            />
          </PageColumn>
        </AppShell>
      </div>

      <h3 style={sub}>AppShell — table as the whole page</h3>
      <div
        style={{
          height: "360px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-surface)",
          overflow: "hidden",
        }}
      >
        <AppShell
          style={{ height: "100%" }}
          rail={
            <>
              {["var(--text)", "var(--text-subtle)", "var(--text-subtle)"].map((c, i) => (
                <span
                  key={i}
                  style={{
                    width: "var(--space-6)",
                    height: "var(--space-6)",
                    borderRadius: "var(--radius-control)",
                    background: "var(--surface-hover)",
                    border: `1px solid ${i === 1 ? "var(--border-strong)" : "var(--border)"}`,
                    display: "inline-block",
                    color: c,
                  }}
                />
              ))}
            </>
          }
          header={
            <>
              <span style={{ fontWeight: "var(--fw-medium)" }}>Transactions</span>
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--text-subtle)",
                  fontSize: "var(--text-xs)",
                }}
              >
                8 rows
              </span>
            </>
          }
        >
          <PageColumn fullBleed>
            <Table columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />
          </PageColumn>
        </AppShell>
      </div>
    </section>
  );
}
