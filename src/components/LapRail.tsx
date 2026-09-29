"use client";

import { useEffect, useRef, useState } from "react";

const PURPLE = "#b138dd";
const YELLOW = "#ffd400";
const SECTORS = ["S1", "S2", "S3"];

/**
 * A lap tracker down the left edge. The page is one lap: Work is sector 1, Leadership sector 2,
 * the footer sector 3, and each segment is as long as its part of the page. A little F1 car
 * drives down the rail as you scroll; sectors turn yellow while you're in them and purple once
 * done, and the finish earns a "Fastest lap". Desktop only. Decorative.
 */
export function LapRail() {
  const car = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const segs = useRef<(HTMLDivElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const finished = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const y = window.scrollY;
      const f = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      // Sector edges follow the real page: Leadership and the footer coming into view.
      const top = (el: Element | null) => (el ? el.getBoundingClientRect().top + y : max);
      const b1 = Math.min(max * 0.9, Math.max(1, top(document.getElementById("leadership-label")) - vh * 0.5));
      const b2 = Math.min(max - 1, Math.max(b1 + 1, top(document.querySelector("footer")) - vh * 0.6));
      const edges = [0, b1 / max, b2 / max, 1];
      const fill = [y / b1, (y - b1) / (b2 - b1), (y - b2) / (max - b2)].map((v) => Math.min(1, Math.max(0, v)));

      SECTORS.forEach((_, i) => {
        const seg = segs.current[i];
        const el = fills.current[i];
        if (!seg || !el) return;
        seg.style.top = `calc(${edges[i] * 100}% + 2px)`;
        seg.style.height = `calc(${(edges[i + 1] - edges[i]) * 100}% - 4px)`;
        el.style.height = `${fill[i] * 100}%`;
        el.style.background = fill[i] >= 1 ? PURPLE : YELLOW;
      });

      if (car.current) car.current.style.top = `${f * 100}%`;
      if (pct.current) pct.current.textContent = `${Math.round(f * 100)}%`;

      const end = f > 0.985;
      if (end !== finished.current) {
        finished.current = end;
        setDone(end);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed top-24 bottom-24 left-1.5 z-30 hidden w-5 md:block">
      <span ref={pct} className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[0.55rem] text-muted tabular-nums">
        0%
      </span>

      {SECTORS.map((s, i) => (
        <div key={s} ref={(el) => void (segs.current[i] = el)} className="absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-line">
          <span ref={(el) => void (fills.current[i] = el)} className="block w-full rounded-full" />
          <span className="absolute top-0 left-3 hidden font-mono text-[0.6rem] tracking-widest text-muted min-[1500px]:block">{s}</span>
        </div>
      ))}

      {/* Finish flag + fastest lap */}
      <span
        className="absolute top-full left-1/2 mt-1 size-3.5 -translate-x-1/2 rounded-[2px]"
        style={{ background: "repeating-conic-gradient(var(--fg) 0 25%, var(--bg) 0 50%) 0 0 / 7px 7px", outline: "1px solid var(--line)" }}
      />
      <span
        className={`absolute top-full left-0 mt-8 hidden rounded px-1.5 py-0.5 font-mono text-[0.6rem] whitespace-nowrap text-white transition-opacity duration-500 min-[1500px]:block ${done ? "opacity-100" : "opacity-0"}`}
        style={{ background: PURPLE }}
      >
        Fastest lap
      </span>

      {/* Top-down F1 car, nose pointing down the page. */}
      <div ref={car} className="absolute left-1/2 size-6 -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="-10 -10 20 20" className="size-full">
          <g transform="rotate(90)">
            <rect x={-8} y={-3.6} width={1.8} height={7.2} rx={0.4} fill="var(--fg)" />
            <rect x={5.6} y={-3.8} width={1.6} height={7.6} rx={0.4} fill="var(--fg)" />
            <rect x={-5.6} y={-3.6} width={3} height={1.8} rx={0.6} fill="var(--fg)" />
            <rect x={-5.6} y={1.8} width={3} height={1.8} rx={0.6} fill="var(--fg)" />
            <rect x={2.8} y={-3.2} width={2.4} height={1.5} rx={0.5} fill="var(--fg)" />
            <rect x={2.8} y={1.7} width={2.4} height={1.5} rx={0.5} fill="var(--fg)" />
            <path d="M-6.4 -1.3 L1 -1.5 L5.8 -0.5 L5.8 0.5 L1 1.5 L-6.4 1.3Z" fill="var(--accent)" stroke="var(--bg)" strokeWidth={0.5} strokeLinejoin="round" />
            <circle cx={-0.8} cy={0} r={0.9} fill="var(--bg)" />
          </g>
        </svg>
      </div>
    </div>
  );
}
