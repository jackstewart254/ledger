"use client";

import { Input, type InputProps } from "./Input.js";
import { cx } from "../../internal/cx.js";

export type DateInputProps = Omit<InputProps, "type" | "icon">;

/** DateInput — styled native <input type="date"> on the Input frame. */
export function DateInput({ className, ...rest }: DateInputProps) {
  return <Input {...rest} type="date" className={cx("lg-date", className)} />;
}
