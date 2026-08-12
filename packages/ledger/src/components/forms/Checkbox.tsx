"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "size" | "ref"> {
  label?: ReactNode;
  indeterminate?: boolean;
}

/**
 * Checkbox — styled native input, custom-drawn box, inline check/minus path.
 * Controlled or uncontrolled via the native props.
 */
export function Checkbox({ label, indeterminate = false, className, style, disabled, ...rest }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cx("lg-checkbox", disabled && "lg-checkbox--disabled", className)}
      style={style}
    >
      <span className="lg-checkbox__box">
        <input ref={inputRef} type="checkbox" className="lg-checkbox__input" disabled={disabled} {...rest} />
        <svg
          className="lg-checkbox__mark"
          viewBox="0 0 12 12"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {indeterminate ? <path d="M2.5 6h7" /> : <path d="M2.5 6.5 5 8.8l4.5-5.4" />}
        </svg>
      </span>
      {label != null && <span className="lg-checkbox__label">{label}</span>}
    </label>
  );
}
