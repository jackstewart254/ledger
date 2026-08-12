"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cx } from "../../internal/cx.js";

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type" | "size" | "ref"> {
  label?: ReactNode;
  indeterminate?: boolean;
}

/**
 * Checkbox — styled native input, custom-drawn box, Lucide check/minus mark.
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
        {/* strokeWidth 4 in Lucide's 24 viewBox = the 2px mark the 12px box wants */}
        {indeterminate ? (
          <Minus className="lg-checkbox__mark" strokeWidth={4} aria-hidden />
        ) : (
          <Check className="lg-checkbox__mark" strokeWidth={4} aria-hidden />
        )}
      </span>
      {label != null && <span className="lg-checkbox__label">{label}</span>}
    </label>
  );
}
