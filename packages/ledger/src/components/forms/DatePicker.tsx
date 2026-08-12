"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "../core/Icon.js";
import { IconButton } from "../core/IconButton.js";
import { cx } from "../../internal/cx.js";
import { isSameDay, monthGrid, startOfDay, weekdayIndex } from "../../internal/month-grid.js";
import { formatDate } from "../../utils/format.js";

export interface DatePickerProps
  extends Omit<ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "ref"> {
  /** Controlled selection. Date, or an ISO `YYYY-MM-DD` string. */
  value?: Date | string;
  defaultValue?: Date | string;
  onChange?: (date: Date) => void;
  /** Selectable range — days outside it render disabled. */
  min?: Date | string;
  max?: Date | string;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}

// Monday-first (UK). Initials only — each day button carries the full date as
// its accessible name.
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const cellKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// 31 Jan + 1 month is 28/29 Feb, not 3 March — clamp to the target's last day.
const addMonths = (d: Date, n: number) => {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last));
};

const toDate = (v: Date | string | undefined): Date | undefined => {
  if (v == null) return undefined;
  const iso = typeof v === "string" ? ISO_DATE.exec(v) : null;
  // "2026-08-12" is UTC midnight to Date — a date-only string means a local day
  const d = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : v instanceof Date
      ? v
      : new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : startOfDay(d);
};

/**
 * DatePicker — .lg-control trigger + an anchored month grid. Replaces the
 * native <input type="date">, whose popup is the browser's own chrome and
 * cannot be styled. Arrows move by day, PageUp/PageDown by month, Home/End to
 * the week's ends, Enter/Space selects (native button activation); Escape or
 * an outside click closes. Controlled or uncontrolled.
 */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  min,
  max,
  placeholder = "Select date",
  className,
  style,
  disabled,
  onClick,
  ...rest
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<Date | undefined>(() => toDate(defaultValue));
  const controlled = value !== undefined;
  const selected = controlled ? toDate(value) : internal;
  // the focused day IS the view: the header month is whatever month it sits in
  const [focused, setFocused] = useState<Date>(
    () => toDate(value ?? defaultValue) ?? startOfDay(new Date()),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // roving tabindex only chases focus for keyboard moves — a mouse click on the
  // month chevrons must leave focus on the chevron
  const rovingRef = useRef(false);

  const lower = toDate(min);
  const upper = toDate(max);
  const blocked = (d: Date) => (lower !== undefined && d < lower) || (upper !== undefined && d > upper);

  const close = (refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // claim the Escape: an enclosing Modal/Drawer must not close too
      e.preventDefault();
      e.stopPropagation();
      close(true);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* move DOM focus onto the day the roving tabindex just landed on */
  useEffect(() => {
    if (!open || !rovingRef.current) return;
    rovingRef.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${cellKey(focused)}"]`)?.focus();
  }, [open, focused]);

  const move = (d: Date) => {
    rovingRef.current = true;
    setFocused(d);
  };

  const pick = (d: Date) => {
    if (blocked(d)) return;
    if (!controlled) setInternal(d);
    setFocused(d);
    onChange?.(d);
    close(true);
  };

  const onGridKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const next =
      e.key === "ArrowLeft"
        ? addDays(focused, -1)
        : e.key === "ArrowRight"
          ? addDays(focused, 1)
          : e.key === "ArrowUp"
            ? addDays(focused, -7)
            : e.key === "ArrowDown"
              ? addDays(focused, 7)
              : e.key === "PageUp"
                ? addMonths(focused, -1)
                : e.key === "PageDown"
                  ? addMonths(focused, 1)
                  : e.key === "Home"
                    ? addDays(focused, -weekdayIndex(focused))
                    : e.key === "End"
                      ? addDays(focused, 6 - weekdayIndex(focused))
                      : undefined;
    if (!next) return;
    e.preventDefault();
    move(next);
  };

  const today = startOfDay(new Date());
  const cells = monthGrid(focused.getFullYear(), focused.getMonth());
  const monthLabel = MONTH_LABEL.format(focused);

  return (
    <div ref={rootRef} className={cx("lg-dp", className)} style={style}>
      <button
        {...rest}
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        className={cx("lg-dp__trigger", "lg-control", disabled && "lg-control--disabled")}
        onClick={(e) => {
          onClick?.(e);
          if (open) return close();
          setFocused(selected ?? today);
          rovingRef.current = true;
          setOpen(true);
        }}
      >
        <span className={cx("lg-dp__value", !selected && "lg-dp__value--placeholder")}>
          {selected ? formatDate(selected) : placeholder}
        </span>
        <Icon as={Calendar} size={15} className="lg-control__icon" />
      </button>

      {open && (
        <div className="lg-dp__pop" role="dialog" aria-label="Choose date">
          <div className="lg-dp__head">
            <IconButton
              icon={ChevronLeft}
              label="Previous month"
              onClick={() => setFocused(addMonths(focused, -1))}
            />
            {/* the only thing that changes on navigation — announce it */}
            <span className="lg-dp__month" aria-live="polite">
              {monthLabel}
            </span>
            <IconButton
              icon={ChevronRight}
              label="Next month"
              onClick={() => setFocused(addMonths(focused, 1))}
            />
          </div>

          <div className="lg-dp__row" aria-hidden>
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="lg-dp__weekday">
                {d}
              </span>
            ))}
          </div>

          <div ref={gridRef} role="grid" aria-label={monthLabel} onKeyDown={onGridKeyDown}>
            {Array.from({ length: cells.length / 7 }, (_, r) => (
              <div key={r} role="row" className="lg-dp__row">
                {cells.slice(r * 7, r * 7 + 7).map((cell, i) => {
                  /* Blank slot — this month doesn't start on a Monday, or ends
                     mid-week. The neighbouring months are not rendered. */
                  if (!cell) return <span key={`blank-${i}`} className="lg-dp__day--blank" />;
                  const { date, inMonth } = cell;
                  const isSelected = selected !== undefined && isSameDay(date, selected);
                  const isToday = isSameDay(date, today);
                  const off = blocked(date);
                  return (
                    <button
                      key={cellKey(date)}
                      type="button"
                      role="gridcell"
                      data-date={cellKey(date)}
                      /* aria-disabled, not disabled: an out-of-range day still
                         has to take roving focus or arrowing over it dead-ends */
                      aria-disabled={off || undefined}
                      aria-selected={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={formatDate(date)}
                      tabIndex={isSameDay(date, focused) ? 0 : -1}
                      className={cx(
                        "lg-dp__day",
                        !inMonth && "lg-dp__day--muted",
                        isToday && "lg-dp__day--today",
                        isSelected && "lg-dp__day--selected",
                        off && "lg-dp__day--blocked",
                      )}
                      onClick={() => pick(date)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
