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
 * AppShell — the dashboard chrome: fixed 56px rail + 52px header + scrollable
 * main, as slots. Kills per-app Shell rebuilds. Defaults to viewport height;
 * size the root (className/style) to frame it smaller.
 */
export function AppShell({ rail, header, children, className, style }: AppShellProps) {
  const cls = ["lg-app-shell", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      <aside className="lg-app-shell-rail">{rail}</aside>
      <header className="lg-app-shell-header">{header}</header>
      <main className="lg-app-shell-main">{children}</main>
    </div>
  );
}
