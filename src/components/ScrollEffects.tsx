"use client";

import { useEffect } from "react";

/**
 * Adds `.is-in` to [data-reveal] elements the first time they enter the viewport.
 * While the intro is playing, waits for it to finish so the page fades in around the name.
 */
export function ScrollEffects() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.1 },
    );
    const start = () => document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    if (document.documentElement.classList.contains("intro") && document.getElementById("curtain")) {
      window.addEventListener("intro:done", start, { once: true });
    } else {
      start();
    }
    return () => {
      window.removeEventListener("intro:done", start);
      io.disconnect();
    };
  }, []);

  return null;
}
