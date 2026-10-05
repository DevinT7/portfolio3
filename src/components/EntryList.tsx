"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { Entry } from "@/content/site";

/**
 * A list of entries (work or leadership). Names are solid black; hovering a row softens the others and nudges its name. Clicking opens the project panel
 * (see <Sheet />) via the URL hash.
 */
const SIZES = {
  lg: { name: "text-[clamp(2rem,4.6vw,3.75rem)]", pad: "md:py-5", delay: "500ms" },
  md: { name: "text-[clamp(1.75rem,3.4vw,2.75rem)]", pad: "md:py-4", delay: "0ms" },
  sm: { name: "text-[clamp(1.5rem,2.8vw,2.25rem)]", pad: "md:py-3.5", delay: "0ms" },
} as const;

export function EntryList({
  items,
  size = "lg",
}: {
  items: Entry[];
  /** Name size: lg for Work, md for Projects, sm for Leadership. */
  size?: keyof typeof SIZES;
}) {
  const [active, setActive] = useState<number | null>(null);
  const rule = useRef<SVGLineElement>(null);
  const list = useRef<HTMLUListElement>(null);

  // An accent rule draws itself across the top of the list as it scrolls into view.
  useEffect(() => {
    const line = rule.current;
    if (!line) return;
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        line,
        { drawSVG: "0%", opacity: 1 },
        { drawSVG: "100%", duration: 1.1, ease: "power2.inOut", scrollTrigger: { trigger: line, start: "top 88%", once: true } },
      );
    });
    // With reduced motion the rule simply isn't shown; the hairline borders carry the structure.
    return () => mm.revert();
  }, []);

  // The first time a row reaches the middle of the screen, its number counts up to the value. (Names stay solid; only hover dims the other rows.)
  useEffect(() => {
    const ul = list.current;
    if (!ul) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const restore: (() => void)[] = [];
      ul.querySelectorAll<HTMLElement>("li").forEach((li) => {
        const stat = li.querySelector<HTMLElement>("[data-stat]");
        const text = stat?.textContent ?? "";
        const m = text.match(/\d+(\.\d+)?/);
        if (!stat || !m || parseFloat(m[0]) < 2) return;
        const target = parseFloat(m[0]);
        const places = m[1] ? m[1].length - 1 : 0;
        const before = text.slice(0, m.index);
        const after = text.slice((m.index ?? 0) + m[0].length);
        restore.push(() => (stat.textContent = text));
        const count = { v: 0 };
        const tween = gsap.to(count, {
          v: target,
          duration: 1.1,
          ease: "power2.out",
          paused: true,
          onUpdate: () => (stat.textContent = before + count.v.toFixed(places) + after),
          onComplete: () => (stat.textContent = text),
        });
        ScrollTrigger.create({ trigger: li, start: "top 72%", once: true, onEnter: () => tween.play() });
      });
      return () => restore.forEach((f) => f());
    });
    return () => mm.revert();
  }, []);

  return (
    <ul ref={list} className="relative border-b border-line" onPointerLeave={() => setActive(null)}>
      <svg aria-hidden className="pointer-events-none absolute top-0 left-0 h-0.5 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 1">
        <line ref={rule} x1="0" y1="0" x2="100" y2="0" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />
      </svg>
      {items.map((w, i) => {
        const dim = active !== null && active !== i;
        return (
          <li key={w.id} className="rise border-t border-line" data-reveal style={{ "--i": i, "--d": SIZES[size].delay } as React.CSSProperties}>
            <a
              href={`#${w.id}`}
              onPointerEnter={() => setActive(i)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(null)}
              className={`group grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-4 transition-opacity duration-500 outline-offset-4 md:grid-cols-[4rem_1fr_1fr_9rem] ${SIZES[size].pad} ${dim ? "opacity-30" : ""}`}
            >
              <span className="label hidden md:block">{w.year}</span>
              <span className={`display ${SIZES[size].name} transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-3 group-focus-visible:translate-x-3`}>
                {w.name}
              </span>
              <span className="col-start-1 row-start-2 text-muted md:col-start-auto md:row-start-auto">{w.what}</span>
              <span data-stat className="text-right font-mono text-sm">{w.stat}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
