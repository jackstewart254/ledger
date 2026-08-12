"use client";

import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { Icon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ComponentProps<"select">, "size" | "ref"> {
  invalid?: boolean;
  /** Option list — or pass <option> children instead. */
  options?: SelectOption[];
  placeholder?: string;
}

/**
 * Select — styled native <select> on the .lg-control frame, chevron overlay.
 * Single size on purpose — the kit ships one control size, no `size` prop.
 */
export function Select({
  invalid = false,
  options,
  placeholder,
  children,
  className,
  style,
  disabled,
  ...rest
}: SelectProps) {
  return (
    <span
      className={cx(
        "lg-select",
        "lg-control",
        invalid && "lg-control--invalid",
        disabled && "lg-control--disabled",
        className,
      )}
      style={style}
    >
      <select
        className="lg-select__control"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...(placeholder !== undefined && rest.value === undefined && rest.defaultValue === undefined
          ? { defaultValue: "" }
          : undefined)}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ??
          options?.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
      </select>
      <Icon as={ChevronDown} className="lg-select__chevron" />
    </span>
  );
}
