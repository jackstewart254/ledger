"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "../core/Icon.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * InlineAlert — semantic subtle-bg row with a tone icon. Info reads as ink
 * (monochrome accent); color appears only for success/warning/danger.
 */

export type InlineAlertTone = "info" | "neutral" | "success" | "warning" | "danger";

const TONE_ICON: Record<InlineAlertTone, IconName> = {
  info: "info",
  neutral: "info",
  success: "check-circle",
  warning: "alert-triangle",
  danger: "alert-circle",
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
  tone = "info",
  title,
  children,
  action,
  onClose,
  className,
  style,
}: InlineAlertProps) {
  return (
    <div role="alert" className={cx("lg-alert", `lg-alert--${tone}`, className)} style={style}>
      <span className="lg-alert-icon">
        <Icon name={TONE_ICON[tone]} size={16} />
      </span>
      <div className="lg-alert-body">
        {title && <div className="lg-alert-title">{title}</div>}
        {children && <div className={cx("lg-alert-text", !title && "lg-alert-text--solo")}>{children}</div>}
      </div>
      {action}
      {onClose && (
        <button type="button" aria-label="Dismiss" className="lg-alert-close" onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
