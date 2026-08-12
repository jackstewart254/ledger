import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { Button, PageHeader, SectionHeading } from "@mcleanstewart/ledger";

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

export default function TypographySection() {
  return (
    <section id="typography" className="pg-section">
      <h2 className="pg-section-title">Typography</h2>

      <Specimen title="Page header">
        <PageHeader
          title="Money"
          subtitle="Everything in against everything out, across the whole year."
        />
        <div style={{ marginTop: "var(--space-5)" }}>
          <PageHeader title="Grad jobs" />
        </div>
      </Specimen>

      <Specimen title="Section heading">
        <SectionHeading title="Recent transactions" />
        <div style={{ marginTop: "var(--space-5)" }}>
          <SectionHeading
            title="Open positions"
            actions={
              <>
                <Button variant="tertiary">
                  Filter
                </Button>
                <Button icon={Download}>
                  Export CSV
                </Button>
              </>
            }
          />
        </div>
      </Specimen>
    </section>
  );
}
