import type { CSSProperties, ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Icon, type LucideIcon } from "../core/Icon.js";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * EmptyState — icon tile + semibold title + muted body inside a quiet solid
 * border. Centered; optional action slot.
 */

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function EmptyState({
  icon = Inbox,
  title,
  description,
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
      {description && <div className="lg-empty-desc">{description}</div>}
      {action && <div className="lg-empty-action">{action}</div>}
    </div>
  );
}
