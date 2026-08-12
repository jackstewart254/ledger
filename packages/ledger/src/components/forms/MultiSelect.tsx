"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { Icon } from "../core/Icon.js";
import { cx } from "./cx.js";

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

export interface MultiSelectProps extends Omit<ComponentProps<"button">, "value" | "onChange"> {
  options: MultiSelectOption[];
  /** Controlled selection. */
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Show the filter row inside the popover. */
  searchable?: boolean;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * MultiSelect — trigger with chip summary + checkbox popover list. Real
 * checkboxes in the popover keep it keyboard accessible (tab + space); Esc or
 * an outside click closes it. Controlled only.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Any",
  searchable = true,
  width = 220,
  className,
  style,
  disabled,
  ...rest
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const summary =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : `${value.length} selected`;

  return (
    <div
      ref={rootRef}
      className={cx("lg-ms", className)}
      style={{ "--lg-ms-w": typeof width === "number" ? `${width}px` : width, ...style } as CSSProperties}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className={cx(
          "lg-ms__trigger",
          "lg-control",
          "lg-control--md",
          disabled && "lg-control--disabled",
          value.length === 0 && "lg-ms__trigger--empty",
        )}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        {...rest}
      >
        <span className="lg-ms__summary" title={summary}>
          {summary}
        </span>
        {value.length > 0 && <span className="lg-ms__badge">{value.length}</span>}
        <Icon name="chevron-down" size={15} className="lg-control__icon" />
      </button>

      {open && (
        <div className="lg-ms__pop">
          {searchable && (
            <div className="lg-ms__search">
              <Icon name="search" size={14} className="lg-control__icon" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter…"
                className="lg-ms__search-input"
              />
            </div>
          )}
          <div className="lg-ms__list">
            {filtered.length === 0 && <span className="lg-ms__empty">No matches</span>}
            {filtered.map((opt) => (
              <label key={opt.value} className="lg-ms__option">
                {/* reuses the Checkbox box/mark classes — see checkbox.css */}
                <span className="lg-checkbox__box">
                  <input
                    type="checkbox"
                    className="lg-checkbox__input"
                    checked={value.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                  />
                  <svg
                    className="lg-checkbox__mark"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 6.5 5 8.8l4.5-5.4" />
                  </svg>
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
