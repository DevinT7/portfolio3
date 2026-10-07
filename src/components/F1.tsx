"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * F1 start-lights reaction test. Five lights come on one by one, stay on for a random beat,
 * then go out; click, tap or hit Space as fast as you can. Opens from the footer button
 * (an `f1:start` event), or by typing "f1" anywhere on the page, which sends a car racing
 * across the screen first. Esc closes. Best time is kept in this browser only.
 */

type Phase = "idle" | "lights" | "hold" | "go" | "result" | "jump";

const RED = "#e10600";
const KEY = "f1-best";

const rate = (ms: number) => (ms < 200 ? "Pole position." : ms < 280 ? "Points finish." : ms < 400 ? "Solid midfield." : "Lapped.");

export function F1() {
  const [open, setOpen] = useState(false);
  const [race, setRace] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState(0);
  const [time, setTime] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const t0 = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const opener = useRef<HTMLElement | null>(null);

  const set = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const start = useCallback(() => {
    clear();
    setLit(0);
    set("lights");
    for (let i = 1; i <= 5; i++) timers.current.push(setTimeout(() => setLit(i), i * 700));
    timers.current.push(
      setTimeout(() => {
        set("hold");
        timers.current.push(
          setTimeout(() => {
            setLit(0);
            t0.current = performance.now();
            set("go");
          }, 600 + Math.random() * 2400),
        );
      }, 5 * 700),
    );
  }, []);

  const press = useCallback(() => {
    const p = phaseRef.current;
    if (p === "idle" || p === "result" || p === "jump") return start();
    if (p === "go") {
      const ms = Math.round(performance.now() - t0.current);
      setTime(ms);
      setBest((b) => {
        const nb = b === null ? ms : Math.min(b, ms);
        try {
          localStorage.setItem(KEY, String(nb));
        } catch {}
        return nb;
      });
      return set("result");
    }
    // Lights still on: jump start.
    clear();
    setLit(0);
    set("jump");
  }, [start]);

  const close = useCallback(() => {
    clear();
    set("idle");
    setLit(0);
    setOpen(false);
  }, []);

  const show = useCallback(() => {
    opener.current = document.activeElement as HTMLElement;
    try {
      const b = Number(localStorage.getItem(KEY));
      if (b > 0) setBest(b);
    } catch {}
    setOpen(true);
  }, []);

  useEffect(() => {
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      if (/INPUT|TEXTAREA/.test(t.tagName) || t.isContentEditable) return;
      typed = (typed + e.key.toLowerCase()).slice(-2);
      if (typed !== "f1" || phaseRef.current === "lights" || document.getElementById("page")?.hasAttribute("inert")) return;
      typed = "";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) show();
      else setRace(true);
    };
    window.addEventListener("f1:start", show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("f1:start", show);
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const page = document.getElementById("page");
    page?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!e.repeat) press();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      page?.removeAttribute("inert");
      document.documentElement.style.overflow = "";
      opener.current?.focus({ preventScroll: true });
      window.removeEventListener("keydown", onKey);
      clear();
    };
  }, [open, close, press]);

  const msg =
    phase === "idle" ? "Space or tap to start"
    : phase === "lights" || phase === "hold" ? "Wait for lights out"
    : phase === "go" ? "Go"
    : phase === "jump" ? "Jump start"
    : rate(time);

  return (
    <>
      {race && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-16 z-[65] overflow-hidden md:bottom-24">
          <div
            className="race-by flex w-fit items-center"
            onAnimationEnd={() => {
              setRace(false);
              show();
            }}
          >
            <span className="h-[3px] w-40 bg-gradient-to-r from-transparent to-accent md:w-72" />
            <svg viewBox="-9 -5 18 10" className="w-24 md:w-32">
              <rect x={-8} y={-3.6} width={1.8} height={7.2} rx={0.4} fill="var(--fg)" />
              <rect x={5.6} y={-3.8} width={1.6} height={7.6} rx={0.4} fill="var(--fg)" />
              <rect x={-5.6} y={-3.6} width={3} height={1.8} rx={0.6} fill="var(--fg)" />
              <rect x={-5.6} y={1.8} width={3} height={1.8} rx={0.6} fill="var(--fg)" />
              <rect x={2.8} y={-3.2} width={2.4} height={1.5} rx={0.5} fill="var(--fg)" />
              <rect x={2.8} y={1.7} width={2.4} height={1.5} rx={0.5} fill="var(--fg)" />
              <path d="M-6.4 -1.3 L1 -1.5 L5.8 -0.5 L5.8 0.5 L1 1.5 L-6.4 1.3Z" fill="var(--accent)" stroke="var(--bg)" strokeWidth={0.5} strokeLinejoin="round" />
              <circle cx={-0.8} cy={0} r={0.9} fill="var(--bg)" />
            </svg>
          </div>
        </div>
      )}
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={close} className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Reaction test"
        tabIndex={-1}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          press();
        }}
        className={`absolute top-1/2 left-1/2 w-[min(92vw,34rem)] -translate-x-1/2 rounded-[24px] border border-white/10 bg-[#111111] px-6 py-8 text-[#f4f3ef] outline-none select-none transition-[opacity,scale,translate] duration-500 ease-[var(--ease-out)] md:px-10 md:py-10 ${open ? "-translate-y-1/2 scale-100 opacity-100" : "-translate-y-[45%] scale-95 opacity-0"}`}
      >
        <div className="flex items-center justify-between">
          <span className="label !text-[#f4f3ef]/60">Reaction test</span>
          <button type="button" onClick={close} className="label -mr-3 h-11 px-3 !text-[#f4f3ef]/60 hover:!text-[#f4f3ef]">
            Close ✕
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2 md:gap-3" aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex flex-col gap-2 rounded-2xl bg-[#1d1d1d] p-2 md:gap-3 md:p-3">
              {[0, 1].map((k) => (
                <span
                  key={k}
                  className="size-9 rounded-full transition-[background-color,box-shadow] duration-100 md:size-12"
                  style={lit >= n ? { background: RED, boxShadow: `0 0 24px 2px ${RED}99` } : { background: "#2c2c2c" }}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center" aria-live="polite">
          <p className="display text-[clamp(3rem,12vw,5rem)] tabular-nums" style={{ color: phase === "jump" ? RED : undefined }}>
            {phase === "result" ? `${(time / 1000).toFixed(3)}s` : phase === "jump" ? "Jump" : "—"}
          </p>
          <p className="label mt-2 !text-[#f4f3ef]/70">{msg}</p>
          {best !== null && <p className="label mt-1 !text-[#f4f3ef]/40">Best {(best / 1000).toFixed(3)}s</p>}
        </div>
      </div>
    </div>
    </>
  );
}

/** Footer trigger. */
export function F1Button() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("f1:start"))}
      className="label inline-flex h-11 items-center gap-2 text-fg transition-colors hover:text-accent"
    >
      Lights out <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.65rem] pointer-coarse:hidden">f1</kbd>
    </button>
  );
}
