"use client";

declare global {
  interface Window {
    __navT?: ReturnType<typeof setTimeout>;
  }
}

import { useEffect } from "react";

/**
 * Flags <html data-nav> when a same-site link is used, so the page that arrives shows immediately
 * under the route transition instead of also replaying its own entrance. Cleared shortly after.
 */
export function NavOrigin() {
  useEffect(() => {
    const root = document.documentElement;
    const flag = () => {
      root.setAttribute("data-nav", "");
      // Not cleared on unmount: the page that set the flag is gone by the time it should expire.
      clearTimeout(window.__navT);
      window.__navT = setTimeout(() => root.removeAttribute("data-nav"), 900);
    };
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest?.("a[href^='/']")) flag();
    };
    const key = (e: KeyboardEvent) => {
      const a = document.activeElement;
      if (e.key === "Enter" && a instanceof HTMLAnchorElement && a.getAttribute("href")?.startsWith("/")) flag();
    };
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, []);
  return null;
}
