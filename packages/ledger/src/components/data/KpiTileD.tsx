import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";

export type KpiToneD = "accent" | "success" | "warning" | "danger";

export interface KpiTileDProps {
  /** Glyph in the filled tone tile. */
  icon?: LucideIcon;
  /** Which tone the icon tile takes. Defaults to the accent. */
  tone?: KpiToneD;
  value: ReactNode;
  label: ReactNode;
  /** Footer row: a link out to the detail view. */
  actionLabel?: ReactNode;
  onAction?: () => void;
  href?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * KpiTileD — the "stat card" shape: a filled tone tile, the figure and its name
 * beside it, a hairline, and a row out to the detail.
 *
 * Note what this shape does NOT do: it carries no verdict. The icon's colour is
 * an identifier, not a claim — four cards in four hues say "these are four
 * different things", not "one of these is on fire". That is the trade against
 * the A/B/C tiles, which spend their colour on whether the number is
 * acceptable. Use this one where the figures are independent counters (visitors,
 * events, submissions) rather than metrics with a good and a bad direction.
 */
export function KpiTileD({
  icon,
  tone = "accent",
  value,
  label,
  actionLabel,
  onAction,
  href,
  className,
  style,
}: KpiTileDProps) {
  const showAction = actionLabel != null;
  return (
    <div className={cx("lg-kpi-d", `lg-kpi-d--${tone}`, className)} style={style}>
      <div className="lg-kpi-d-head">
        {icon && (
          <span className="lg-kpi-d-icon">
            <Icon as={icon} />
          </span>
        )}
        <div className="lg-kpi-d-figures">
          <div className="lg-kpi-d-value">{value}</div>
          <div className="lg-kpi-d-label">{label}</div>
        </div>
      </div>

      {showAction &&
        (href ? (
          <a className="lg-kpi-d-action" href={href}>
            {actionLabel}
            <Icon as={ArrowRight} className="lg-kpi-d-arrow" />
          </a>
        ) : (
          <button type="button" className="lg-kpi-d-action" onClick={onAction}>
            {actionLabel}
            <Icon as={ArrowRight} className="lg-kpi-d-arrow" />
          </button>
        ))}
    </div>
  );
}

export interface KpiPanelDProps {
  /** Panel title — the metric's name, at body size. */
  title: ReactNode;
  /** Top-right slot: a range picker, a menu, whatever scopes the figure. */
  control?: ReactNode;
  value: ReactNode;
  /** MetricDelta or similar, on the figure's line. */
  delta?: ReactNode;
  /** The chart itself — pass a TrendChart; the panel only frames it. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * KpiPanelD — the larger card from the same family: title and scope control on
 * one line, the figure and its change under it, the chart filling the rest.
 *
 * It frames rather than draws: the chart is whatever you pass, so the axis,
 * grid and gradient stay TrendChart's business and there is one chart
 * implementation in the kit, not two.
 */
export function KpiPanelD({
  title,
  control,
  value,
  delta,
  children,
  className,
  style,
}: KpiPanelDProps) {
  return (
    <div className={cx("lg-kpi-d-panel", className)} style={style}>
      <div className="lg-kpi-d-panel-head">
        <span className="lg-kpi-d-panel-title">{title}</span>
        {control}
      </div>
      <div className="lg-kpi-d-panel-figures">
        <span className="lg-kpi-d-panel-value">{value}</span>
        {delta}
      </div>
      {children && <div className="lg-kpi-d-panel-chart">{children}</div>}
    </div>
  );
}
