"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Shared chrome for the live app demos in the project panels: a full-bleed tinted band with a heading, and a
 * phone (iPhone bezel, dynamic island, home indicator) that holds the app. Kept apart from the apps so the demo
 * reads as the app, not as part of the site.
 */
export function DemoStage({ label, title, blurb, note, label_ = "Live demo", children }: { label: string; title: string; blurb: string; note: string; label_?: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="-mx-6 border-y border-line bg-fg/[0.04] px-6 py-10 md:-mx-8 md:px-8">
      <div className="mx-auto max-w-[22.5rem]">
        <p className="label">{label_}</p>
        <h3 className="display mt-1 text-4xl">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{blurb}</p>
      </div>
      {children}
      <p className="mx-auto mt-6 max-w-[22.5rem] text-xs leading-relaxed text-muted">{note}</p>
    </section>
  );
}

// iPhone 15 screen in CSS px. The app is laid out at exactly this size and the whole screen is scaled to fit the
// phone, so type, spacing, and cut-offs match the real device at any panel width or window height.
const W = 393;
const H = 852;

/**
 * `screenClass` styles the screen itself (its background). The phone's width follows the viewport height so the
 * whole phone fits when it can; `isolate` keeps the app's own z-indexes below the panel's sticky header.
 */
export function Phone({ className = "", screenClass = "bg-white", children }: { className?: string; screenClass?: string; children: ReactNode }) {
  const screen = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);

  useLayoutEffect(() => {
    const el = screen.current;
    if (!el) return;
    const measure = () => setK(el.clientWidth / W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className={`relative isolate mx-auto mt-7 rounded-[52px] bg-[#0c0c0e] p-[10px] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/30 ${className}`}
      style={{ width: "min(100%, 22.5rem, max(15rem, calc((100dvh - 9rem) * 0.4613 + 20px)))" }}
    >
      <div ref={screen} className={`relative overflow-hidden ${screenClass}`} style={{ aspectRatio: `${W} / ${H}`, borderRadius: 55 * k }}>
        <div className="relative flex flex-col" style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "0 0", visibility: k ? "visible" : "hidden" }}>
          <i className="absolute left-1/2 top-[11px] z-30 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
          {children}
          <i className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
        </div>
      </div>
    </div>
  );
}
