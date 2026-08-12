"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "../core/Icon.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Toast — transient notification for the bottom-right stack. Semantic variant
 * colors the leading icon only; auto-dismisses via `duration` when `onClose`
 * is provided. Render inside a ToastViewport.
 */

export type ToastVariant = "neutral" | "success" | "danger";

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  neutral: "info",
  success: "check-circle",
  danger: "alert-circle",
};

export interface ToastProps {
  variant?: ToastVariant;
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
  variant = "neutral",
  title,
  description,
  action,
  onClose,
  duration = 5000,
  className,
  style,
}: ToastProps) {
  useEffect(() => {
    if (!onClose || duration === 0) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div role="status" className={cx("lg-toast", `lg-toast--${variant}`, className)} style={style}>
      <span className="lg-toast-icon">
        <Icon name={VARIANT_ICON[variant]} size={16} />
      </span>
      <div className="lg-toast-body">
        <div className="lg-toast-title">{title}</div>
        {description && <div className="lg-toast-desc">{description}</div>}
        {action && <div className="lg-toast-action">{action}</div>}
      </div>
      {onClose && (
        <button type="button" aria-label="Dismiss" className="lg-toast-close" onClick={onClose}>
          <Icon name="x" size={14} />
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

/** Fixed bottom-right stack for toasts — outranks every interactive layer. */
export function ToastViewport({ children, className, style }: ToastViewportProps) {
  return (
    <div className={cx("lg-toast-viewport", className)} style={style}>
      {children}
    </div>
  );
}
