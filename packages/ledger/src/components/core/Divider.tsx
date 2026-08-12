import type { HTMLAttributes } from "react";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

/**
 * Divider — the kit's hairline as an element, since separation here is a 1px
 * border rather than a shadow. The vertical one takes its height from the row
 * it is in (`align-self: stretch`), so it needs a flex parent to have any.
 */
export function Divider({ orientation = "horizontal", className, ...rest }: DividerProps) {
  const classes = ["lg-divider", `lg-divider--${orientation}`, className].filter(Boolean).join(" ");
  return <div role="separator" aria-orientation={orientation} className={classes} {...rest} />;
}
