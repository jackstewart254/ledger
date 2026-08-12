"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cx } from "../../internal/cx.js";

/** Props FormField injects into a single element child for a11y wiring. */
interface WirableProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

/**
 * Components that render a SET of controls rather than one. They carry a
 * `__lgGroup` marker so FormField labels them as a group without the caller
 * having to know — see RadioGroup / SegmentedControl.
 */
const isGroupShaped = (type: unknown) =>
  typeof type === "function" && (type as { __lgGroup?: boolean }).__lgGroup === true;

/** Preferred landing spot for a label click: the group's actual tab stop. */
const TAB_STOP = "[tabindex='0'], input[type='radio']:checked:not(:disabled)";
const FOCUSABLE =
  "input:not(:disabled), button:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]";

export interface FormFieldProps {
  label: ReactNode;
  /** Error line — marks the control invalid. The only text under a field. */
  error?: ReactNode;
  /** Control id — defaults to the child's id, else an auto id. */
  htmlFor?: string;
  /**
   * Label a set of controls instead of one. On by default for the kit's
   * group-shaped controls (RadioGroup, SegmentedControl); pass it for a
   * hand-rolled set, e.g. a row of Checkboxes.
   */
  group?: boolean;
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
 *
 * A group-shaped child gets the fieldset/legend shape instead: `role="group"`
 * named by the label. `<label htmlFor>` only names and activates a LABELABLE
 * element (input, select, textarea, button), so pointing one at a radiogroup
 * div names nothing and clicks nothing — the failure is silent, which is why
 * this is a shape switch rather than an id the group accepts.
 */
export function FormField({
  label,
  error,
  htmlFor,
  group,
  children,
  className,
  style,
}: FormFieldProps) {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const descId = `${autoId}-desc`;
  const showDesc = error != null;
  const groupRef = useRef<HTMLDivElement>(null);

  const asGroup = group ?? (isValidElement(children) && isGroupShaped(children.type));

  if (asGroup) {
    /* Clicking a <legend> does nothing native, but this label looks like every
       other field label — send the click to the group's tab stop. */
    const focusGroup = () => {
      const root = groupRef.current;
      if (!root) return;
      (root.querySelector<HTMLElement>(TAB_STOP) ?? root.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    };

    return (
      <div
        ref={groupRef}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={showDesc ? descId : undefined}
        aria-invalid={error != null || undefined}
        className={cx("lg-field", className)}
        style={style}
      >
        {/* a <label> here would be a lie: it can name nothing in the group */}
        <span id={labelId} className="lg-field__label" onClick={focusGroup}>
          {label}
        </span>
        {children}
        {error != null && (
          <span className="lg-field__error" id={descId}>
            {error}
          </span>
        )}
      </div>
    );
  }

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
