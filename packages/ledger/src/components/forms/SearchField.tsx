"use client";

import { useRef, useState, type ChangeEvent, type ComponentProps } from "react";
import { Search, X } from "lucide-react";
import { Icon } from "../core/Icon.js";
import { cx } from "../../internal/cx.js";

export interface SearchFieldProps extends Omit<ComponentProps<"input">, "size" | "type" | "ref"> {
  /** Called after the clear button empties the field. */
  onClear?: () => void;
}

/**
 * SearchField — Input frame + search icon + clear button.
 * Single size on purpose — the kit ships one control size, no `size` prop.
 */
export function SearchField({
  onClear,
  value,
  defaultValue,
  onChange,
  className,
  style,
  disabled,
  ...rest
}: SearchFieldProps) {
  const [internal, setInternal] = useState(String(defaultValue ?? ""));
  const controlled = value !== undefined;
  const val = controlled ? value : internal;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInternal(e.target.value);
    onChange?.(e);
  };

  const clear = () => {
    const el = inputRef.current;
    if (el) {
      // native setter + input event: bypasses React's value tracker so a
      // controlled consumer's onChange actually fires with ""
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, "");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (!controlled) setInternal("");
    onClear?.();
    el?.focus();
  };

  return (
    <span
      className={cx(
        "lg-search",
        "lg-control",
        disabled && "lg-control--disabled",
        className,
      )}
      style={style}
    >
      <Icon as={Search} size={15} className="lg-control__icon" />
      <input
        ref={inputRef}
        type="search"
        className="lg-control__input"
        value={val}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      />
      {val !== "" && !disabled && (
        <button type="button" aria-label="Clear search" className="lg-search__clear" onClick={clear}>
          <Icon as={X} size={14} />
        </button>
      )}
    </span>
  );
}
