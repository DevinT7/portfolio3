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
    const start = () => {
      // Arriving through a route transition: what's on screen is already showing (see NavOrigin),
      // so mark it revealed now rather than waiting for the observer.
      const arriving = document.documentElement.hasAttribute("data-nav");
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (arriving && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in", "is-set");
        else io.observe(el);
      });
    };
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
