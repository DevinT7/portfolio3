"use client";

import { useEffect, useRef, useState } from "react";

// A loose, hand-drawn take on COTA: the climb to Turn 1, the esses, then the long back straight.
const TRACK =
  "M14 58 L30 50 L42 12 Q46 3 54 9 L50 20 Q47 27 56 29 Q65 31 59 37 Q53 43 63 45 Q72 47 68 53 Q66 60 78 60 L94 56 Q100 52 95 44 Q100 62 90 65 L30 66 Q10 66 14 58Z";

const PURPLE = "#b138dd";
const YELLOW = "#ffd400";

/**
 * A timing-tower style lap tracker pinned to the corner. The page is one lap: Work is sector 1,
 * Leadership sector 2, the footer sector 3. Finishing the lap earns a purple "Fastest lap".
 * The track only shows on wide screens; narrower ones get the readout alone. Decorative.
 */
export function Circuit() {
  const path = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const car = useRef<SVGGElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const finished = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const p = path.current;
    const tr = trail.current;
    const c = car.current;
    if (!p || !tr || !c) return;
    const len = p.getTotalLength();
    tr.style.strokeDasharray = `${len}`;
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
      const fill = [y / b1, (y - b1) / (b2 - b1), (y - b2) / (max - b2)].map((v) => Math.min(1, Math.max(0, v)));
      fill.forEach((v, i) => {
        const el = bars.current[i];
        if (!el) return;
        el.style.width = `${v * 100}%`;
        el.style.background = v >= 1 ? PURPLE : YELLOW;
      });

      const at = f * len * 0.985;
      const pt = p.getPointAtLength(at);
      const ahead = p.getPointAtLength(Math.min(len, at + 1));
      const deg = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
      c.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${deg}) scale(1.4)`);
      tr.style.strokeDashoffset = String(len - f * len * 0.985);
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
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-4 left-4 z-30 hidden w-36 rounded-2xl border border-line bg-bg/90 p-2.5 text-fg backdrop-blur md:block min-[1500px]:w-36"
    >
      <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-widest uppercase">
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-[2px]"
            style={{ background: "repeating-conic-gradient(var(--fg) 0 25%, var(--bg) 0 50%) 0 0 / 5px 5px", outline: "1px solid var(--line)" }}
          />
          COTA
        </span>
        <span className="text-muted">Lap 1</span>
      </div>

      <svg viewBox="0 0 110 72" className="my-1 hidden w-full min-[1500px]:block">
        <path ref={path} d={TRACK} fill="none" stroke="var(--muted)" strokeOpacity={0.35} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <path ref={trail} d={TRACK} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {/* Top-down F1 car, nose pointing along +x; rotated to follow the track. */}
        <g ref={car}>
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

      <div className="mt-2 flex gap-1">
        {["S1", "S2", "S3"].map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <span ref={(el) => void (bars.current[i] = el)} className="block h-full w-0" />
            </div>
            <p className="mt-1 text-center font-mono text-[0.55rem] text-muted">{s}</p>
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between font-mono text-[0.6rem] tracking-widest uppercase">
        {done ? (
          <span className="rounded px-1.5 py-0.5 tracking-normal whitespace-nowrap text-white" style={{ background: PURPLE }}>
            Fastest lap
          </span>
        ) : (
          <span className="text-muted">Lap</span>
        )}
        <span ref={pct} className="tabular-nums">
          0%
        </span>
      </div>
    </div>
  );
}
