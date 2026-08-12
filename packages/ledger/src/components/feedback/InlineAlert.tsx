"use client";

import type { CSSProperties, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { IconButton } from "../core/IconButton.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * InlineAlert — semantic subtle-bg row with a tone icon. The `accent` tone
 * carries the house blue; `neutral` is the one that stays out of the way, and
 * green/yellow/red are reserved for success/warning/danger.
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
  /** The detail. Lives behind the info glyph, not on a second line. */
  children?: ReactNode;
  /** Trailing action slot. */
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * One line, always: tone glyph, the headline, an info glyph carrying the
 * detail, then whatever you can do about it.
 *
 * The detail used to sit under the headline as a second line of muted prose,
 * which made every alert a two-line block whose second line most readers skip —
 * and gave the alert a variable height that shoved the page around. The
 * headline says what happened; the paragraph explaining it is reference
 * material, so it goes where reference material goes.
 */
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
        <Icon as={TONE_ICON[tone]} />
      </span>
      <div className="lg-alert-title">{title ?? children}</div>
      {title != null && children != null && (
        <IconButton
          icon={Info}
          variant="bare"
          label="Details"
          tooltip={children}
          /* below, not above: an alert sits at the top of the thing it is about,
             so a tip above it points off the top of the pane */
          tooltipSide="bottom"
          className="lg-alert-info"
        />
      )}
      <div className="lg-alert-actions">
        {action}
        {onClose && (
          <button type="button" aria-label="Dismiss" className="lg-alert-close" onClick={onClose}>
            <Icon as={X} />
          </button>
        )}
      </div>
    </div>
  );
}
