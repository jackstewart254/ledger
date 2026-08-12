"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { cx } from "../../internal/cx.js";

export interface SwitchProps extends Omit<ComponentProps<"button">, "onChange" | "value" | "ref"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  size?: "sm" | "md";
}

/** Switch — track + thumb toggle. Controlled or uncontrolled. */
export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  size = "md",
  className,
  style,
  disabled,
  onClick,
  ...rest
}: SwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const controlled = checked !== undefined;
  const on = controlled ? checked : internal;

  const toggle = () => {
    if (!controlled) setInternal(!on);
    onChange?.(!on);
  };

  return (
    <label
      className={cx("lg-switch", `lg-switch--${size}`, disabled && "lg-switch--disabled", className)}
      style={style}
    >
      <button
        {...rest}
        type="button"
        role="switch"
        aria-checked={on}
        className="lg-switch__track"
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          toggle();
        }}
      >
        <span className="lg-switch__thumb" />
      </button>
      {label != null && <span className="lg-switch__label">{label}</span>}
    </label>
  );
}
