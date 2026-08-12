"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Icon } from "../core/Icon.js";
import { useFocusTrap } from "../../utils/focusTrap.js";
import { lockBodyScroll, unlockBodyScroll } from "../../utils/scrollLock.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Drawer — right-side sheet for filters/details. Slides in over the scrim,
 * focus trapped, scroll locked, Escape and overlay-click close. Header +
 * scrollable body + optional sticky footer.
 */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Panel width in px (dynamic — passed as a custom property). */
  width?: number;
  className?: string;
  style?: CSSProperties;
}

export function Drawer({ open, onClose, title, children, footer, width = 360, className, style }: DrawerProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      ref={trapRef}
      className="lg-drawer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cx("lg-drawer-panel", className)}
        style={{ "--lg-drawer-w": `${width}px`, ...style } as CSSProperties}
      >
        <div className="lg-drawer-head">
          <h2 className="lg-drawer-title">{title}</h2>
          <button type="button" aria-label="Close" className="lg-drawer-close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="lg-drawer-body">{children}</div>
        {footer && <div className="lg-drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}
