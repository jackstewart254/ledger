"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Icon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

export interface MultiSelectProps
  extends Omit<ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "ref"> {
  options: MultiSelectOption[];
  /** Controlled selection. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (next: string[]) => void;
  placeholder?: string;
  /** Filter row inside the popover. Defaults to on from 8 options up — a short list doesn't earn one. */
  searchable?: boolean;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
}

// option count from which a filter row earns its place
const SEARCH_FROM = 8;

/**
 * MultiSelect — trigger with chip summary + checkbox popover list. Real
 * checkboxes in the popover keep it keyboard accessible (tab + space); Esc or
 * an outside click closes it. Controlled or uncontrolled.
 */
export function MultiSelect({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Any",
  searchable,
  width = 220,
  className,
  style,
  disabled,
  onClick,
  ...rest
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const controlled = value !== undefined;
  const selected = controlled ? value : internal;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const showSearch = searchable ?? options.length >= SEARCH_FROM;

  // query only ever lives with an open popover — closing resets it
  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;
    // no filter row to take focus — hand it to the first option instead of leaving it on the trigger
    if (!showSearch) listRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // claim the Escape: an enclosing Modal/Drawer must not close too
      e.preventDefault();
      e.stopPropagation();
      close();
      // focus sits in the filter input — put it back on the trigger, not <body>
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, showSearch]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
        : `${selected.length} selected`;

  return (
    <div
      ref={rootRef}
      className={cx("lg-ms", className)}
      style={{ "--lg-ms-w": typeof width === "number" ? `${width}px` : width, ...style } as CSSProperties}
    >
      <button
        {...rest}
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className={cx(
          "lg-ms__trigger",
          "lg-control",
          disabled && "lg-control--disabled",
          selected.length === 0 && "lg-ms__trigger--empty",
        )}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (open) close();
          else setOpen(true);
        }}
      >
        <span
          className={cx(
            "lg-ms__summary",
            selected.length === 0 && "lg-ms__summary--placeholder",
          )}
          title={summary}
        >
          {summary}
        </span>
        {selected.length > 0 && <span className="lg-ms__badge">{selected.length}</span>}
        <Icon as={ChevronDown} className="lg-control__icon" />
      </button>

      {open && (
        <div className="lg-ms__pop">
          {showSearch && (
            <div className="lg-ms__search">
              <Icon as={Search} className="lg-control__icon" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter…"
                className="lg-ms__search-input"
              />
            </div>
          )}
          <div ref={listRef} className="lg-ms__list">
            {filtered.length === 0 && <span className="lg-ms__empty">No matches</span>}
            {filtered.map((opt) => (
              <label
                key={opt.value}
                className={cx(
                  "lg-ms__option",
                  selected.includes(opt.value) && "lg-ms__option--selected",
                )}
              >
                {/* reuses the Checkbox box/mark classes — see checkbox.css */}
                <span className="lg-checkbox__box">
                  <input
                    type="checkbox"
                    className="lg-checkbox__input"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                  />
                  {/* strokeWidth 4 in Lucide's 24 viewBox = the 2px mark the 12px box wants */}
                  <Check className="lg-checkbox__mark" strokeWidth={4} aria-hidden />
                </span>
                <span className="lg-ms__option-label">{opt.label}</span>
                {opt.count != null && <span className="lg-ms__option-count">{opt.count}</span>}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
