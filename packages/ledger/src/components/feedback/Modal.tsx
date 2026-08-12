"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Icon } from "../core/Icon.js";
import { useFocusTrap } from "../../utils/focusTrap.js";
import { lockBodyScroll, unlockBodyScroll } from "../../utils/scrollLock.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Modal — centered dialog on the scrim. Surface-raised panel, hairline border,
 * the sanctioned shadow. Focus trapped, body scroll locked, Escape and
 * overlay-click close. Title + footer slots.
 */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Right-aligned action slot under a hairline. */
  footer?: ReactNode;
  /** Panel width in px (dynamic — passed as a custom property). */
  width?: number;
  className?: string;
  style?: CSSProperties;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 480,
  className,
  style,
}: ModalProps) {
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
            {title && <h2 className="lg-modal-title">{title}</h2>}
            {description && <p className="lg-modal-desc">{description}</p>}
          </div>
          <button type="button" aria-label="Close" className="lg-modal-close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>
        {children && <div className="lg-modal-body">{children}</div>}
        {footer && <div className="lg-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
