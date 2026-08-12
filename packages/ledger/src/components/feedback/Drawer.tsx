"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Icon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";
import { useFocusTrap } from "../../utils/focusTrap.js";
import { lockBodyScroll, unlockBodyScroll } from "../../utils/scrollLock.js";

/**
 * Drawer — right-side sheet for filters/details. Slides in over the scrim,
 * focus trapped, scroll locked, Escape and overlay-click close. Header +
 * scrollable body + optional sticky footer. Portaled to <body> so a
 * transformed or filtered ancestor can never re-base its fixed positioning.
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
  /* document.body only exists after mount — render nothing on the server */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = open && mounted;

  const titleId = useId();
  const trapRef = useFocusTrap<HTMLDivElement>(active);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      /* an inner surface (menu, popover, palette) that handled Escape marks it
         handled — only the innermost open thing closes per keypress */
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [open]);

  if (!active) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title == null ? undefined : titleId}
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
          <h2 id={titleId} className="lg-drawer-title">
            {title}
          </h2>
          <button type="button" aria-label="Close" className="lg-drawer-close" onClick={onClose}>
            <Icon as={X} size={16} />
          </button>
        </div>
        <div className="lg-drawer-body">{children}</div>
        {footer && <div className="lg-drawer-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
