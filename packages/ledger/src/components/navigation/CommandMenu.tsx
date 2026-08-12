"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";
import { useFocusTrap } from "../../utils/focusTrap.js";
import { lockBodyScroll, unlockBodyScroll } from "../../utils/scrollLock.js";

/**
 * CommandMenu — the ⌘K palette. Scrim + centered panel, borderless search
 * input, filterable flat list with group labels. Arrow keys move selection,
 * Enter commits, Escape closes. Focus trapped; scroll locked. Controlled:
 * the consumer owns `open` and the item list. Portaled to <body> so a
 * transformed or filtered ancestor can never re-base its fixed positioning.
 */

export interface CommandMenuItem {
  id: string;
  label: string;
  group?: string;
  icon?: LucideIcon;
  /** Extra match terms beyond the label. */
  keywords?: string;
  onSelect?: () => void;
}

export interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
  items: CommandMenuItem[];
  className?: string;
  style?: CSSProperties;
}

export function CommandMenu({ open, onClose, items, className, style }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  /* document.body only exists after mount — render nothing on the server */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = open && mounted;
  const trapRef = useFocusTrap<HTMLDivElement>(active);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => (i.label + " " + (i.keywords ?? "")).toLowerCase().includes(q));
  }, [items, query]);

  /* reset per open and per query change */
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);
  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [open]);

  /* keep the active row in view while arrowing */
  useEffect(() => {
    if (!open) return;
    const id = optionId(filtered[activeIndex]?.id);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, filtered]);

  if (!active) return null;

  const commit = (item: CommandMenuItem | undefined) => {
    if (!item) return;
    item.onSelect?.();
    onClose();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      /* marked handled so a dialog behind the palette does not close with it */
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  let lastGroup: string | undefined;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
      ref={trapRef}
      className="lg-cmd"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cx("lg-cmd-panel", className)} style={style}>
        <input
          className="lg-cmd-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="lg-cmd-listbox"
          aria-activedescendant={optionId(filtered[activeIndex]?.id)}
          placeholder="Search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
        />
        <div className="lg-cmd-list" id="lg-cmd-listbox" role="listbox">
          {filtered.length === 0 && <div className="lg-cmd-empty">No results</div>}
          {filtered.map((item, i) => {
            const showGroup = item.group !== undefined && item.group !== lastGroup;
            lastGroup = item.group ?? lastGroup;
            return (
              <div key={item.id} role="presentation">
                {showGroup && <div className="lg-cmd-group">{item.group}</div>}
                <button
                  type="button"
                  id={optionId(item.id)}
                  role="option"
                  aria-selected={i === activeIndex}
                  tabIndex={-1}
                  className="lg-cmd-item"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => commit(item)}
                >
                  {item.icon && <Icon as={item.icon} />}
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* undefined, never "" — an empty aria-activedescendant is an invalid IDREF */
function optionId(id: string | undefined): string | undefined {
  return id === undefined ? undefined : `lg-cmd-opt-${id}`;
}
