"use client";

import { useEffect } from "react";

/** Remembers where a same-site link was pressed so the page transition can open from that point. */
export function NavOrigin() {
  useEffect(() => {
    const set = (x: number, y: number) => {
      const s = document.documentElement.style;
      s.setProperty("--nx", `${x}px`);
      s.setProperty("--ny", `${y}px`);
    };
    const down = (e: PointerEvent) => {
      const a = (e.target as Element).closest?.("a[href^='/']");
      if (a) set(e.clientX, e.clientY);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const a = document.activeElement;
      if (a instanceof HTMLAnchorElement && a.getAttribute("href")?.startsWith("/")) {
        const r = a.getBoundingClientRect();
        set(r.left + r.width / 2, r.top + r.height / 2);
      }
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
