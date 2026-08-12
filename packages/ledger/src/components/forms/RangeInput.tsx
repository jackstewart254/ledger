"use client";

import type { ComponentProps, CSSProperties } from "react";
import { cx } from "../../internal/cx.js";

export interface RangeInputProps
  extends Omit<ComponentProps<"input">, "type" | "size" | "ref"> {
  /** Frame height, matching the other fields. */
  size?: "sm" | "md" | "lg";
  /** Class + style land on the frame, not the bare input. */
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}

/**
 * RangeInput — a native range inside the shared `.lg-control` frame, so a
 * slider sits in a row of inputs as a field rather than a naked line with a
 * dot on it.
 */
export function RangeInput({
  size = "md",
  disabled,
  className,
  wrapperClassName,
  wrapperStyle,
  ...rest
}: RangeInputProps) {
  return (
    <div
      className={cx(
        "lg-range-field",
        "lg-control",
        `lg-control--${size}`,
        disabled && "lg-control--disabled",
        wrapperClassName,
      )}
      style={wrapperStyle}
    >
      <input
        type="range"
        disabled={disabled}
        className={cx("lg-range", className)}
        {...rest}
      />
    </div>
  );
}
