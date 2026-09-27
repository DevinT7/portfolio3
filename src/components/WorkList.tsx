"use client";

import { useEffect, useRef, useState } from "react";
import type { Work } from "@/content/site";
import type { Found } from "@/lib/media";

const BLOCKS = ["var(--accent)", "var(--fg)", "#d8d5cb"];

/**
 * The whole portfolio in six rows. Hovering a row dims the others and a preview
 * follows the cursor, easing behind it and tilting with its speed.
 */
export function WorkList({ items }: { items: (Work & { found: Found })[] }) {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = preview.current;
    if (!el || !window.matchMedia("(hover: hover)").matches) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;
    let started = false;

    const tick = () => {
      const k = still ? 1 : 0.14;
      const dx = target.x - pos.x;
      pos.x += dx * k;
      pos.y += (target.y - pos.y) * k;
      const tilt = still ? 0 : Math.max(-8, Math.min(8, dx * 0.04));
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        pos.x = target.x;
        pos.y = target.y;
        started = true;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <ul className="border-b border-line" onPointerLeave={() => setActive(null)}>
        {items.map((w, i) => {
          const Row = w.href ? "a" : "div";
          const dim = active !== null && active !== i;
          return (
            <li key={w.name} className="rise border-t border-line" data-reveal style={{ "--i": i, "--d": "500ms" } as React.CSSProperties}>
              <Row
                {...(w.href ? { href: w.href, target: "_blank", rel: "noopener" } : {})}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={w.href ? undefined : 0}
                className={`group grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-4 transition-opacity duration-500 outline-offset-4 md:grid-cols-[4rem_1fr_1fr_9rem] md:py-5 ${dim ? "opacity-30" : ""}`}
              >
                <span className="label hidden md:block">{w.year}</span>
                <span className="display text-[clamp(2rem,4.6vw,3.75rem)] transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-3 group-focus-visible:translate-x-3">
                  {w.name}
                </span>
                <span className="col-start-1 row-start-2 text-muted md:col-start-auto md:row-start-auto">{w.what}</span>
                <span className="text-right font-mono text-sm">{w.stat}</span>
              </Row>
            </li>
          );
        })}
      </ul>

      {/* Cursor-following preview (pointer devices only). */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden aspect-[16/10] w-[min(26vw,360px)] [@media(hover:hover)]:block"
      >
        {items.map((w, i) => (
          <div
            key={w.name}
            className={`absolute inset-0 overflow-hidden rounded-[3px] transition-[opacity,scale] duration-400 ease-[var(--ease-out)] ${active === i ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
          >
            {w.found?.video ? (
              <video src={w.found.url} muted loop autoPlay playsInline preload="none" className="h-full w-full object-cover" />
            ) : w.found ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={w.found.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="grid h-full w-full place-items-center" style={{ background: BLOCKS[i % BLOCKS.length] }}>
                <span className={`display text-5xl ${i % BLOCKS.length === 1 ? "text-bg" : "text-fg"}`}>{w.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
