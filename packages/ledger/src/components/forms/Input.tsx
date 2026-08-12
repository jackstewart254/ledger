"use client";

import type { ComponentProps } from "react";
import { Icon, type LucideIcon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";
import type { FieldSize } from "./Textarea.js";

// "ref" omitted: this is a plain function component — React 18 drops a ref
// passed as a prop, so claiming it in the types would be a lie there
export interface InputProps extends Omit<ComponentProps<"input">, "size" | "ref"> {
  size?: FieldSize;
  invalid?: boolean;
  /** Optional leading icon — a lucide-react component. */
  icon?: LucideIcon;
}

/**
 * Input — text field on the shared .lg-control frame. className/style land on
 * the frame; every other native prop reaches the inner <input> (so FormField's
 * aria wiring lands on the control itself).
 */
export function Input({ size = "md", invalid = false, icon, className, style, disabled, ...rest }: InputProps) {
  return (
    <span
      className={cx(
        "lg-input",
        "lg-control",
        `lg-control--${size}`,
        invalid && "lg-control--invalid",
        disabled && "lg-control--disabled",
        className,
      )}
      style={style}
    >
      {icon && <Icon as={icon} size={size === "sm" ? 14 : 15} className="lg-control__icon" />}
      <input className="lg-control__input" disabled={disabled} aria-invalid={invalid || undefined} {...rest} />
    </span>
  );
}
