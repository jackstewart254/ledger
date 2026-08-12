"use client";

import type { CSSProperties, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { Icon, type LucideIcon } from "../core/Icon.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * InlineAlert — semantic subtle-bg row with a tone icon. Accent reads as ink
 * (monochrome accent); color appears only for success/warning/danger.
 */

export type InlineAlertTone = "accent" | "neutral" | "success" | "warning" | "danger";

const TONE_CLASS: Record<InlineAlertTone, string> = {
  accent: "accent",
  neutral: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
};

const TONE_ICON: Record<InlineAlertTone, LucideIcon> = {
  accent: Info,
  neutral: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

export interface InlineAlertProps {
  tone?: InlineAlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /** Trailing action slot. */
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function InlineAlert({
  tone = "accent",
  title,
  children,
  action,
  onClose,
  className,
  style,
}: InlineAlertProps) {
  return (
    <div role="alert" className={cx("lg-alert", `lg-alert--${TONE_CLASS[tone]}`, className)} style={style}>
      <span className="lg-alert-icon">
        <Icon as={TONE_ICON[tone]} size={16} />
      </span>
      <div className="lg-alert-body">
        {title && <div className="lg-alert-title">{title}</div>}
        {children && <div className={cx("lg-alert-text", !title && "lg-alert-text--solo")}>{children}</div>}
      </div>
      {action}
      {onClose && (
        <button type="button" aria-label="Dismiss" className="lg-alert-close" onClick={onClose}>
          <Icon as={X} size={14} />
        </button>
      )}
    </div>
  );
}
