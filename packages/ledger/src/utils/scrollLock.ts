/* Body scroll-lock shared by every overlay that parks page scroll (Modal,
   Drawer, CommandMenu). A module-level counter so OVERLAPPING dialogs can't
   clobber each other: A opens, B opens, A closes — the body stays locked
   until the LAST holder releases.
   ponytail: overflow:hidden doesn't stop iOS touch rubber-banding; add the
   position:fixed body dance only if touch devices ever matter here. */
let locks = 0;
let prevOverflow = "";

export function lockBodyScroll(): void {
  if (locks === 0) {
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  locks += 1;
}

export function unlockBodyScroll(): void {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.body.style.overflow = prevOverflow;
}
