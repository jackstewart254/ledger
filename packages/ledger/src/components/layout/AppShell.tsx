import type { CSSProperties, ReactNode } from "react";

export interface AppShellProps {
  /** Left icon-rail slot — fixed --rail-w column (56px), matching Rail's width. */
  rail?: ReactNode;
  /** Header left slot — identity and location: breadcrumb, page context. */
  header?: ReactNode;
  /** Header centre slot — search, always, optionally flanked by the controls
   *  that act on what it searches. Centred on the pane, not on whatever the
   *  left and right slots happen to weigh. */
  search?: ReactNode;
  /** Header right slot — actions and view switches. */
  actions?: ReactNode;
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
 *
 * The header is three fixed slots, not a free-form flex row: search sits dead
 * centre in every app that uses the shell, so its position is the shell's
 * decision and not something each page re-derives with margin tricks.
 */
export function AppShell({
  rail,
  header,
  search,
  actions,
  children,
  className,
  style,
}: AppShellProps) {
  const cls = ["lg-app-shell", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      <aside className="lg-app-shell-rail">{rail}</aside>
      <div className="lg-app-shell-pane">
        {/* No slot filled — no bar, and no divider hanging across the pane. */}
        {(header || search || actions) && (
          <header className="lg-app-shell-header">
            <div className="lg-app-shell-header__lead">{header}</div>
            <div className="lg-app-shell-header__search">{search}</div>
            <div className="lg-app-shell-header__actions">{actions}</div>
          </header>
        )}
        <main className="lg-app-shell-main">{children}</main>
      </div>
    </div>
  );
}
