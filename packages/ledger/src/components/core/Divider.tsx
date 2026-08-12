import type { HTMLAttributes } from "react";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ orientation = "horizontal", className, ...rest }: DividerProps) {
  const classes = ["lg-divider", `lg-divider--${orientation}`, className].filter(Boolean).join(" ");
  return <div role="separator" aria-orientation={orientation} className={classes} {...rest} />;
}
