"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../internal/cx.js";

/** Props FormField injects into a single element child for a11y wiring. */
interface WirableProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export interface FormFieldProps {
  label: ReactNode;
  /** Error line — marks the control invalid. The only text under a field. */
  error?: ReactNode;
  /** Control id — defaults to the child's id, else an auto id. */
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * FormField — label + control slot + error line. Wires aria-describedby /
 * aria-invalid onto a single element child.
 *
 * There is deliberately NO hint slot. Explainer text under a field is a model
 * narrating its own interface; a field that needs a caption to be understood
 * needs a better label or a better control. Errors stay — those report
 * something the user could not have known in advance.
 */
export function FormField({ label, error, htmlFor, children, className, style }: FormFieldProps) {
  const autoId = useId();
  const descId = `${autoId}-desc`;
  const showDesc = error != null;

  let control = children;
  let controlId = htmlFor;
  if (isValidElement<WirableProps>(children)) {
    controlId = htmlFor ?? children.props.id ?? autoId;
    control = cloneElement(children, {
      id: controlId,
      "aria-describedby":
        cx(children.props["aria-describedby"], showDesc && descId) || undefined,
      "aria-invalid": error != null ? true : children.props["aria-invalid"],
    });
  }

  return (
    <div className={cx("lg-field", className)} style={style}>
      <label className="lg-field__label" htmlFor={controlId}>
        {label}
      </label>
      {control}
      {error != null && (
        <span className="lg-field__error" id={descId}>
          {error}
        </span>
      )}
    </div>
  );
}
