import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "../../internal/cx.js";

/**
 * Icon — the styling wrapper around a lucide-react glyph (ISC licensed, the
 * system's one sanctioned runtime dependency). Every icon in the kit renders
 * at the same default box, stroke and currentColor; consumers pass the
 * component, not a name string:
 *
 *   import { Search } from "lucide-react";
 *   <Icon as={Search} />
 */

export type { LucideIcon } from "lucide-react";

export interface IconProps {
  /** Any lucide-react icon component. */
  as: LucideIcon;
  /** Rendered box in px. Defaults to 16. */
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ as: As, size = 16, strokeWidth = 1.75, className, style }: IconProps) {
  return (
    <As
      className={cx("lg-icon", className)}
      size={size}
      strokeWidth={strokeWidth}
      style={style}
      aria-hidden
    />
  );
}
