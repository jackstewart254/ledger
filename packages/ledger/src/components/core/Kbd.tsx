import type { HTMLAttributes } from "react";

export type KbdProps = HTMLAttributes<HTMLElement>;

export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd className={className ? `lg-kbd ${className}` : "lg-kbd"} {...rest}>
      {children}
    </kbd>
  );
}
