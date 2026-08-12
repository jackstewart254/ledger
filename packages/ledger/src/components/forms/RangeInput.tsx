"use client";

import type { ComponentProps } from "react";
import { cx } from "./cx.js";

export type RangeInputProps = Omit<ComponentProps<"input">, "type" | "size">;

/** RangeInput — styled native range; token track and thumb. */
export function RangeInput({ className, ...rest }: RangeInputProps) {
  return <input type="range" className={cx("lg-range", className)} {...rest} />;
}
