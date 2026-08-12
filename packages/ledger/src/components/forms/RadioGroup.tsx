"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shared input name — auto-generated when unset. */
  name?: string;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

/** RadioGroup — styled native radios, matches the Checkbox voice. */
export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  name,
  orientation = "vertical",
  disabled = false,
  "aria-label": ariaLabel,
  className,
  style,
}: RadioGroupProps) {
  const autoName = useId();
  const groupName = name ?? autoName;
  const controlled = value !== undefined;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx("lg-radio-group", orientation === "horizontal" && "lg-radio-group--horizontal", className)}
      style={style}
    >
      {options.map((opt) => {
        const off = disabled || opt.disabled;
        return (
          <label key={opt.value} className={cx("lg-radio", off && "lg-radio--disabled")}>
            <input
              type="radio"
              className="lg-radio__input"
              name={groupName}
              value={opt.value}
              disabled={off}
              checked={controlled ? value === opt.value : undefined}
              defaultChecked={controlled ? undefined : defaultValue === opt.value}
              onChange={() => onChange?.(opt.value)}
            />
            <span className="lg-radio__label">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
