import { useState, type CSSProperties, type ReactNode } from "react";
import { PoundSterling } from "lucide-react";
import {
  Checkbox,
  DatePicker,
  FilterChip,
  FormField,
  Input,
  MultiSelect,
  RadioGroup,
  RangeInput,
  SearchField,
  SegmentedControl,
  Select,
  Switch,
  Textarea,
} from "@mcleanstewart/ledger";

const specStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-3)" };
const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: "var(--space-4)",
};
const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--text-sm)",
  fontWeight: "var(--fw-medium)",
  color: "var(--text-muted)",
};

function Spec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={specStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <div style={rowStyle}>{children}</div>
    </div>
  );
}

const fieldW: CSSProperties = { width: 260 };

// long enough to earn the filter row (8+)
const ACCOUNTS = [
  { value: "current", label: "Current", count: 214 },
  { value: "savings", label: "Savings", count: 18 },
  { value: "escrow", label: "Escrow", count: 0 },
  { value: "tax-reserve", label: "Tax reserve", count: 6 },
  { value: "payroll", label: "Payroll", count: 42 },
  { value: "cards", label: "Company cards", count: 97 },
  { value: "fx-eur", label: "FX — EUR", count: 11 },
  { value: "fx-usd", label: "FX — USD", count: 9 },
  { value: "petty-cash", label: "Petty cash", count: 3 },
];

export default function FormsSection() {
  const [daemons, setDaemons] = useState<string[]>(["reconcile"]);

  return (
    <section id="forms" className="pg-section">
      <h2 className="pg-section-title">Forms</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        <Spec title="Form field">
          <FormField
            label="Transaction reference"
            hint="Shown on the counterparty statement"
            style={fieldW}
          >
            <Input placeholder="e.g. TXN-2041" />
          </FormField>
          <FormField
            label="Amount"
            error="Exceeds the daily transfer limit"
            style={fieldW}
          >
            <Input invalid defaultValue="£12,400.00" icon={PoundSterling} />
          </FormField>
          <FormField
            label="Daemon notes"
            hint="Visible to the whole desk"
            style={fieldW}
          >
            <Textarea placeholder="Why was reconcile paused?" />
          </FormField>
        </Spec>

        {/* One size only — the kit is deliberately single-size, so these are
            states, not sizes. */}
        <Spec title="Input">
          <Input placeholder="Reference" style={fieldW} />
          <Input icon={PoundSterling} placeholder="0.00" style={fieldW} />
          <Input invalid defaultValue="£-52.10" style={fieldW} />
          <Input disabled defaultValue="Settled 2026-08-09" style={fieldW} />
        </Spec>

        <Spec title="Textarea">
          <Textarea placeholder="Session summary…" style={fieldW} />
          <Textarea minRows={3} defaultValue={"ingestd restarted 03:12\nbacklog cleared by 03:40"} style={fieldW} />
          <Textarea disabled defaultValue="Read-only after settlement" style={fieldW} />
        </Spec>

        <Spec title="Select">
          <FormField label="Account" style={fieldW}>
            <Select
              placeholder="Choose account"
              options={[
                { value: "current", label: "Current · £4,210.55" },
                { value: "savings", label: "Savings · £18,092.00" },
                { value: "escrow", label: "Escrow · £0.00", disabled: true },
              ]}
            />
          </FormField>
          <Select
            aria-label="Currency"
            defaultValue="gbp"
            options={[
              { value: "gbp", label: "GBP" },
              { value: "eur", label: "EUR" },
              { value: "usd", label: "USD" },
            ]}
          />
          <Select aria-label="Locked account" disabled placeholder="Escrow only" style={fieldW} />
        </Spec>

        <Spec title="Multi select">
          <MultiSelect
            aria-label="Daemons"
            placeholder="Any daemon"
            value={daemons}
            onChange={setDaemons}
            options={[
              { value: "ingestd", label: "ingestd", count: 12 },
              { value: "reconcile", label: "reconcile", count: 3 },
              { value: "fx-sync", label: "fx-sync", count: 0 },
              { value: "ledger-gc", label: "ledger-gc", count: 1 },
            ]}
          />
          <MultiSelect
            aria-label="Accounts"
            placeholder="Any account"
            defaultValue={["current"]}
            width={240}
            options={ACCOUNTS}
          />
          <MultiSelect
            aria-label="No daemons"
            placeholder="Any daemon"
            value={[]}
            onChange={() => {}}
            options={[{ value: "ingestd", label: "ingestd" }]}
            disabled
          />
        </Spec>

        <Spec title="Search field">
          <SearchField placeholder="Search transactions…" style={fieldW} />
          <SearchField defaultValue="daemon:reconcile" aria-label="Search daemons" style={fieldW} />
          <SearchField disabled placeholder="Search transactions…" style={fieldW} />
        </Spec>

        <Spec title="Checkbox">
          <Checkbox label="Include settled" defaultChecked />
          <Checkbox label="Include pending" />
          <Checkbox label="All daemons" indeterminate />
          <Checkbox label="Include voided" disabled />
          <Checkbox label="Flag over £10,000" disabled defaultChecked />
        </Spec>

        <Spec title="Radio group">
          <RadioGroup
            aria-label="Statement period"
            defaultValue="30d"
            options={[
              { value: "30d", label: "Last 30 days" },
              { value: "quarter", label: "This quarter" },
              { value: "ytd", label: "Year to date" },
            ]}
          />
          <RadioGroup
            aria-label="Export format"
            orientation="horizontal"
            defaultValue="csv"
            options={[
              { value: "csv", label: "CSV" },
              { value: "ofx", label: "OFX" },
              { value: "pdf", label: "PDF", disabled: true },
            ]}
          />
        </Spec>

        <Spec title="Switch">
          <Switch label="Auto-reconcile" defaultChecked />
          <Switch label="Alert on failed daemons" />
          <Switch label="Live prices" disabled />
        </Spec>

        <Spec title="Segmented control">
          <SegmentedControl
            aria-label="Ledger view"
            options={["Overview", "Transactions", "Daemons"]}
            defaultValue="Transactions"
          />
          <SegmentedControl
            aria-label="Window"
            options={[
              { value: "1d", label: "1D" },
              { value: "1w", label: "1W" },
              { value: "1m", label: "1M" },
              { value: "ytd", label: "YTD" },
            ]}
            defaultValue="1w"
          />
        </Spec>

        <Spec title="Filter chip">
          <FilterChip defaultActive count={12}>Pending</FilterChip>
          <FilterChip count={3}>Failed</FilterChip>
          <FilterChip>Settled</FilterChip>
          <FilterChip>Over £1,000</FilterChip>
          <FilterChip disabled>Voided</FilterChip>
        </Spec>

        <Spec title="Range input">
          <RangeInput aria-label="Alert threshold" defaultValue={40} wrapperStyle={fieldW} />
          <RangeInput aria-label="Position size" min={0} max={100} step={5} defaultValue={65} wrapperStyle={fieldW} />
          <RangeInput aria-label="Locked threshold" defaultValue={20} disabled wrapperStyle={fieldW} />
        </Spec>

        <Spec title="Date picker">
          <DatePicker aria-label="Value date" defaultValue="2026-08-12" style={fieldW} />
          <DatePicker aria-label="Settlement date" placeholder="Any date" style={fieldW} />
          <DatePicker
            aria-label="Statement date"
            defaultValue="2026-08-12"
            min="2026-08-03"
            max="2026-08-21"
            style={fieldW}
          />
          <DatePicker aria-label="Locked date" disabled defaultValue="2026-07-31" style={fieldW} />
        </Spec>
      </div>
    </section>
  );
}
