"use client";

import { useEffect } from "react";

const RISE_MS = 1250; // letters finish rising (14 letters × 40ms stagger + 700ms)
const SETTLE_MS = 900;

/**
 * First-visit intro. The inline script in layout.tsx decides whether it runs and adds
 * `html.intro` before first paint. Here the name is moved to the center of the screen and
 * enlarged, its letters rise in, then it glides back to its real spot in the hero while
 * the rest of the page fades in. Any click, key, scroll or touch skips ahead.
 */
export function Intro() {
  useEffect(() => {
    const root = document.documentElement;
    const name = document.getElementById("name");
    if (!root.classList.contains("intro") || !name) return;

    window.scrollTo(0, 0);
    root.style.overflow = "hidden";

    // FLIP: measure the real position, then transform it to the center of the viewport.
    // (Clear any transform first: React may run this effect twice in development.)
    name.style.transform = "";
    const r = name.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = Math.min(1.6, (vw * 0.84) / r.width);
    const dx = vw / 2 - (r.left + r.width / 2);
    const dy = vh / 2 - (r.top + r.height / 2);
    // The letters replace the hero's block wipe, so it must not play again afterwards.
    name.querySelectorAll(".wipe").forEach((w) => {
      w.removeAttribute("data-reveal");
      w.classList.add("wiped");
    });
    name.style.transformOrigin = "center";
    name.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    root.classList.add("intro-play");

    let done = false;
    const settle = (ms: number) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      name.style.transition = `transform ${ms}ms var(--ease-out)`;
      name.style.transform = "";
      root.classList.remove("intro", "intro-play");
      root.style.overflow = "";
      window.dispatchEvent(new Event("intro:done"));
      setTimeout(() => {
        name.style.transition = "";
        name.style.transformOrigin = "";
      }, ms);
      skipEvents.forEach((e) => window.removeEventListener(e, skip));
    };
    const skip = () => settle(450);
    const skipEvents = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    skipEvents.forEach((e) => window.addEventListener(e, skip, { passive: true }));
    const timer = setTimeout(() => settle(SETTLE_MS), RISE_MS);

    return () => {
      clearTimeout(timer);
      skipEvents.forEach((e) => window.removeEventListener(e, skip));
    };
  }, []);

  return null;
}
