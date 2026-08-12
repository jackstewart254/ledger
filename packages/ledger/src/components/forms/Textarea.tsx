"use client";

import type { ComponentProps, CSSProperties } from "react";
import { cx } from "../../internal/cx.js";

export interface TextareaProps extends Omit<ComponentProps<"textarea">, "rows" | "ref"> {
  invalid?: boolean;
  /** Minimum height in --row-h multiples (not native rows). */
  minRows?: number;
}

/**
 * Textarea — the Input voice, auto min-height via --row-h multiples.
 * Single size on purpose — the kit ships one control size, no `size` prop.
 */
export function Textarea({
  invalid = false,
  minRows = 2,
  className,
  style,
  disabled,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      className={cx(
        "lg-textarea",
        "lg-control",
        invalid && "lg-control--invalid",
        disabled && "lg-control--disabled",
        className,
      )}
      style={{ "--lg-rows": minRows, ...style } as CSSProperties}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
