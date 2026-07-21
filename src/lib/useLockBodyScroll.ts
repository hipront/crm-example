"use client";

import { useEffect } from "react";

export function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) return;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
    };
  }, [active]);
}
