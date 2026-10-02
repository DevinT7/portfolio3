"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scrubbed hero exit: as you scroll, the two name lines split apart, the facts fade, and the
 * photo tilts and shrinks into an oval.
 * Targets elements without reveal transforms (.rise) so it doesn't fight the entrance.
 */
export function HeroScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const hero = document.querySelector<HTMLElement>("main > section");
      if (!hero) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: hero, start: "top top", end: "+=90%", scrub: 0.8 },
      });
      // Name lines split apart in opposite directions; photo rotates and shrinks away; facts fall behind.
      tl.to(".hero-name > span:nth-child(1)", { xPercent: -35, opacity: 0 }, 0)
        .to(".hero-name > span:nth-child(2)", { xPercent: 35, opacity: 0 }, 0)
        .to(".hero-facts", { yPercent: -25, opacity: 0 }, 0)
        .to(".hero-photo > div", { scale: 0.6, rotate: 8, y: 80, borderRadius: 999 }, 0);
    });
    // Layout shifts while the intro plays and fonts load; re-measure once it settles.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("intro:done", refresh);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => {
      window.removeEventListener("intro:done", refresh);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  return null;
}
