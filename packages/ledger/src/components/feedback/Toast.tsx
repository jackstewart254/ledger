"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { Icon, type LucideIcon } from "../core/Icon.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Toast — transient notification for the bottom-right stack. Semantic tone
 * colors the leading icon only; auto-dismisses via `duration` when `onClose`
 * is provided. Render inside a ToastViewport, which owns the live region.
 */

export type ToastTone = "neutral" | "success" | "danger";

const TONE_ICON: Record<ToastTone, LucideIcon> = {
  neutral: Info,
  success: CircleCheck,
  danger: CircleAlert,
};

export interface ToastProps {
  tone?: ToastTone;
  title: ReactNode;
  description?: ReactNode;
  /** Action slot (e.g. an undo button). */
  action?: ReactNode;
  onClose?: () => void;
  /** Auto-dismiss delay in ms; 0 disables. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function Toast({
  tone = "neutral",
  title,
  description,
  action,
  onClose,
  duration = 5000,
  className,
  style,
}: ToastProps) {
  /* held in a ref so an inline arrow `onClose` — the normal way to pass one —
     cannot restart the dismiss timer on every parent render */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!onCloseRef.current || duration === 0) return;
    const t = setTimeout(() => onCloseRef.current?.(), duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <div className={cx("lg-toast", `lg-toast--${tone}`, className)} style={style}>
      <span className="lg-toast-icon">
        <Icon as={TONE_ICON[tone]} />
      </span>
      <div className="lg-toast-body">
        <div className="lg-toast-title">{title}</div>
        {description && <div className="lg-toast-desc">{description}</div>}
        {action && <div className="lg-toast-action">{action}</div>}
      </div>
      {onClose && (
        <button type="button" aria-label="Dismiss" className="lg-toast-close" onClick={onClose}>
          <Icon as={X} />
        </button>
      )}
    </div>
  );
}

export interface ToastViewportProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Fixed bottom-right stack for toasts — outranks every interactive layer.
 * Carries the live region: it is mounted for the life of the page, so toasts
 * appearing inside it are announced. A region inserted together with its own
 * content routinely is not.
 */
export function ToastViewport({ children, className, style }: ToastViewportProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx("lg-toast-viewport", className)}
      style={style}
    >
      {children}
    </div>
  );
}
