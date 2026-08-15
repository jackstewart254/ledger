// Props reference, generated from the types that already are the source of
// truth — run `npm run docs` in packages/ledger after changing a component.
//
// The compiler API reads src/index.ts, follows every export back to its
// declaration and prints one markdown file per component category. Nothing here
// is hand-maintained except the usage snippets at the bottom of this file, so
// the tables cannot drift from the components the way a written-out doc does.
import ts from "typescript";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT = "../../docs/api"; // repo root, not the published package
const ENTRY = resolve("src/index.ts");

/* ── program ─────────────────────────────────────────────────────────── */

const cfg = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, ".");
const program = ts.createProgram([ENTRY], parsed.options);
const checker = program.getTypeChecker();
const entry = program.getSourceFiles().find((f) => f.fileName === ENTRY);
if (!entry) throw new Error(`entry not in program: ${ENTRY}`);

const unalias = (sym) =>
  sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;

/* ── text helpers ────────────────────────────────────────────────────── */

const oneLine = (s) => s.replace(/\s+/g, " ").trim();
const cell = (s) => oneLine(s).replace(/\|/g, "\\|");
/** Prose mentions tags — `<input type="date">`, `<CompareChart>`. Left bare, a
 *  markdown renderer treats them as HTML and swallows them. Code spans are
 *  already literal, so escape only outside them. */
const escapeAngles = (s) =>
  s
    .split(/(`[^`]*`)/)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/</g, "&lt;")))
    .join("");
const unquote = (s) => s.replace(/^['"`]|['"`]$/g, "");
const optional = (s) => s.replace(/\s*\|\s*undefined$/, "");

/** Doc comments carry the rationale blocks; keep the line structure the author
 *  wrote and only drop the leading ` * `. */
const stripStars = (block) =>
  block
    .split("\n")
    .map((l) => l.replace(/^\s*\* ?/, ""))
    .join("\n")
    .replace(/^\n+|\s+$/g, "");

/** JSDoc placed above a re-export instead of above the component is attached to
 *  that statement, not the function (see Icon). Fall back to the file's own
 *  "Name — …" convention rather than silently losing the rationale. */
const orphanDoc = (file, name) => {
  for (const m of file.text.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const body = stripStars(m[1]);
    if (body.startsWith(`${name} —`) || body.startsWith(`${name} -`)) return body;
  }
  return "";
};

const docOf = (sym) =>
  ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();

const docOfNode = (node) => {
  const sym = node.name && checker.getSymbolAtLocation(node.name);
  return sym ? docOf(sym) : "";
};

/** First paragraph is the summary ("Name — what it is"), the rest is the why. */
const splitDoc = (doc) => {
  const [head = "", ...rest] = doc.split(/\n\s*\n/);
  const summary = oneLine(head).replace(/^\w+\s+[—-]\s*/, "");
  return {
    summary: summary.charAt(0).toUpperCase() + summary.slice(1),
    // trim() would eat the indent that marks a sketch block, so only cut blanks
    rationale: rest.join("\n\n").replace(/^\n+|\s+$/g, ""),
  };
};

/** Indented blocks in a doc comment are little tables and code sketches —
 *  markdown would collapse them into prose, so fence them. */
const renderProse = (text) =>
  text
    .split(/\n\s*\n/)
    .map((block) =>
      /^ {2,}\S/m.test(block)
        ? "```text\n" + block.replace(/\s+$/, "") + "\n```"
        : escapeAngles(block),
    )
    .join("\n\n");

/* ── extraction ──────────────────────────────────────────────────────── */

/** Own members of a props type. Inherited React/DOM props stay out of the table
 *  — 250 rows of ButtonHTMLAttributes buries the six that are ours — and are
 *  reported as the heritage line instead. */
const propsShape = (typeNode) => {
  if (!typeNode) return { members: [], heritage: [], type: undefined };
  if (ts.isTypeLiteralNode(typeNode))
    return { members: typeNode.members, heritage: [], type: undefined };
  if (!ts.isTypeReferenceNode(typeNode)) return { members: [], heritage: [], type: undefined };

  const sym = checker.getSymbolAtLocation(typeNode.typeName);
  const decl = sym && unalias(sym).declarations?.[0];
  const type = checker.getTypeAtLocation(typeNode);

  if (decl && ts.isInterfaceDeclaration(decl))
    return {
      members: decl.members,
      heritage: (decl.heritageClauses ?? []).flatMap((h) => h.types.map((t) => oneLine(t.getText()))),
      type,
    };
  // `export type KbdProps = HTMLAttributes<HTMLElement>` — nothing of its own.
  if (decl && ts.isTypeAliasDeclaration(decl))
    return ts.isTypeLiteralNode(decl.type)
      ? { members: decl.type.members, heritage: [], type }
      : { members: [], heritage: [oneLine(decl.type.getText())], type };
  return { members: [], heritage: [], type };
};

/** The pragma is per-module and it is the whole fact: a bundler reads nothing
 *  else to decide the component is a client boundary, so neither do we. */
const isClientFile = (file) => {
  const [first] = file.statements;
  return Boolean(
    first &&
      ts.isExpressionStatement(first) &&
      ts.isStringLiteral(first.expression) &&
      first.expression.text === "use client",
  );
};

/** A prop whose type is an arrow. Read off the written type rather than a list
 *  of prop names, so a new callback is flagged the day it is added. */
const isFunctionProp = (type) => /=>/.test(type);

const jsxElements = (fn) => {
  const found = [];
  const walk = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) found.push(node);
    node.forEachChild(walk);
  };
  if (fn.body) walk(fn.body);
  return found;
};

/** The attribute's VALUE. `node.getText()` on the attribute would include its
 *  own name, so every `className=…` would look like it referenced the binding. */
const attrValue = (el, name) => {
  const found = el.attributes.properties.find(
    (p) => ts.isJsxAttribute(p) && p.name.getText() === name && p.initializer,
  );
  return found ? found.initializer.getText() : "";
};

/** Which element `{...rest}` reaches, and which one `className`/`style` reach
 *  when the component pulls them out of the spread. On any component that wraps
 *  its control in a frame (Input, Select, SearchField) these are different
 *  elements, and "spread onto the underlying element" was a lie about the half
 *  a consumer actually styles. */
const spreadTargets = (fn) => {
  const binding = fn.parameters[0]?.name;
  if (!binding || !ts.isObjectBindingPattern(binding)) return {};
  const rest = binding.elements.find((el) => el.dotDotDotToken)?.name.getText();
  const els = jsxElements(fn);

  const restEl = rest
    ? els.find((el) =>
        el.attributes.properties.some(
          (p) => ts.isJsxSpreadAttribute(p) && p.expression.getText() === rest,
        ),
      )
    : undefined;
  // The frame's className is `cx(…, className)` — the destructured binding, not
  // the element's own literal class. Match the identifier, not the attribute.
  const frameEl = els.find((el) =>
    ["className", "style"].some((n) => new RegExp(`\\b${n}\\b`).test(attrValue(el, n))),
  );

  // Only an intrinsic tag names something the reader can picture; a polymorphic
  // `<As>` (RailItem, Link) is a local variable and says nothing.
  const tag = (el) => {
    const name = el?.tagName.getText();
    return name && /^[a-z][a-z0-9-]*$/.test(name) ? name : undefined;
  };
  const spreadTag = tag(restEl);
  const frameTag = restEl !== frameEl ? tag(frameEl) : undefined;
  return spreadTag && frameTag ? { spreadTag, frameTag } : { spreadTag };
};

/** Defaults are only visible where the component destructures them. */
const defaultsOf = (fn) => {
  const binding = fn.parameters[0]?.name;
  if (!binding || !ts.isObjectBindingPattern(binding)) return new Map();
  return new Map(
    binding.elements
      .filter((el) => !el.dotDotDotToken)
      .map((el) => [
        unquote((el.propertyName ?? el.name).getText()),
        el.initializer ? oneLine(el.initializer.getText()) : undefined,
      ]),
  );
};

const readComponent = (sym, decl) => {
  const name = sym.getName();
  const file = decl.getSourceFile();
  const attached = docOf(sym);
  const doc = attached || orphanDoc(file, name);
  const propsType = decl.parameters[0]?.type;
  const { members, heritage, type } = propsShape(propsType);
  const defaults = defaultsOf(decl);
  const own = new Set();

  const props = members.filter(ts.isPropertySignature).map((m) => {
    const key = unquote(m.name.getText());
    own.add(key);
    return {
      name: key,
      type: oneLine(m.type ? m.type.getText() : "unknown"),
      optional: Boolean(m.questionToken),
      default: defaults.get(key),
      doc: oneLine(docOfNode(m)),
      inherited: false,
    };
  });

  /* A default set on an inherited prop (Slider's min/max, IconButton's
     type) is the component's behaviour too, and it appears nowhere else. */
  const inherited = [...defaults]
    .filter(([key, value]) => value !== undefined && !own.has(key))
    .map(([key, value]) => {
      const prop = type && checker.getPropertyOfType(type, key);
      return {
        name: key,
        type: prop
          ? optional(checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, decl)))
          : "unknown",
        optional: true,
        default: value,
        doc: prop ? oneLine(docOf(prop)) : "",
        inherited: true,
      };
    });

  return {
    name,
    client: isClientFile(file),
    ...spreadTargets(decl),
    category: file.fileName.split("/components/")[1]?.split("/")[0] ?? "other",
    // repo-relative, so the docs/api/*.md links resolve with ../../
    file: file.fileName.slice(file.fileName.indexOf("packages/ledger/")),
    typeParams: decl.typeParameters?.map((p) => p.getText()).join(", "),
    propsType: propsType ? oneLine(propsType.getText()) : undefined,
    heritage,
    props: [...props, ...inherited],
    orphanDoc: Boolean(doc) && !attached,
    ...splitDoc(doc),
  };
};

/** Where a type is exported FROM, which is where it belongs in the docs — a
 *  type re-exported from a package (LucideIcon) resolves into node_modules. */
const srcFileOf = (exported) => {
  const seen = new Set();
  for (let sym = exported; sym && !seen.has(sym); ) {
    seen.add(sym);
    const file = sym.declarations?.[0]?.getSourceFile();
    if (file?.fileName.includes("/src/")) return file;
    sym = sym.flags & ts.SymbolFlags.Alias ? checker.getImmediateAliasedSymbol(sym) : undefined;
  }
  return undefined;
};

const readType = (exported, sym, decl) => {
  const file = decl.getSourceFile();
  const external = file.fileName.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//);
  const base = {
    name: sym.getName(),
    doc: oneLine(docOf(sym)),
    typeParams: decl.typeParameters?.map((p) => p.getText()).join(", "),
  };
  const home = (srcFileOf(exported) ?? file).fileName;
  if (external)
    return { ...base, external: external[1], category: home.split("/components/")[1]?.split("/")[0] };
  const category = home.split("/components/")[1]?.split("/")[0];
  if (ts.isTypeAliasDeclaration(decl))
    return { ...base, category, alias: oneLine(decl.type.getText()) };
  return {
    ...base,
    category,
    members: decl.members.filter(ts.isPropertySignature).map((m) => ({
      name: unquote(m.name.getText()),
      type: oneLine(m.type ? m.type.getText() : "unknown"),
      optional: Boolean(m.questionToken),
      doc: oneLine(docOfNode(m)),
    })),
  };
};

const components = [];
const types = [];
const utils = [];

for (const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(entry))) {
  const sym = unalias(exported);
  const decl = sym.declarations?.[0];
  if (!decl) continue;
  const path = decl.getSourceFile().fileName;

  if (ts.isFunctionDeclaration(decl) || ts.isVariableDeclaration(decl)) {
    if (path.includes("/src/utils/")) {
      utils.push({
        name: sym.getName(),
        signature: oneLine(checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, decl))),
        summary: splitDoc(docOf(sym)).summary,
      });
      continue;
    }
    if (ts.isFunctionDeclaration(decl) && /^[A-Z]/.test(sym.getName()))
      components.push(readComponent(sym, decl));
    continue;
  }

  if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) {
    // *Props is rendered as its component's table, not twice.
    if (/Props$/.test(sym.getName())) continue;
    types.push(readType(exported, sym, decl));
  }
}

/* ── usage snippets ──────────────────────────────────────────────────────
   The one hand-written part: written against each component's real props,
   with the kind of data this kit is for. A component missing from the map
   still gets docs — it falls back to a skeleton built from its required
   props — so adding a component never silently drops it. */

const EXAMPLES = {
  Icon: `import { Search } from "lucide-react";

<Icon as={Search} />`,
  Button: `<Button variant="primary" onClick={createInvoice}>New invoice</Button>`,
  IconButton: `<IconButton icon={RefreshCw} label="Refresh balances" onClick={reload} />`,
  Badge: `<Badge tone="warning" dot>Awaiting settlement</Badge>`,
  StatusPill: `<StatusPill status="watch" label="Faster Payments" value="98.2%" />`,
  StatusDot: `<StatusDot status="good" label="HMRC gateway" />`,
  CountBadge: `<CountBadge count={128} max={99} tone="accent" />`,
  Avatar: `<Avatar name="Priya Raghunathan" indicator="success" />`,
  Kbd: `Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search`,
  Divider: `<Divider />
<Divider orientation="vertical" />`,
  Link: `<Link href="https://find-and-update.company-information.service.gov.uk">
  Companies House
</Link>`,

  PageHeader: `<PageHeader
  title="Reconciliation"
  subtitle="Barclays current account · 12 August 2026"
  actions={<Button variant="primary">Export CSV</Button>}
/>`,
  SectionHeading: `<SectionHeading
  title="Outstanding invoices"
  actions={<Link href="/invoices">View all</Link>}
/>`,

  AppShell: `<AppShell
  rail={<Rail>{navItems}</Rail>}
  search={<SearchField placeholder="Search transactions" />}
  actions={<IconButton icon={Bell} label="Notifications" />}
>
  <PageColumn>{page}</PageColumn>
</AppShell>`,
  PageColumn: `<PageColumn>
  <PageHeader title="Ledger" />
  <Card>{table}</Card>
</PageColumn>`,
  Card: `<Card header={<SectionHeading title="VAT return · Q2" />}>
  <KeyValue items={[{ label: "Due", value: "7 August 2026" }]} />
</Card>`,

  Rail: `<Rail aria-label="Primary" footer={<RailItem icon={Settings} label="Settings" href="/settings" />}>
  <RailItem icon={LayoutDashboard} label="Overview" href="/" active />
  <RailItem icon={Receipt} label="Invoices" href="/invoices" />
</Rail>`,
  RailItem: `<RailItem icon={Receipt} label="Invoices" href="/invoices" active />`,
  Tabs: `<Tabs
  items={[
    { value: "all", label: "All" },
    { value: "unmatched", label: "Unmatched" },
    { value: "flagged", label: "Flagged" },
    { value: "archived", label: "Archived", disabled: true },
  ]}
  value={tab}
  onChange={setTab}
  aria-label="Transaction filter"
/>`,
  Menu: `<Menu
  trigger={<IconButton icon={MoreHorizontal} label="Row actions" tooltip={false} />}
  align="end"
  items={[
    { id: "match", label: "Match to invoice", icon: Link2, onSelect: () => match(row) },
    { id: "flag", label: "Flag for review", onSelect: () => flag(row) },
    { id: "void", label: "Void", danger: true, onSelect: () => voidEntry(row) },
  ]}
/>`,
  CommandMenu: `<CommandMenu
  open={open}
  onClose={() => setOpen(false)}
  items={[
    { id: "new-invoice", label: "New invoice", icon: Plus, onSelect: createInvoice },
    { id: "vat", label: "VAT return", group: "Go to", keywords: "hmrc tax", onSelect: () => go("/vat") },
  ]}
/>`,

  FormField: `<FormField label="Sort code" htmlFor="sort-code" error={errors.sortCode}>
  <Input id="sort-code" placeholder="20-00-00" invalid={Boolean(errors.sortCode)} />
</FormField>`,
  Input: `<Input icon={Building2} placeholder="Account name" defaultValue="Marlow Joinery Ltd" />`,
  DatePicker: `<DatePicker
  value={periodEnd}
  onChange={setPeriodEnd}
  min="2026-04-06"
  max="2027-04-05"
  placeholder="Period end"
/>`,
  Select: `<Select
  options={[
    { value: "gbp", label: "GBP — Pound sterling" },
    { value: "eur", label: "EUR — Euro" },
    { value: "usd", label: "USD — US dollar", disabled: true },
  ]}
  value={currency}
  onChange={(e) => setCurrency(e.target.value)}
/>`,
  SearchField: `<SearchField
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  placeholder="Search transactions"
/>`,
  MultiSelect: `<MultiSelect
  options={[
    { value: "barclays", label: "Barclays · Current", count: 412 },
    { value: "starling", label: "Starling · Business", count: 189 },
    { value: "revolut", label: "Revolut · EUR", count: 24 },
  ]}
  value={accounts}
  onChange={setAccounts}
  placeholder="All accounts"
  searchable
/>`,
  FilterToggle: `<FilterToggle active={unreconciled} onChange={setUnreconciled} count={8}>
  Unreconciled
</FilterToggle>`,
  Textarea: `<Textarea
  minRows={3}
  placeholder="Note for the auditor"
  defaultValue="Cleared against remittance 8841."
/>`,
  Checkbox: `<Checkbox label="Include VAT" defaultChecked />`,
  RadioGroup: `<RadioGroup
  name="basis"
  options={[
    { value: "accrual", label: "Accrual" },
    { value: "cash", label: "Cash" },
  ]}
  value={basis}
  onChange={setBasis}
  orientation="horizontal"
/>`,
  Switch: `<Switch checked={autoMatch} onChange={setAutoMatch} label="Auto-match payments" />`,
  SegmentedControl: `<SegmentedControl
  options={["Day", "Week", "Month"]}
  value={grain}
  onChange={setGrain}
  aria-label="Time grain"
/>`,
  Slider: `<Slider
  min={0}
  max={5000}
  step={50}
  value={threshold}
  onChange={(e) => setThreshold(Number(e.target.value))}
/>`,
  RangeSlider: `<RangeSlider
  min={0}
  max={5000}
  step={50}
  value={amount}
  onChange={setAmount}
  minLabel="Minimum amount"
  maxLabel="Maximum amount"
/>`,

  Table: `<Table
  columns={[
    { key: "date", header: "Date", width: "110px", render: (r) => formatDate(r.date) },
    { key: "counterparty", header: "Counterparty" },
    { key: "reference", header: "Reference", width: "150px" },
    {
      key: "amount",
      header: "Amount",
      width: "120px",
      align: "right",
      numeric: true,
      render: (r) => \`£\${r.amount.toLocaleString("en-GB")}\`,
    },
    { key: "status", header: "Status", width: "120px", render: (r) => <StatusPill status={r.status} /> },
  ]}
  rows={transactions}
  rowKey={(r) => r.id}
  onRowClick={(r) => openTransaction(r.id)}
  maxHeight="60vh"
  empty="Nothing to reconcile"
/>`,
  MetricDelta: `<MetricDelta value={12.5} />                                 {/* revenue up — green */}
<MetricDelta value={-4.2} polarity="lower-is-better" />     {/* debtor days down — green */}
<MetricDelta value={1.8} suffix=" days" polarity="lower-is-better" />`,
  Sparkline: `<Sparkline data={[38, 41, 39, 44, 47, 46, 52]} fill />`,
  TrendChart: `<TrendChart
  data={[184, 192, 188, 205, 231, 226, 244]}
  labels={["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
  format={(v) => \`£\${v}k\`}
/>`,
  BarChart: `<BarChart
  label="Payments received"
  value="£208,415"
  meta="1,284 transactions"
  data={[
    { label: "Barclays", value: 128400 },
    { label: "Starling", value: 61265 },
    { label: "Revolut", value: 18750, tone: "warning" },
  ]}
  format={(v) => \`£\${(v / 1000).toFixed(1)}k\`}
  xStartLabel="Apr"
  xEndLabel="Aug"
/>`,
  CompareChart: `<CompareChart
  current={{ label: "This quarter", data: [184, 192, 188, 205] }}
  previous={{ label: "Last quarter", data: [171, 169, 180, 176] }}
  labels={["Apr", "May", "Jun", "Jul"]}
  format={(v) => \`£\${v}k\`}
/>`,
  SummaryCard: `<SummaryCard
  title="Cash at bank"
  aside={<MetricDelta value={6.4} />}
  value="£208,415"
  caption="vs £195,900 last month"
>
  <CompareChart
    current={{ label: "This year", data: cashThisYear }}
    previous={{ label: "Last year", data: cashLastYear }}
    labels={months}
  />
</SummaryCard>`,
  SummarySplit: `<SummaryCard title="Payment methods">
  <SummarySplit
    parts={[
      { value: "64%", label: "Bank transfer" },
      { value: "30%", label: "Direct debit" },
      { value: "6%", label: "Card" },
    ]}
  />
</SummaryCard>`,
  KeyValue: `<KeyValue
  items={[
    { label: "VAT number", value: "GB 481 2937 41" },
    { label: "Scheme", value: "Standard" },
    { label: "Next return", value: "7 August 2026" },
  ]}
/>`,
  Pagination: `<Pagination page={page} pageCount={9} onPageChange={setPage} />`,

  Modal: `<Modal
  open={open}
  onClose={close}
  title="Void invoice INV-2214"
  footer={
    <>
      <Button onClick={close}>Cancel</Button>
      <Button variant="danger" onClick={voidInvoice}>Void</Button>
    </>
  }
>
  This cannot be undone. The credit note stays on the ledger.
</Modal>`,
  Drawer: `<Drawer open={open} onClose={close} title="Transaction detail" width={420}>
  <KeyValue items={detail} />
</Drawer>`,
  Toast: `<Toast
  tone="success"
  title="Reconciled"
  description="42 transactions matched to invoices."
  onClose={dismiss}
  duration={5000}
/>`,
  ToastViewport: `<ToastViewport>
  {toasts.map((t) => (
    <Toast key={t.id} {...t} onClose={() => dismiss(t.id)} />
  ))}
</ToastViewport>`,
  Tooltip: `<Tooltip label="Last synced 09:41" side="bottom">
  <StatusDot status="good" />
</Tooltip>`,
  InlineAlert: `<InlineAlert tone="warning" title="Two statements unmatched" onClose={dismiss}>
  Upload the July statement to finish the quarter.
</InlineAlert>`,
  EmptyState: `<EmptyState
  icon={Inbox}
  title="Every transaction to 12 August is matched"
  action={<Button variant="primary">Import statement</Button>}
/>`,
  Skeleton: `<Skeleton shape="text" width="60%" />
<Skeleton shape="circle" width={32} height={32} />`,
  Spinner: `<Spinner label="Fetching statements" />`,
  Progress: `<Progress value={68} max={100} aria-label="Importing statements" />`,
};

const fallbackExample = (c) => {
  const required = c.props.filter((p) => !p.optional && p.name !== "children");
  const attrs = required.map((p) => ` ${p.name}={${p.name}}`).join("");
  const hasChildren = c.props.some((p) => p.name === "children");
  return hasChildren ? `<${c.name}${attrs}>…</${c.name}>` : `<${c.name}${attrs} />`;
};

/* ── markdown ────────────────────────────────────────────────────────── */

const CATEGORY_TITLE = {
  core: "Core",
  typography: "Typography",
  layout: "Layout",
  navigation: "Navigation",
  forms: "Forms",
  data: "Data",
  feedback: "Feedback",
};

/** Index lines take the first sentence; the section keeps the whole paragraph. */
const bullet = (c, href) => {
  const [first] = c.summary.split(/(?<=\.)\s+/, 1);
  return `- [${c.name}](${href})${first ? ` — ${escapeAngles(first)}` : ""}`;
};

const propTable = (props) => {
  if (props.length === 0) return "";
  const rows = props.map((p) => {
    const tags = [!p.optional && "required", isFunctionProp(p.type) && "function"].filter(Boolean);
    const name = [`\`${p.name}\``, ...tags].join(" **·** ");
    const doc = p.inherited ? [p.doc, "_(inherited)_"].filter(Boolean).join(" ") : p.doc;
    return `| ${name} | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : "—"} | ${cell(escapeAngles(doc || ""))} |`;
  });
  return ["| Prop | Type | Default | Description |", "| --- | --- | --- | --- |", ...rows].join("\n");
};

const RECIPE = "[Recipe 7](../recipes.md#7-charts-and-tables-under-a-server-component)";

const names = (props) =>
  props.map((p) => `\`${p.name}\``).join(", ").replace(/, ([^,]*)$/, " and $1");

/** The whole point of the marker: name the props, then say what happens. A
 *  reader who has been told "function" but not "and therefore your route
 *  throws" has been told nothing they could not read off the type column. */
const boundaryNote = (props, subject) => {
  const fns = props.filter((p) => isFunctionProp(p.type));
  if (fns.length === 0) return [];
  return [
    `${names(fns)} ${fns.length === 1 ? "is a function" : "are functions"}, and a function cannot cross the server→client boundary. ` +
      `${subject} typechecks, compiles, and throws the first time the route renders. ${RECIPE} is the shape that works.`,
    "",
  ];
};

const componentSection = (c) => {
  const out = [`### ${c.name}`, ""];
  if (c.summary) out.push(escapeAngles(c.summary), "");
  out.push(
    `\`${c.name}${c.typeParams ? `<${c.typeParams}>` : ""}\`${c.propsType ? ` · props \`${c.propsType}\`` : ""} · [\`${c.file}\`](../../${c.file})`,
    "",
  );
  if (c.client)
    out.push(
      `**Client component** — the file carries \`"use client"\`. It renders from a server component; its props must be serialisable to get there.`,
      "",
    );
  if (c.rationale) out.push(renderProse(c.rationale), "");

  const table = propTable(c.props);
  out.push(table || "_No props of its own._", "");
  if (c.client) out.push(...boundaryNote(c.props, `Passing one from a server component`));
  if (c.heritage.length > 0)
    out.push(
      `Also accepts every prop of ${c.heritage.map((h) => `\`${h}\``).join(", ")} — they are spread onto the underlying ${c.spreadTag ? `\`<${c.spreadTag}>\`` : "element"}.` +
        (c.frameTag
          ? ` \`className\` and \`style\` are the exception: they land on the \`<${c.frameTag}>\` wrapping it, not on the \`<${c.spreadTag}>\` — style this component and you are styling the wrapper.`
          : "") +
        (c.client ? " Event handlers among them are functions too, and carry the same restriction." : ""),
      "",
    );

  out.push("```tsx", EXAMPLES[c.name] ?? fallbackExample(c), "```", "");
  return out.join("\n");
};

const typeSection = (t) => {
  const generic = `${t.name}${t.typeParams ? `<${t.typeParams}>` : ""}`;
  const out = [`### ${escapeAngles(generic)}`, ""];
  if (t.doc) out.push(escapeAngles(t.doc), "");
  if (t.external) {
    out.push(`Re-exported from \`${t.external}\`.`, "");
    return out.join("\n");
  }
  if (t.alias) {
    out.push("```ts", `type ${generic} = ${t.alias};`, "```", "");
    return out.join("\n");
  }
  out.push(propTable(t.members.map((m) => ({ ...m, default: undefined }))) || "_Empty._", "");
  // A function hidden one level down in an object prop is the worst version of
  // this: the call site passes an array literal and nothing reads as a callback.
  out.push(...boundaryNote(t.members, "Building this object in a server component"));
  return out.join("\n");
};

/* A component with no props AND no heritage means the props type failed to
   resolve, not that it takes nothing — fail loudly rather than ship a page
   that quietly says the component has no API. */
const unresolved = components.filter((c) => c.props.length === 0 && c.heritage.length === 0);
if (unresolved.length > 0)
  throw new Error(`props not resolved for: ${unresolved.map((c) => c.name).join(", ")}`);

mkdirSync(OUT, { recursive: true });

const categories = [...new Set(components.map((c) => c.category))];
for (const category of categories) {
  const inCategory = components.filter((c) => c.category === category);
  const catTypes = types.filter((t) => t.category === category);
  const page = [
    `# ${CATEGORY_TITLE[category] ?? category}`,
    "",
    `Generated from \`src/components/${category}\` — do not edit by hand, run \`npm run docs\`.`,
    "",
    inCategory.map((c) => bullet(c, `#${c.name.toLowerCase()}`)).join("\n"),
    "",
    "## Components",
    "",
    inCategory.map(componentSection).join("\n"),
    ...(catTypes.length > 0 ? ["## Types", "", catTypes.map(typeSection).join("\n")] : []),
  ].join("\n");
  writeFileSync(`${OUT}/${category}.md`, page.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
}

const index = [
  "# API reference",
  "",
  "Every prop of every exported component, generated from the TypeScript source",
  "by `packages/ledger/scripts/gen-api-docs.mjs`. Do not edit these files by hand —",
  "run `npm --prefix packages/ledger run docs`.",
  "",
  "```tsx",
  'import { Table, SummaryCard } from "@mcleanstewart/ledger";',
  'import "@mcleanstewart/ledger/styles.css";',
  "```",
  "",
  "## Reading these tables",
  "",
  `**Client component** marks a component whose file carries \`"use client"\` — ${components.filter((c) => c.client).length}`,
  `of ${components.length}. A **·** \`function\` tag marks a prop whose type is a function.`,
  "",
  "In a React Server Components app the pair is a trap. A client component",
  "renders from a server component perfectly well, so nothing warns you — but a",
  "function prop cannot be sent to it, and that call typechecks, survives",
  "`next build`, and throws the first time the route renders. `format` and",
  "`rowKey` are the ones that catch people: they read as pure formatting rather",
  "than interaction, and the boundary does not care what a prop reads as.",
  "[Recipe 7](../recipes.md#7-charts-and-tables-under-a-server-component) is the",
  "wrapper that fixes it.",
  "",
  ...categories.map((category) => {
    const inCategory = components.filter((c) => c.category === category);
    return [
      `## [${CATEGORY_TITLE[category] ?? category}](${category}.md) · ${inCategory.length}`,
      "",
      inCategory.map((c) => bullet(c, `${category}.md#${c.name.toLowerCase()}`)).join("\n"),
      "",
    ].join("\n");
  }),
  "## Utilities",
  "",
  "| Export | Signature | Summary |",
  "| --- | --- | --- |",
  ...utils.map((u) => `| \`${u.name}\` | \`${cell(u.signature)}\` | ${cell(u.summary)} |`),
  "",
  `_${components.length} components, ${types.length} exported types, ${utils.length} utilities._`,
  "",
].join("\n");
writeFileSync(`${OUT}/README.md`, index);

console.log(
  `docs: ${components.length} components across ${categories.length} categories, ` +
    `${types.length} types, ${utils.length} utils -> ${OUT}`,
);
const undocumented = components.filter((c) => !c.summary).map((c) => c.name);
const noProps = components.filter((c) => c.props.length === 0).map((c) => c.name);
const orphans = components.filter((c) => c.orphanDoc).map((c) => c.name);
if (undocumented.length > 0) console.log(`  no doc comment: ${undocumented.join(", ")}`);
if (noProps.length > 0) console.log(`  no own props: ${noProps.join(", ")}`);
// JSDoc that sits above an interface or a re-export instead of the function:
// TypeScript hands it to that statement, so tooling loses it. Docs recover it;
// moving the block onto the function would fix it at the source too.
if (orphans.length > 0) console.log(`  doc not attached to the function: ${orphans.join(", ")}`);
