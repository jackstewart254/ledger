import type { CSSProperties } from "react";
import { AppShell, Card, PageColumn } from "@mcleanstewart/ledger";

const sub: CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: "var(--fw-medium)",
  margin: "var(--space-8) 0 var(--space-3)",
};

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
          <PageColumn style={{ paddingTop: "var(--space-4)", paddingBottom: "var(--space-4)" }}>
            <Card header="Scrollable main">
              <div style={{ color: "var(--text-muted)" }}>
                56px rail + 52px header + scrollable content — the shell shape every
                dashboard rebuilt by hand, as slots.
              </div>
            </Card>
          </PageColumn>
        </AppShell>
      </div>
    </section>
  );
}
