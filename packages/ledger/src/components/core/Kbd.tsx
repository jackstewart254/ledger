import type { HTMLAttributes } from "react";

export type KbdProps = HTMLAttributes<HTMLElement>;

/**
 * Kbd — one key cap: hairline box, mono, tabular figures, and a min-width equal
 * to its height so "K" and "⌘" are the same square.
 *
 * The sanctioned use is a shortcut inside a tooltip on the control it belongs
 * to. Printed down the right-hand side of a menu it is the interface narrating
 * itself, which is the same reason the kit has no hint microcopy.
 */
export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd className={className ? `lg-kbd ${className}` : "lg-kbd"} {...rest}>
      {children}
    </kbd>
  );
}
