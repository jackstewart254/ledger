import { useState, type MouseEvent } from "react";
import { CalendarClock, ClipboardCheck, Info, PhoneOutgoing, ShieldCheck, Wrench } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CountBadge,
  Divider,
  Drawer,
  EmptyState,
  IconButton,
  InlineAlert,
  KeyValue,
  Modal,
  PageColumn,
  SectionHeading,
  Skeleton,
  Spinner,
  StatusPill,
  Table,
  Toast,
  ToastViewport,
  Tooltip,
  formatDate,
} from "@mcleanstewart/ledger";
import type {
  StatusPillStatus,
  TableColumn,
  ToastTone,
} from "@mcleanstewart/ledger";
import "./alerts-page.css";

/* ── fake maintenance data ─────────────────────────────────────────────── */

type Priority = "emergency" | "urgent" | "routine";
type TicketState = "overdue" | "open" | "awaiting-parts" | "scheduled" | "resolved";

interface Ticket {
  id: string;
  property: string;
  summary: string;
  trade: string;
  priority: Priority;
  state: TicketState;
  raised: string;
  due: string;
  contractor: string;
  /** Trade contact — lives in a tooltip on the contractor cell. */
  contractorNote: string;
  /** The paragraph behind the alert's info glyph. */
  detail: string;
  tenant: string;
  sla: string;
  notes: number;
}

const PRIORITY: Record<Priority, { label: string; tone: "danger" | "warning" | "neutral" }> = {
  emergency: { label: "Emergency", tone: "danger" },
  urgent: { label: "Urgent", tone: "warning" },
  routine: { label: "Routine", tone: "neutral" },
};

const STATE: Record<TicketState, { label: string; status: StatusPillStatus }> = {
  overdue: { label: "Overdue", status: "risk" },
  open: { label: "Open", status: "watch" },
  "awaiting-parts": { label: "Awaiting parts", status: "watch" },
  scheduled: { label: "Scheduled", status: "good" },
  resolved: { label: "Resolved", status: "good" },
};

const TICKETS: Ticket[] = [
  {
    id: "LEE-4471",
    property: "14 Bramley Court, Leeds LS11",
    summary: "Boiler failure — no heating or hot water",
    trade: "Heating",
    priority: "emergency",
    state: "overdue",
    raised: "2026-08-09",
    due: "2026-08-10",
    contractor: "Halewood Heating",
    contractorNote: "Gas Safe 512338 · 0113 496 0022 · last on site 4 Jun 2026",
    detail:
      "Reported 09:40 on 9 August by the tenant. No heating and no hot water, two children under five in the property, temporary heaters delivered the same evening. Halewood have not accepted the job in nineteen hours.",
    tenant: "A. Okonkwo",
    sla: "24 hours (emergency)",
    notes: 7,
  },
  {
    id: "MAN-2210",
    property: "Flat 3, 62 Ardwick Green North, Manchester M12",
    summary: "Damp and black mould, second bedroom",
    trade: "Building fabric",
    priority: "urgent",
    state: "awaiting-parts",
    raised: "2026-08-04",
    due: "2026-08-18",
    contractor: "Northern Damp Solutions",
    contractorNote: "0161 205 7741 · surveyed 6 Aug · quote accepted 7 Aug",
    detail:
      "Survey found a failed extractor and a bridged cavity below the bedroom window. Room sealed and a dehumidifier left running. The replacement extractor unit is on back order into the Trafford depot, expected 17 August.",
    tenant: "R. Whittaker",
    sla: "14 days (Awaab's Law, category 2)",
    notes: 4,
  },
  {
    id: "SHF-0918",
    property: "7 Dobcroft Road, Sheffield S11",
    summary: "Gas safety certificate expires 18 August",
    trade: "Compliance",
    priority: "urgent",
    state: "scheduled",
    raised: "2026-08-01",
    due: "2026-08-18",
    contractor: "Peak Gas Services",
    contractorNote: "Gas Safe 604112 · 0114 288 3300 · booked 14 Aug, 08:00–12:00",
    detail:
      "The current CP12 was issued on 19 August 2025 and lapses in six days. Peak Gas are booked for the morning of 14 August; the tenant has confirmed access and holds a key safe code with the scheduling team.",
    tenant: "M. Iqbal",
    sla: "Certificate must not lapse",
    notes: 2,
  },
  {
    id: "BRD-1177",
    property: "Meadow House, 21 Toller Lane, Bradford BD8",
    summary: "Smoke alarm test overdue, floors 2 and 3",
    trade: "Fire safety",
    priority: "urgent",
    state: "open",
    raised: "2026-08-07",
    due: "2026-08-13",
    contractor: "Unassigned",
    contractorNote: "No contractor accepted · in-house facilities team notified 10 Aug",
    detail:
      "Monthly interlinked-alarm test missed on the two upper floors of a nine-bed supported scheme. The ground floor tested clear on 3 August. Fire risk assessment is due for review in October.",
    tenant: "Scheme (9 residents)",
    sla: "7 days (fire safety)",
    notes: 3,
  },
  {
    id: "YRK-0450",
    property: "88 Bishopthorpe Road, York YO23",
    summary: "Front door lock jammed, tenant locked out",
    trade: "Security",
    priority: "emergency",
    state: "scheduled",
    raised: "2026-08-11",
    due: "2026-08-12",
    contractor: "Ouse Locksmiths",
    contractorNote: "01904 611 208 · accepted 11 Aug, 22:14 · ETA today 13:00",
    detail:
      "Euro cylinder seized on the communal front door on the evening of 11 August. The tenant stayed with family overnight. Ouse Locksmiths accepted within twenty minutes and are replacing the cylinder today.",
    tenant: "D. Fairhurst",
    sla: "24 hours (emergency)",
    notes: 1,
  },
  {
    id: "HUD-3302",
    property: "5 Trinity Street, Huddersfield HD1",
    summary: "Communal stair lighting replaced",
    trade: "Electrical",
    priority: "routine",
    state: "resolved",
    raised: "2026-07-28",
    due: "2026-08-14",
    contractor: "Kirklees Electrical",
    contractorNote: "01484 770 190 · signed off 11:20 today",
    detail:
      "Two failed LED battens on the first-floor landing swapped and the emergency drop-test repeated. Certificate uploaded against the scheme's fixed-wire record.",
    tenant: "Scheme (6 residents)",
    sla: "28 days (routine)",
    notes: 2,
  },
];

interface ToastEntry {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Ticket to put back if the reader takes the undo. */
  undo?: string;
}

let toastSeq = 0;

/* ── page ──────────────────────────────────────────────────────────────── */

export default function AlertsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [resolved, setResolved] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [chasing, setChasing] = useState(false);

  const stateOf = (t: Ticket): TicketState => (resolved.includes(t.id) ? "resolved" : t.state);

  const rows = TICKETS.filter((t) => stateOf(t) !== "resolved");
  const overdue = rows.filter((t) => stateOf(t) === "overdue").length;
  const emergencies = rows.filter((t) => t.priority === "emergency").length;
  const closedToday = TICKETS.filter((t) => t.state === "resolved").length + resolved.length;

  const selected = TICKETS.find((t) => t.id === openId);
  const confirming = TICKETS.find((t) => t.id === confirmId);

  const push = (toast: Omit<ToastEntry, "id">) =>
    setToasts((prev) => [...prev, { ...toast, id: ++toastSeq }]);
  const dropToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const hide = (key: string) => setDismissed((prev) => [...prev, key]);
  const shown = (key: string) => !dismissed.includes(key);

  const chase = () => {
    setChasing(true);
    setTimeout(() => {
      setChasing(false);
      push({
        tone: "neutral",
        title: "Chased 3 contractors",
        description: "SMS and email sent to Halewood, Northern Damp and the Bradford facilities team.",
      });
    }, 900);
  };

  const confirmResolve = () => {
    if (!confirming) return;
    setResolved((prev) => [...prev, confirming.id]);
    setConfirmId(null);
    setOpenId(null);
    push({
      tone: "success",
      title: `${confirming.id} marked resolved`,
      description: `${confirming.property} — the tenant will be sent a satisfaction survey tonight.`,
      undo: confirming.id,
    });
  };

  const undo = (ticketId: string, toastId: number) => {
    setResolved((prev) => prev.filter((id) => id !== ticketId));
    dropToast(toastId);
  };

  /* Rows are clickable, so a control inside one has to eat the click. */
  const swallow = (e: MouseEvent<HTMLElement>) => e.stopPropagation();

  const columns: TableColumn<Ticket>[] = [
    {
      key: "summary",
      render: (t) => (
        <span className="pg-al-cell">
          <span className="pg-al-row">
            <Badge tone={PRIORITY[t.priority].tone} variant={t.priority === "routine" ? "outline" : "subtle"}>
              {PRIORITY[t.priority].label}
            </Badge>
            <span>{t.summary}</span>
          </span>
          <span className="pg-al-muted">
            {t.id} · {t.property} · {t.contractor}
          </span>
        </span>
      ),
      header: "Ticket",
    },
    /* Four columns, not seven: this table lives in a ~490px split column, and
       fixed layout has no minimum width — 43rem of columns in a 30rem box
       crushes every cell to an ellipsis instead of scrolling. Priority rides
       with the summary; contractor and notes are in the drawer already. */
    {
      key: "state",
      header: "Status",
      width: "8rem",
      render: (t) => <StatusPill status={STATE[stateOf(t)].status} label={STATE[stateOf(t)].label} />,
    },
    {
      key: "due",
      header: "Due",
      width: "8rem",
      align: "right",
      numeric: true,
      render: (t) => <span className="pg-al-muted">{formatDate(t.due)}</span>,
    },
    {
      key: "chase",
      header: "Actions",
      width: "4.5rem",
      align: "right",
      render: (t) => (
        <IconButton
          icon={PhoneOutgoing}
          label={`Chase ${t.contractor}`}
          onClick={(e) => {
            swallow(e);
            push({ tone: "neutral", title: `Chased ${t.contractor}`, description: `${t.id} · ${t.property}` });
          }}
        />
      ),
    },
  ];

  return (
    <>
      <PageColumn>
        <div className="pg-al-stack">
          <div className="pg-al-alerts">
            {shown("sla") && (
              <InlineAlert
                tone="danger"
                title="LEE-4471 is 19 hours past its emergency SLA"
                action={
                  <Button
                    variant="tertiary"
                    onClick={() =>
                      push({
                        tone: "danger",
                        title: "Escalated to the on-call manager",
                        description: "Paged S. Doherty · a standby engineer has been requested from Wolseley.",
                      })
                    }
                  >
                    Escalate
                  </Button>
                }
                onClose={() => hide("sla")}
              >
                {TICKETS[0].detail}
              </InlineAlert>
            )}

            {shown("cp12") && (
              <InlineAlert
                tone="warning"
                title="Gas safety certificate for 7 Dobcroft Road lapses in 6 days"
                action={
                  <Button variant="tertiary" onClick={() => setOpenId("SHF-0918")}>
                    View booking
                  </Button>
                }
                onClose={() => hide("cp12")}
              >
                {TICKETS[2].detail}
              </InlineAlert>
            )}

            {shown("closed") && (
              <InlineAlert
                tone="success"
                title={`${closedToday} tickets closed today across the portfolio`}
                onClose={() => hide("closed")}
              >
                Kirklees Electrical signed off the Huddersfield stair lighting at 11:20 and uploaded the
                fixed-wire certificate. Average time to close this week is 3.1 days against a 4-day target.
              </InlineAlert>
            )}

            {shown("sweep") && (
              <InlineAlert tone="accent" title="Compliance sweep last ran at 06:00" onClose={() => hide("sweep")}>
                The sweep reads every CP12, EICR and fire risk assessment across 214 properties and raises a
                ticket 30 days before expiry. Next run 13 August, 06:00.
              </InlineAlert>
            )}
          </div>

          <div className="pg-al-summary">
            <StatusPill status="risk" label="Overdue" value={overdue} />
            <StatusPill status="watch" label="Emergencies open" value={emergencies} />
            <StatusPill status="good" label="Closed today" value={closedToday} />
            <StatusPill status="unknown" label="Unassigned" value={1} />
          </div>

          <div className="pg-al-split">
            <div className="pg-al-col">
              <SectionHeading
                title="Open tickets"
                actions={
                  <>
                    {chasing && <Spinner label="Chasing contractors" />}
                    <CountBadge count={rows.length} />
                    <Button onClick={chase} disabled={chasing}>
                      Chase contractors
                    </Button>
                  </>
                }
              />
              <Table
                columns={columns}
                rows={rows}
                rowKey={(t) => t.id}
                onRowClick={(t) => setOpenId(t.id)}
                empty={<EmptyState compact icon={ClipboardCheck} title="Every ticket in the portfolio is closed" />}
              />
            </div>

            <div className="pg-al-col">
              <Card
                header={
                  <>
                    <span>Awaiting parts</span>
                    <IconButton
                      icon={Info}
                      variant="bare"
                      label="Parts held at the Trafford depot are released to the fitter on the morning of the appointment"
                    />
                  </>
                }
              >
                <div className="pg-al-parts">
                  <InlineAlert tone="neutral" title="Extractor unit on back order">
                    Ordered 7 August from Vent-Axia, expected into the Trafford depot on 17 August. The fit is
                    provisionally booked for 18 August, the last day of the 14-day window.
                  </InlineAlert>
                  <div className="pg-al-row">
                    <Spinner label="Tracking delivery" />
                    <span className="pg-al-muted">Tracking 3 orders with the merchant</span>
                  </div>
                </div>
              </Card>

              <Card
                header={
                  <>
                    <span>Certificate register</span>
                    <Badge tone="neutral" variant="outline">
                      Syncing
                    </Badge>
                  </>
                }
              >
                <div className="pg-al-loading">
                  {[72, 54, 63].map((w) => (
                    <div key={w} className="pg-al-loading-row">
                      <Skeleton width={`${w}%`} />
                      <Skeleton width="18%" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                header={
                  <>
                    <span>Out-of-hours callouts</span>
                    <Tooltip label="Since 18:00 yesterday">
                      <span className="pg-al-dim">Last night</span>
                    </Tooltip>
                  </>
                }
              >
                <EmptyState compact icon={ShieldCheck} title="No callouts overnight" />
              </Card>

              <Card header={<span>Unassigned</span>}>
                <EmptyState
                  compact
                  icon={Wrench}
                  title="BRD-1177 has no contractor"
                  action={
                    <Button
                      onClick={() =>
                        push({
                          tone: "neutral",
                          title: "Job put back out to tender",
                          description: "Offered to 4 fire-safety contractors on the Yorkshire framework.",
                        })
                      }
                    >
                      Offer to framework
                    </Button>
                  }
                />
              </Card>
            </div>
          </div>
        </div>
      </PageColumn>

      <Drawer
        open={selected !== undefined}
        onClose={() => setOpenId(null)}
        width={440}
        title={
          selected && (
            <span className="pg-al-row">
              {selected.id}
              <Badge tone={PRIORITY[selected.priority].tone}>{PRIORITY[selected.priority].label}</Badge>
            </span>
          )
        }
        footer={
          <>
            <Button variant="primary" onClick={() => selected && setConfirmId(selected.id)}>
              Mark resolved
            </Button>
            <Button onClick={() => push({ tone: "neutral", title: `Reassignment requested for ${selected?.id}` })}>
              Reassign
            </Button>
            <Button variant="tertiary" onClick={() => setOpenId(null)}>
              Close
            </Button>
          </>
        }
      >
        {selected && (
          <div className="pg-al-drawer">
            <div className="pg-al-row">
              <StatusPill status={STATE[stateOf(selected)].status} label={STATE[stateOf(selected)].label} />
              <Badge tone="neutral" variant="outline">
                {selected.trade}
              </Badge>
              <Tooltip label={selected.contractorNote}>
                <span className="pg-al-muted">{selected.contractor}</span>
              </Tooltip>
            </div>

            <InlineAlert
              tone={stateOf(selected) === "overdue" ? "danger" : "accent"}
              title={selected.summary}
              action={
                <IconButton
                  icon={CalendarClock}
                  variant="bare"
                  label={`Due ${formatDate(selected.due)}`}
                  tooltipSide="left"
                />
              }
            >
              {selected.detail}
            </InlineAlert>

            <Divider />

            <KeyValue
              items={[
                { label: "Property", value: selected.property },
                { label: "Tenant", value: selected.tenant },
                { label: "Trade", value: selected.trade },
                { label: "Raised", value: formatDate(selected.raised) },
                { label: "Due", value: formatDate(selected.due) },
                { label: "Target", value: selected.sla },
                { label: "Contractor", value: selected.contractor },
                { label: "Notes on file", value: selected.notes },
              ]}
            />
          </div>
        )}
      </Drawer>

      <Modal
        open={confirming !== undefined}
        onClose={() => setConfirmId(null)}
        width={460}
        title={confirming && `Mark ${confirming.id} resolved`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmResolve}>
              Mark resolved
            </Button>
          </>
        }
      >
        {confirming && (
          <div className="pg-al-drawer">
            <p className="pg-al-prose">
              Closing this ticket stops the SLA clock at {formatDate(confirming.due)}, notifies{" "}
              {confirming.tenant} and releases {confirming.contractor} to invoice. A closed ticket can only be
              reopened by a scheme manager.
            </p>
            {confirming.priority === "emergency" && (
              <InlineAlert tone="warning" title="This is an emergency job that breached its target">
                Emergency closures are sampled by the compliance team and a post-inspection is booked
                automatically within five working days. The breach stays on the property record either way.
              </InlineAlert>
            )}
          </div>
        )}
      </Modal>

      <ToastViewport>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            title={t.title}
            description={t.description}
            onClose={() => dropToast(t.id)}
            action={
              t.undo && (
                <Button variant="tertiary" onClick={() => t.undo && undo(t.undo, t.id)}>
                  Undo
                </Button>
              )
            }
          />
        ))}
      </ToastViewport>
    </>
  );
}
