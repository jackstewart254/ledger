import type { CSSProperties, ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Icon, type LucideIcon } from "../core/Icon.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * EmptyState — a muted glyph, one line, and an action if there is one to take.
 *
 * No description slot on purpose. A paragraph of explanation is hint microcopy
 * (the kit bans it elsewhere for the same reason) and it lands where the reader
 * is least interested: a panel with nothing in it. Whatever the paragraph said
 * belongs in the title if it matters, or a tooltip on the panel's own control
 * if it doesn't.
 */
export function EmptyState({
  icon = Inbox,
  title,
  action,
  compact = false,
  className,
  style,
}: EmptyStateProps) {
  return (
    <div className={cx("lg-empty", compact && "lg-empty--compact", className)} style={style}>
      <span className="lg-empty-icon">
        <Icon as={icon} />
      </span>
      <div className="lg-empty-title">{title}</div>
      {action && <div className="lg-empty-action">{action}</div>}
    </div>
  );
}
