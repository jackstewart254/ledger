import { useState, type ChangeEvent } from "react";
import { Copy } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  FormField,
  IconButton,
  Input,
  Kbd,
  KeyValue,
  MultiSelect,
  PageColumn,
  RadioGroup,
  Slider,
  SearchField,
  SectionHeading,
  SegmentedControl,
  Select,
  Switch,
  Textarea,
} from "@mcleanstewart/ledger";
import "./settings-page.css";

/* ── workspace data ────────────────────────────────────────────────────── */

const WORKSPACE_DOMAIN = "harbourside.co.uk";

const TIMEZONES = [
  { value: "europe-london", label: "London — GMT+1" },
  { value: "europe-dublin", label: "Dublin — GMT+1" },
  { value: "europe-lisbon", label: "Lisbon — GMT+1" },
  { value: "europe-paris", label: "Paris — GMT+2" },
  { value: "utc", label: "UTC" },
];

const DATE_FORMATS = [
  { value: "dmy", label: "12/09/2026" },
  { value: "long", label: "12 September 2026" },
  { value: "iso", label: "2026-09-12" },
];

/* 8 options — MultiSelect earns its filter row from here up. */
const EVENTS = [
  { value: "invoice-paid", label: "Invoice paid" },
  { value: "invoice-overdue", label: "Invoice overdue", count: 2 },
  { value: "payment-failed", label: "Payment failed" },
  { value: "client-added", label: "New client added" },
  { value: "quote-accepted", label: "Quote accepted" },
  { value: "card-expiring", label: "Card expiring" },
  { value: "vat-due", label: "VAT return due", count: 1 },
  { value: "digest-ready", label: "Weekly summary ready" },
];

const SCOPES = [
  { value: "invoices-read", label: "invoices:read" },
  { value: "invoices-write", label: "invoices:write" },
  { value: "contacts-read", label: "contacts:read" },
  { value: "contacts-write", label: "contacts:write" },
  { value: "payments-read", label: "payments:read" },
  { value: "payments-write", label: "payments:write" },
  { value: "expenses-read", label: "expenses:read" },
  { value: "reports-read", label: "reports:read" },
  { value: "webhooks-manage", label: "webhooks:manage" },
];

const PLANS = [
  { value: "solo", name: "Solo", monthly: 9, seats: 1 },
  { value: "team", name: "Team", monthly: 29, seats: 5 },
  { value: "scale", name: "Scale", monthly: 79, seats: 20 },
];

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "billing", label: "Billing only" },
];

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
}

const TEAM: Member[] = [
  {
    id: "nadia",
    name: "Nadia Ellery",
    email: `nadia@${WORKSPACE_DOMAIN}`,
    role: "owner",
    joined: "Joined March 2024",
  },
  {
    id: "tom",
    name: "Tom Aldridge",
    email: `tom@${WORKSPACE_DOMAIN}`,
    role: "admin",
    joined: "Joined November 2025",
  },
  {
    id: "priya",
    name: "Priya Raghunathan",
    email: `priya@${WORKSPACE_DOMAIN}`,
    role: "member",
    joined: "Joined February 2026",
  },
  {
    id: "gwen",
    name: "Gwen Farrar",
    email: `accounts@${WORKSPACE_DOMAIN}`,
    role: "billing",
    joined: "Invited 4 July 2026",
  },
];

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/* ── page ──────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  // profile
  const [name, setName] = useState("Nadia Ellery");
  const [email, setEmail] = useState("nadia.ellery@gmail.com");
  const [jobTitle, setJobTitle] = useState("Finance lead");
  const [timezone, setTimezone] = useState("europe-london");
  const [bio, setBio] = useState("Runs the books for a four-person studio in Bristol.");

  // preferences
  const [theme, setTheme] = useState("system");
  const [weekStart, setWeekStart] = useState("mon");
  const [dateFormat, setDateFormat] = useState("long");
  const [compact, setCompact] = useState(true);

  // notifications
  const [channels, setChannels] = useState<string[]>(["email", "in-app"]);
  const [events, setEvents] = useState<string[]>(["invoice-overdue", "payment-failed"]);
  const [digest, setDigest] = useState("weekly");
  const [productUpdates, setProductUpdates] = useState(false);

  // billing
  const [plan, setPlan] = useState("team");
  const [annual, setAnnual] = useState(false);

  // api
  const [scopes, setScopes] = useState<string[]>(["invoices-read", "invoices-write", "contacts-read"]);
  const [expiry, setExpiry] = useState<Date>(new Date(2027, 0, 31));
  const [rateLimit, setRateLimit] = useState(240);

  // team
  const [memberQuery, setMemberQuery] = useState("");
  const [roles, setRoles] = useState<Record<string, string>>(
    Object.fromEntries(TEAM.map((m) => [m.id, m.role])),
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // danger zone
  const [confirmDelete, setConfirmDelete] = useState(false);

  const emailError = email.trim().toLowerCase().endsWith(`@${WORKSPACE_DOMAIN}`)
    ? undefined
    : `Sign-in requires a ${WORKSPACE_DOMAIN} address`;

  const currentPlan = PLANS.find((p) => p.value === plan) ?? PLANS[1];
  const nextInvoice = annual ? currentPlan.monthly * 10 : currentPlan.monthly;

  const toggleChannel = (value: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setChannels((prev) => (e.target.checked ? [...prev, value] : prev.filter((c) => c !== value)));

  const query = memberQuery.trim().toLowerCase();
  const members = TEAM.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(query));

  return (
    <PageColumn>
      <div className="pg-set-stack">
        {/* ── profile ─────────────────────────────────────────────────── */}
        <section className="pg-set-section">
          <SectionHeading title="Profile" />
          <Card>
            <div className="pg-set-grid">
              <FormField label="Full name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormField>

              <FormField label="Work email" error={emailError}>
                <Input
                  type="email"
                  invalid={emailError !== undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <FormField label="Job title">
                <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </FormField>

              <FormField label="Time zone">
                <Select
                  options={TIMEZONES}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </FormField>

              <FormField label="Account ID" className="pg-set-span">
                <Input disabled value="acct_8f3ad02c9b41" />
              </FormField>

              <FormField label="About" className="pg-set-span">
                <Textarea minRows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </FormField>
            </div>

            <Divider className="pg-set-rule" />

            <div className="pg-set-actions">
              <Button variant="tertiary">Discard</Button>
              <Button variant="primary" disabled={emailError !== undefined}>
                Save changes
              </Button>
            </div>
          </Card>
        </section>

        {/* ── preferences ─────────────────────────────────────────────── */}
        <section className="pg-set-section">
          <SectionHeading title="Preferences" />
          <Card>
            <div className="pg-set-grid">
              <FormField label="Appearance">
                <SegmentedControl
                  options={["System", "Light", "Dark"].map((label) => ({
                    value: label.toLowerCase(),
                    label,
                  }))}
                  value={theme}
                  onChange={setTheme}
                />
              </FormField>

              <FormField label="Date format">
                <Select
                  options={DATE_FORMATS}
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                />
              </FormField>

              <FormField label="Weeks start on">
                <RadioGroup
                  orientation="horizontal"
                  options={[
                    { value: "mon", label: "Monday" },
                    { value: "sun", label: "Sunday" },
                  ]}
                  value={weekStart}
                  onChange={setWeekStart}
                />
              </FormField>

              <div className="pg-set-toggles">
                <Switch label="Compact rows" checked={compact} onChange={setCompact} />
                <Switch label="Show pence on totals" defaultChecked />
              </div>
            </div>
          </Card>
        </section>

        {/* ── notifications ───────────────────────────────────────────── */}
        <section className="pg-set-section">
          <SectionHeading title="Notifications" />
          <Card>
            <div className="pg-set-grid">
              <FormField label="Tell me about">
                <MultiSelect
                  options={EVENTS}
                  value={events}
                  onChange={setEvents}
                  placeholder="Nothing yet"
                  width="100%"
                />
              </FormField>

              <FormField label="Summary email">
                <SegmentedControl
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "off", label: "Off" },
                  ]}
                  value={digest}
                  onChange={setDigest}
                />
              </FormField>

              <FormField label="Send to" group className="pg-set-span">
                <div className="pg-set-checks">
                  <Checkbox
                    label="Email"
                    checked={channels.includes("email")}
                    onChange={toggleChannel("email")}
                  />
                  <Checkbox
                    label="In-app"
                    checked={channels.includes("in-app")}
                    onChange={toggleChannel("in-app")}
                  />
                  <Checkbox
                    label="Slack"
                    checked={channels.includes("slack")}
                    onChange={toggleChannel("slack")}
                  />
                  <Checkbox label="SMS" disabled />
                </div>
              </FormField>
            </div>

            <Divider className="pg-set-rule" />

            <div className="pg-set-toggles">
              <Switch
                label="Product updates and release notes"
                checked={productUpdates}
                onChange={setProductUpdates}
              />
              <Switch label="Security and sign-in alerts" checked disabled />
            </div>
          </Card>
        </section>

        {/* ── plan and billing ────────────────────────────────────────── */}
        <section className="pg-set-section">
          <SectionHeading
            title="Plan and billing"
            actions={<Badge tone="neutral" variant="outline">Renews 12 September 2026</Badge>}
          />
          <Card>
            <div className="pg-set-billing">
              <RadioGroup
                aria-label="Plan"
                value={plan}
                onChange={setPlan}
                options={PLANS.map((p) => ({
                  value: p.value,
                  label: (
                    <span className="pg-set-plan">
                      {p.name}
                      <span className="pg-set-plan-price">
                        {GBP.format(p.monthly)} / month · {p.seats} seats
                      </span>
                    </span>
                  ),
                }))}
              />
              <KeyValue
                items={[
                  { label: "Billing period", value: annual ? "Annual" : "Monthly" },
                  { label: "Seats in use", value: `${TEAM.length} of ${currentPlan.seats}` },
                  { label: "Next invoice", value: GBP.format(nextInvoice) },
                  { label: "VAT number", value: "GB 412 8823 61" },
                ]}
              />
            </div>

            <Divider className="pg-set-rule" />

            <div className="pg-set-actions">
              <Checkbox
                className="pg-set-actions-lead"
                label="Bill annually — two months free"
                checked={annual}
                onChange={(e) => setAnnual(e.target.checked)}
              />
              <Button variant="tertiary">Download invoices</Button>
              <Button variant="primary">Update plan</Button>
            </div>
          </Card>
        </section>

        {/* ── api access ──────────────────────────────────────────────── */}
        <section className="pg-set-section">
          <SectionHeading title="API access" />
          <Card>
            <div className="pg-set-grid">
              {/* field + its copy button is a set, not one control */}
              <FormField label="Live secret key" group className="pg-set-span">
                <div className="pg-set-key">
                  <Input readOnly value="lk_live_9f2c4a71d0e83bb6" />
                  <IconButton
                    icon={Copy}
                    label="Copy key"
                    tooltip={
                      <span className="pg-set-tip">
                        Copy key <Kbd>⌘C</Kbd>
                      </span>
                    }
                  />
                </div>
              </FormField>

              <FormField label="Scopes">
                <MultiSelect
                  options={SCOPES}
                  value={scopes}
                  onChange={setScopes}
                  placeholder="No scopes"
                  width="100%"
                />
              </FormField>

              <FormField label="Key expires on">
                <DatePicker
                  value={expiry}
                  onChange={setExpiry}
                  min="2026-08-12"
                />
              </FormField>

              <FormField
                label={`Rate limit — ${rateLimit} requests a minute`}
                className="pg-set-span"
              >
                <Slider
                  min={60}
                  max={600}
                  step={60}
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                />
              </FormField>
            </div>
          </Card>
        </section>

        {/* ── team ────────────────────────────────────────────────────── */}
        <section className="pg-set-section">
          <SectionHeading
            title="Team"
            actions={
              <SearchField
                className="pg-set-member-search"
                aria-label="Filter members"
                placeholder="Filter members"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
              />
            }
          />
          <Card>
            {members.map((m) => (
              <div key={m.id} className="pg-set-member">
                <Avatar name={m.name} decorative />
                <span className="pg-set-member-id">
                  <span>{m.name}</span>
                  <span className="pg-set-muted">
                    {m.email} · {m.joined}
                  </span>
                </span>
                <Select
                  aria-label={`${m.name} role`}
                  className="pg-set-member-role"
                  options={ROLES}
                  value={roles[m.id]}
                  disabled={m.role === "owner"}
                  onChange={(e) => setRoles((prev) => ({ ...prev, [m.id]: e.target.value }))}
                />
              </div>
            ))}

            <Divider className="pg-set-rule" />

            <div className="pg-set-invite">
              <FormField label="Invite by email">
                <Input
                  type="email"
                  placeholder={`name@${WORKSPACE_DOMAIN}`}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </FormField>
              <FormField label="Role">
                <Select
                  options={ROLES.filter((r) => r.value !== "owner")}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                />
              </FormField>
              <Button disabled={inviteEmail.trim() === ""}>Send invite</Button>
            </div>
          </Card>
        </section>

        {/* ── danger zone ─────────────────────────────────────────────── */}
        <section className="pg-set-section">
          <SectionHeading title="Danger zone" />
          <Card>
            <div className="pg-set-danger">
              <Checkbox
                label="Delete Harbourside Studio, its 214 invoices and every API key"
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
              />
              <Button variant="danger" disabled={!confirmDelete}>
                Delete workspace
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </PageColumn>
  );
}
