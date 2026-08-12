"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared dialog focus trap. One behavior for every dialog surface (Modal,
 * Drawer, CommandMenu): move focus to the first focusable inside on open,
 * wrap Tab/Shift+Tab within the container, and hand focus back to the opener
 * on close. Hand-rolled — no dependency.
 */
export function trapFocus(container: HTMLElement): () => void {
  const opener = document.activeElement;
  const focusables = (): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.checkVisibility?.() ?? true,
    );
  /* React's autoFocus fires during commit, before this effect — if the dialog
     already placed focus inside itself, keep it there instead of stomping it. */
  if (!container.contains(document.activeElement)) (focusables()[0] ?? container).focus();

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const els = focusables();
    if (els.length === 0) {
      e.preventDefault();
      return;
    }
    const edge = e.shiftKey ? els[0] : els[els.length - 1];
    if (document.activeElement === edge || !container.contains(document.activeElement)) {
      e.preventDefault();
      (e.shiftKey ? els[els.length - 1] : els[0]).focus();
    }
  };
  container.addEventListener("keydown", onKey);
  return () => {
    container.removeEventListener("keydown", onKey);
    if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
  };
}

/**
 * Hook form: attach the returned ref to the dialog root; `active` mirrors the
 * open state so mount-once components (command palette) re-arm per open.
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(active = true) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    return trapFocus(ref.current);
  }, [active]);
  return ref;
}
