"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Icon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";
import { useFocusTrap } from "../../utils/focusTrap.js";
import { lockBodyScroll, unlockBodyScroll } from "../../utils/scrollLock.js";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Muted one-liner under the title. */
  subtitle?: ReactNode;
  /** Head controls, on the title's baseline, left of the close button. */
  actions?: ReactNode;
  children?: ReactNode;
  /** Right-aligned action slot under a hairline. */
  footer?: ReactNode;
  /** Panel width in px (dynamic — passed as a custom property). */
  width?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Modal — centered dialog on the scrim. Surface-raised panel, hairline border,
 * the sanctioned shadow. Focus trapped, body scroll locked, Escape and
 * overlay-click close. Title + footer slots. Portaled to <body> so a
 * transformed or filtered ancestor can never re-base its fixed positioning.
 *
 * The modal owns the header. A body rendered inside `children` renders none of
 * its own — the head already names the subject one hairline away, and a second
 * title under the first reads as two different things. A body that is also a
 * route uses `PageHeader` under the route and omits it here.
 *
 * `title` / `subtitle` / `actions` mirror `PageHeader`'s slots, including its
 * convention: markers (a Badge, a StatusPill) belong inside `title`, not in
 * `actions` — an 18px pill in a row of 36px controls steps the row.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  actions,
  children,
  footer,
  width = 480,
  className,
  style,
}: ModalProps) {
  /* document.body only exists after mount — render nothing on the server */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = open && mounted;

  const id = useId();
  const titleId = `${id}-title`;
  const subtitleId = `${id}-subtitle`;
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
      aria-describedby={subtitle == null ? undefined : subtitleId}
      ref={trapRef}
      className="lg-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cx("lg-modal-panel", className)}
        style={{ "--lg-modal-w": `${width}px`, ...style } as CSSProperties}
      >
        <div className="lg-modal-head">
          <div className="lg-modal-heading">
            {title != null && (
              <h2 id={titleId} className="lg-modal-title">
                {title}
              </h2>
            )}
            {subtitle != null && (
              <p id={subtitleId} className="lg-modal-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          {actions != null && <div className="lg-modal-actions">{actions}</div>}
          <button type="button" aria-label="Close" className="lg-modal-close" onClick={onClose}>
            <Icon as={X} />
          </button>
        </div>
        {children && <div className="lg-modal-body">{children}</div>}
        {footer && <div className="lg-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
