import type { CSSProperties } from "react";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

export type SkeletonShape = "text" | "rect" | "circle";

export interface SkeletonProps {
  shape?: SkeletonShape;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

const dim = (v: number | string | undefined) => (typeof v === "number" ? `${v}px` : v);

/**
 * Skeleton — shimmer loading placeholder. Shapes: text (one line), rect
 * (block), circle. Size overrides are dynamic values, fed as custom
 * properties.
 */
export function Skeleton({ shape = "text", width, height, className, style }: SkeletonProps) {
  const vars: Record<string, string | undefined> = {
    "--lg-skeleton-w": dim(width),
    "--lg-skeleton-h": dim(height ?? (shape === "circle" ? width : undefined)),
  };
  return (
    <span
      aria-hidden="true"
      className={cx("lg-skeleton", `lg-skeleton--${shape}`, className)}
      style={{ ...vars, ...style } as CSSProperties}
    />
  );
}
