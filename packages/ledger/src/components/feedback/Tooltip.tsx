"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

/**
 * Tooltip — hover/focus label. Wraps a single child; shows on delay.
 * Portaled to <body> with fixed positioning, so no ancestor (overflow clip,
 * transform, stacking context) can cut it off or re-base its coordinates.
 * Pops from the anchor side on enter, fades on exit — CSS transitions only,
 * which keeps the library zero-dep. Reduced motion lands the same end states
 * instantly. The unmount is on a timer rather than transitionend, because a
 * hidden tab may never fire one.
 */

export type TooltipSide = "top" | "bottom" | "left" | "right";

/* matches the exit transition (--dur-fast) */
const OUT_MS = 120;

export interface TooltipProps {
  label: ReactNode;
  side?: TooltipSide;
  /** Hover intent delay in ms. */
  delay?: number;
  children: ReactNode;
  /** Passthrough for the tip itself. */
  className?: string;
  style?: CSSProperties;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}

export function Tooltip({
  label,
  side = "top",
  delay = 150,
  children,
  className,
  style,
  wrapperClassName,
  wrapperStyle,
}: TooltipProps) {
  const [open, setOpen] = useState(false); // hover intent
  const [shown, setShown] = useState(false); // mounted — lags open so the exit can play
  const openRef = useRef(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      openRef.current = true;
      setOpen(true);
      setShown(true);
    }, delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    openRef.current = false;
    setOpen(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  /* place before paint: anchor rect + measured tip size, clamped to the viewport */
  useLayoutEffect(() => {
    if (!shown) return;
    const tip = tipRef.current;
    const anchor = wrapRef.current;
    if (!tip || !anchor) return;
    const a = anchor.getBoundingClientRect();
    /* offsetWidth/Height, not getBoundingClientRect: the tip carries the
       entrance transform (scale 0.97) at this point, and a transformed rect
       would place it against its shrunk size. */
    const t = { width: tip.offsetWidth, height: tip.offsetHeight };
    const GAP = 7;
    const M = 8;
    let left: number;
    let top: number;
    if (side === "top") {
      left = a.left + a.width / 2 - t.width / 2;
      top = a.top - GAP - t.height;
    } else if (side === "bottom") {
      left = a.left + a.width / 2 - t.width / 2;
      top = a.bottom + GAP;
    } else if (side === "left") {
      left = a.left - GAP - t.width;
      top = a.top + a.height / 2 - t.height / 2;
    } else {
      left = a.right + GAP;
      top = a.top + a.height / 2 - t.height / 2;
    }
    /* clamp to the viewport — but only when the viewport reports a real size
       (hidden/offscreen tabs lay out at 0×0, which would clamp everything
       into the top-left corner) */
    const vw = Math.max(window.innerWidth, document.documentElement.clientWidth);
    const vh = Math.max(window.innerHeight, document.documentElement.clientHeight);
    if (vw > 40) left = Math.max(M, Math.min(left, vw - t.width - M));
    if (vh > 40) top = Math.max(M, Math.min(top, vh - t.height - M));
    tip.style.setProperty("--lg-tt-x", `${Math.round(left)}px`);
    tip.style.setProperty("--lg-tt-y", `${Math.round(top)}px`);
    /* `open` is a dep so a re-hover that catches the tip mid-exit re-places it —
       the anchor may have moved while the tooltip stayed mounted */
  }, [shown, open, label, side]);

  /* enter / exit — a stale exit completion must never unmount a tooltip that
     re-opened mid-fade (openRef guard) */
  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    if (open) {
      /* force the hidden from-state to commit before the class flips, so the
         entrance transition has something to run from */
      void tip.offsetHeight;
      tip.classList.add("lg-tooltip--open");
      return;
    }
    if (!shown) return;
    tip.classList.remove("lg-tooltip--open");
    const t = setTimeout(() => {
      if (!openRef.current) setShown(false);
    }, OUT_MS);
    return () => clearTimeout(t);
  }, [open, shown, side]);

  /* a fixed-position tooltip detaches from its anchor on scroll/resize — hide */
  useEffect(() => {
    if (!shown) return;
    const onMove = () => {
      clearTimeout(timer.current);
      openRef.current = false;
      setOpen(false);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [shown]);

  return (
    <span
      ref={wrapRef}
      className={cx("lg-tooltip-anchor", wrapperClassName)}
      style={wrapperStyle}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {shown &&
        label != null &&
        createPortal(
          <span
            role="tooltip"
            ref={tipRef}
            className={cx("lg-tooltip", `lg-tooltip--${side}`, className)}
            style={style}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
