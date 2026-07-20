import { useEffect, useRef } from "react";

/**
 * Locks background scroll while `active` is true, using position:fixed instead of
 * overflow:hidden. Plain overflow:hidden triggers the mobile browser's address bar
 * to collapse/expand, which changes the real viewport height after fixed-position
 * overlays have already been laid out, leaving a visible gap at the bottom.
 * Call `unlock()` when the closing animation actually finishes (not on state change)
 * to avoid restoring scroll mid-transition.
 */
export function useBodyScrollLock(active: boolean) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    scrollYRef.current = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
  }, [active]);

  function unlock() {
    const body = document.body;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    window.scrollTo(0, scrollYRef.current);
  }

  return unlock;
}
