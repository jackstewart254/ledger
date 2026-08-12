"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Icon, type IconName } from "../core/Icon.js";
import { useFocusTrap } from "../../utils/focusTrap.js";
import { lockBodyScroll, unlockBodyScroll } from "../../utils/scrollLock.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * CommandMenu — the ⌘K palette. Scrim + centered panel, borderless search
 * input, filterable flat list with group labels. Arrow keys move selection,
 * Enter commits, Escape closes. Focus trapped; scroll locked. Controlled:
 * the consumer owns `open` and the item list.
 */

export interface CommandMenuItem {
  id: string;
  label: string;
  group?: string;
  icon?: IconName;
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
  const trapRef = useFocusTrap<HTMLDivElement>(open);

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
    document.getElementById(optionId(filtered[activeIndex]?.id))?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, filtered]);

  if (!open) return null;

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
      e.preventDefault();
      onClose();
    }
  };

  let lastGroup: string | undefined;

  return (
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
              <div key={item.id}>
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
                  {item.icon && <Icon name={item.icon} size={15} />}
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function optionId(id: string | undefined): string {
  return id === undefined ? "" : `lg-cmd-opt-${id}`;
}
