import { useMemo, useState } from "react";
import {
  Bookmark,
  CalendarX,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  EmptyState,
  FilterChip,
  IconButton,
  Menu,
  PageColumn,
  Pagination,
  SearchField,
  SectionHeading,
  Select,
  Skeleton,
  StatusPill,
  Table,
  formatDate,
} from "@mcleanstewart/ledger";
import type {
  SelectOption,
  StatusPillStatus,
  TableColumn,
} from "@mcleanstewart/ledger";
import "./runs-page.css";

/* ── graduate applications ─────────────────────────────────────────────── */

type Stage = "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";

interface Application {
  id: string;
  role: string;
  employer: string;
  location: string;
  salary: string;
  stage: Stage;
  /** Closing date, ISO `YYYY-MM-DD`. */
  deadline: string;
  activity: string;
}

const STAGE: Record<Stage, { label: string; status: StatusPillStatus }> = {
  applied: { label: "Applied", status: "unknown" },
  screening: { label: "Screening", status: "watch" },
  interview: { label: "Interview", status: "watch" },
  offer: { label: "Offer", status: "good" },
  rejected: { label: "Rejected", status: "risk" },
  withdrawn: { label: "Withdrawn", status: "unknown" },
};

const STAGES: Stage[] = ["applied", "screening", "interview", "offer", "rejected", "withdrawn"];

/** Live applications — the only ones whose deadline is still worth reading. */
const OPEN: Stage[] = ["applied", "screening", "interview"];

const APPLICATIONS: Application[] = [
  {
    id: "monzo-swe",
    role: "Graduate Software Engineer",
    employer: "Monzo",
    location: "London",
    salary: "£52k–£58k",
    stage: "interview",
    deadline: "2026-09-04",
    activity: "2d ago",
  },
  {
    id: "deloitte-tech",
    role: "Technology Analyst, Graduate Programme",
    employer: "Deloitte",
    location: "Manchester",
    salary: "£32k–£35k",
    stage: "applied",
    deadline: "2026-08-13",
    activity: "6d ago",
  },
  {
    id: "ocado-ds",
    role: "Graduate Data Scientist",
    employer: "Ocado Technology",
    location: "Hatfield",
    salary: "£42k–£46k",
    stage: "screening",
    deadline: "2026-08-21",
    activity: "Yesterday",
  },
  {
    id: "arup-structures",
    role: "Graduate Engineer, Structures",
    employer: "Arup",
    location: "Bristol",
    salary: "£31k–£34k",
    stage: "applied",
    deadline: "2026-09-30",
    activity: "9d ago",
  },
  {
    id: "starling-swe",
    role: "Graduate Software Engineer",
    employer: "Starling Bank",
    location: "Cardiff",
    salary: "£48k",
    stage: "offer",
    deadline: "2026-08-28",
    activity: "4h ago",
  },
  {
    id: "bae-systems-eng",
    role: "Systems Engineer, Graduate Scheme",
    employer: "BAE Systems",
    location: "Preston",
    salary: "£34k",
    stage: "rejected",
    deadline: "2026-09-11",
    activity: "11d ago",
  },
  {
    id: "man-group-quant",
    role: "Quantitative Developer, Graduate",
    employer: "Man Group",
    location: "London",
    salary: "£65k–£70k",
    stage: "rejected",
    deadline: "2026-08-18",
    activity: "3w ago",
  },
  {
    id: "rolls-royce-digital",
    role: "Digital & Technology Graduate",
    employer: "Rolls-Royce",
    location: "Derby",
    salary: "£33k",
    stage: "applied",
    deadline: "2026-10-02",
    activity: "5d ago",
  },
  {
    id: "dyson-swe",
    role: "Graduate Software Engineer",
    employer: "Dyson",
    location: "Malmesbury",
    salary: "£36k",
    stage: "applied",
    deadline: "2026-08-17",
    activity: "8d ago",
  },
  {
    id: "fast-stream-digital",
    role: "Fast Stream, Digital & Data",
    employer: "Cabinet Office",
    location: "London",
    salary: "£30k–£33k",
    stage: "screening",
    deadline: "2026-09-25",
    activity: "3d ago",
  },
  {
    id: "sky-dev",
    role: "Graduate Software Developer",
    employer: "Sky",
    location: "Leeds",
    salary: "£35k",
    stage: "screening",
    deadline: "2026-09-18",
    activity: "4d ago",
  },
  {
    id: "graphcore-ml",
    role: "Graduate Machine Learning Engineer",
    employer: "Graphcore",
    location: "Bristol",
    salary: "£45k",
    stage: "interview",
    deadline: "2026-08-24",
    activity: "Yesterday",
  },
  {
    id: "kainos-swe",
    role: "Software Engineering Graduate",
    employer: "Kainos",
    location: "Belfast",
    salary: "£30k",
    stage: "rejected",
    deadline: "2026-08-14",
    activity: "2w ago",
  },
  {
    id: "schroders-risk",
    role: "Graduate Analyst, Investment Risk",
    employer: "Schroders",
    location: "London",
    salary: "£40k",
    stage: "interview",
    deadline: "2026-09-08",
    activity: "3d ago",
  },
  {
    id: "trainline-backend",
    role: "Junior Backend Engineer",
    employer: "Trainline",
    location: "London",
    salary: "£45k",
    stage: "screening",
    deadline: "2026-08-19",
    activity: "6d ago",
  },
  {
    id: "jlr-software",
    role: "Software Graduate Programme",
    employer: "Jaguar Land Rover",
    location: "Gaydon",
    salary: "£34k",
    stage: "applied",
    deadline: "2026-10-16",
    activity: "12d ago",
  },
  {
    id: "nhs-england-dev",
    role: "Graduate Software Developer",
    employer: "NHS England",
    location: "Leeds",
    salary: "£29k",
    stage: "applied",
    deadline: "2026-09-01",
    activity: "7d ago",
  },
  {
    id: "network-rail-eng",
    role: "Graduate Engineer, Signalling",
    employer: "Network Rail",
    location: "Milton Keynes",
    salary: "£30k",
    stage: "applied",
    deadline: "2026-10-09",
    activity: "10d ago",
  },
  {
    id: "darktrace-swe",
    role: "Graduate Software Engineer",
    employer: "Darktrace",
    location: "Cambridge",
    salary: "£42k",
    stage: "interview",
    deadline: "2026-08-26",
    activity: "5h ago",
  },
  {
    id: "pwc-tech",
    role: "Technology Graduate Programme",
    employer: "PwC",
    location: "Birmingham",
    salary: "£32k",
    stage: "rejected",
    deadline: "2026-09-14",
    activity: "3w ago",
  },
  {
    id: "wise-platform",
    role: "Graduate Platform Engineer",
    employer: "Wise",
    location: "London",
    salary: "£47k",
    stage: "withdrawn",
    deadline: "2026-08-31",
    activity: "16d ago",
  },
  {
    id: "met-office-research",
    role: "Graduate Research Engineer",
    employer: "Met Office",
    location: "Exeter",
    salary: "£31k",
    stage: "applied",
    deadline: "2026-10-23",
    activity: "13d ago",
  },
];

/* ── dates ─────────────────────────────────────────────────────────────── */

const DAY_MS = 86_400_000;

/** Local midnight from `YYYY-MM-DD` — `new Date(iso)` is UTC and drifts a day. */
const parseDay = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Fixed "today" so the demo data keeps its shape. */
const TODAY = parseDay("2026-08-12");

const daysUntil = (iso: string) => Math.round((parseDay(iso).getTime() - TODAY.getTime()) / DAY_MS);

const deadlineCell = (a: Application) => {
  if (!OPEN.includes(a.stage)) return <span className="pg-runs-dim">{formatDate(parseDay(a.deadline))}</span>;
  const days = daysUntil(a.deadline);
  if (days <= 0) return <Badge tone="danger">Closes today</Badge>;
  if (days === 1) return <Badge tone="danger">Closes tomorrow</Badge>;
  if (days <= 7) return <Badge tone="warning">{`${days} days left`}</Badge>;
  return <span className="pg-runs-muted">{formatDate(parseDay(a.deadline))}</span>;
};

/* ── page ──────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 8;

const LOCATIONS: SelectOption[] = [
  { value: "", label: "All locations" },
  ...Array.from(new Set(APPLICATIONS.map((a) => a.location)))
    .sort((a, b) => a.localeCompare(b))
    .map((l) => ({ value: l, label: l })),
];

const SKELETON_WIDTHS = ["58%", "72%", "44%", "63%", "51%", "68%", "47%", "60%"];

export default function RunsPage() {
  const [query, setQuery] = useState("");
  const [stages, setStages] = useState<Stage[]>([]);
  const [location, setLocation] = useState("");
  const [closingBy, setClosingBy] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = closingBy?.getTime();
    return APPLICATIONS.filter(
      (a) =>
        (q === "" || `${a.role} ${a.employer} ${a.location}`.toLowerCase().includes(q)) &&
        (stages.length === 0 || stages.includes(a.stage)) &&
        (location === "" || a.location === location) &&
        (cutoff === undefined || parseDay(a.deadline).getTime() <= cutoff),
    );
  }, [query, stages, location, closingBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  /* Clamped rather than reset by an effect: filtering down to fewer pages must
     not leave the table empty on a page that no longer exists. */
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const toggleStage = (stage: Stage) => (on: boolean) =>
    setStages((prev) => (on ? [...prev, stage] : prev.filter((s) => s !== stage)));

  const reset = () => {
    setQuery("");
    setStages([]);
    setLocation("");
    setClosingBy(undefined);
    setPage(1);
  };

  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1200);
  };

  const rowMenu = (a: Application) => [
    { label: "Open posting", icon: ExternalLink },
    { label: "Log an update", icon: Bookmark },
    { label: a.stage === "withdrawn" ? "Reinstate" : "Withdraw", icon: CalendarX },
    { label: "Delete application", icon: Trash2, danger: true },
  ];

  const columns: TableColumn<Application>[] = [
    {
      key: "role",
      header: "Role",
      render: (a) => (
        <span className="pg-runs-cell">
          <span>{a.role}</span>
          <span className="pg-runs-muted">{a.employer}</span>
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      width: "9rem",
      render: (a) => <span className="pg-runs-muted">{a.location}</span>,
    },
    { key: "salary", header: "Salary", width: "7.5rem", align: "right", numeric: true },
    {
      key: "stage",
      header: "Stage",
      width: "9.5rem",
      render: (a) => <StatusPill status={STAGE[a.stage].status} label={STAGE[a.stage].label} />,
    },
    {
      key: "deadline",
      header: "Closes",
      width: "10rem",
      align: "right",
      render: deadlineCell,
    },
    {
      key: "activity",
      header: "Last activity",
      width: "7.5rem",
      align: "right",
      render: (a) => <span className="pg-runs-muted">{a.activity}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      width: "4.5rem",
      align: "right",
      render: (a) => (
        <Menu
          align="end"
          trigger={<IconButton icon={MoreHorizontal} label={`${a.employer} actions`} />}
          items={rowMenu(a)}
        />
      ),
    },
  ];

  return (
    <PageColumn>
      <div className="pg-runs-stack">
        <SectionHeading
          title="Applications"
          actions={
            <>
              <span className="pg-runs-count">
                {filtered.length} of {APPLICATIONS.length}
              </span>
              <IconButton
                icon={RefreshCw}
                label="Refresh"
                tooltip="Last synced 09:12 — 3 boards"
                onClick={refresh}
              />
            </>
          }
        />

        <div className="pg-runs-toolbar">
          <SearchField
            className="pg-runs-search"
            placeholder="Search role, employer, city"
            aria-label="Search applications"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            options={LOCATIONS}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
          />
          <span className="pg-runs-date">
            <DatePicker
              value={closingBy}
              onChange={setClosingBy}
              min="2026-08-01"
              max="2026-12-31"
              placeholder="Closing on or before"
              aria-label="Closing on or before"
            />
            {closingBy !== undefined && (
              <IconButton
                icon={X}
                label="Clear closing date"
                variant="bare"
                onClick={() => setClosingBy(undefined)}
              />
            )}
          </span>
        </div>

        <div className="pg-runs-chips">
          {STAGES.map((stage) => (
            <FilterChip
              key={stage}
              count={APPLICATIONS.filter((a) => a.stage === stage).length}
              active={stages.includes(stage)}
              onChange={toggleStage(stage)}
            >
              {STAGE[stage].label}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <Card>
            <div className="pg-runs-skeleton">
              {SKELETON_WIDTHS.map((w) => (
                <div key={w} className="pg-runs-skeleton-row">
                  <Skeleton width={w} />
                  <Skeleton width="60%" />
                  <Skeleton width="45%" />
                  <Skeleton width="70%" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Table
            columns={columns}
            rows={rows}
            rowKey={(a) => a.id}
            empty={
              <EmptyState
                icon={SearchX}
                title="No applications match these filters"
                action={<Button onClick={reset}>Clear filters</Button>}
              />
            }
          />
        )}

        <div className="pg-runs-footer">
          <span className="pg-runs-muted">
            {filtered.length === 0
              ? "Nothing to show"
              : `Showing ${start + 1}–${start + rows.length} of ${filtered.length}`}
          </span>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>
    </PageColumn>
  );
}
