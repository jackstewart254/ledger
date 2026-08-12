import type { CSSProperties, ReactNode } from "react";

export interface AppShellProps {
  /** Left icon-rail slot — fixed 56px column (--row-h-comfy). */
  rail?: ReactNode;
  /** Header slot — 52px bar across the content column. */
  header?: ReactNode;
  /** Scrollable main content. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * AppShell — the dashboard chrome: a bare rail on the page background and the
 * content in a rounded pane floating beside it. Header and main share that one
 * pane rather than each owning a panel with its own fill and divider.
 * Defaults to viewport height; size the root (className/style) to frame it.
 */
export function AppShell({ rail, header, children, className, style }: AppShellProps) {
  const cls = ["lg-app-shell", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      <aside className="lg-app-shell-rail">{rail}</aside>
      <div className="lg-app-shell-pane">
        <header className="lg-app-shell-header">{header}</header>
        <main className="lg-app-shell-main">{children}</main>
      </div>
    </div>
  );
}
