"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "Ski the page": a tiny skier carves down the site while it auto-scrolls. Steer with the
 * mouse, arrow keys or a finger; dodge the trees; reach the footer. Starts from the footer
 * button (a `ski:start` event) or the S key. Esc quits.
 */

type Phase = "idle" | "run" | "crash" | "done";
type Tree = { x: number; y: number; s: number };

const SKIER_Y = 0.3; // skier's screen position while the page scrolls, as a fraction of height
const V0 = 150; // px/s — the page is short, so keep the run ~8s and make it about steering
const V_MAX = 420;
const ACCEL = 30; // px/s²
const STEER = 560; // max sideways px/s
const HIT = 13;
const SNOW = "rgb(150 168 190)"; // cool grey-blue so snow reads on the off-white page

const CRASH_LINES = [
  "Tree 1, Devin 0.",
  "Durango has trees too. Try again.",
  "That one came out of nowhere.",
  "Back to the blue runs.",
];
const FINISH_LINES = ["Clean run. Zürich-level.", "Durango would be proud.", "Fresh tracks all the way down."];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export function Ski() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [hud, setHud] = useState({ t: 0, m: 0 });
  const [best, setBest] = useState<number | null>(null);
  const [line, setLine] = useState("");
  const game = useRef<{ stop: () => void } | null>(null);

  const exit = useCallback(() => {
    game.current?.stop();
    game.current = null;
    document.getElementById("page")?.removeAttribute("inert");
    document.documentElement.style.overflow = "";
    setPhase("idle");
  }, []);

  const start = useCallback(() => {
    const cv = canvas.current;
    if (!cv) return;
    game.current?.stop();

    const root = document.documentElement;
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("page")?.setAttribute("inert", "");
    root.style.overflow = "hidden";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    cv.width = vw * dpr;
    cv.height = vh * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const css = getComputedStyle(root);
    const FG = css.getPropertyValue("--fg").trim() || "#111";
    const ACCENT = css.getPropertyValue("--accent").trim() || "#ff4f1a";

    const maxScroll = root.scrollHeight - vh;
    const docEnd = root.scrollHeight - 40;

    // The course is the page's content column, not the whole window.
    const col = document.getElementById("page")?.getBoundingClientRect();
    const L = (col?.left ?? 0) + 24;
    const R = (col?.right ?? vw) - 24;

    // Trees in document coordinates, in loose bands, clear of the start.
    const trees: Tree[] = [];
    for (let y = vh * SKIER_Y + 260; y < docEnd - 60; y += 70 + Math.random() * 60) {
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) trees.push({ x: L + Math.random() * (R - L), y: y + Math.random() * 40, s: 0.8 + Math.random() * 0.5 });
    }

    let x = (L + R) / 2;
    let target = x;
    let lean = 0; // radians, visual only
    let y = vh * SKIER_Y; // document y
    let v = V0;
    let t = 0;
    let last = performance.now();
    let running = true;
    let crashed = false;
    let spin = 0;
    let keys = 0; // -1 left, 1 right
    let raf = 0;
    let hudTick = 0;
    const tracks: { x: number; y: number }[] = [{ x, y }];

    // Falling snow (screen coordinates, drifts with a little parallax as the page scrolls).
    const flakes = Array.from({ length: Math.round((vw * vh) / 16000) }, () => ({
      x: Math.random() * vw,
      y: Math.random() * vh,
      r: 0.8 + Math.random() * 2,
      vy: 25 + Math.random() * 45,
      ph: Math.random() * Math.PI * 2,
    }));
    // Powder kicked up by the skis (document coordinates).
    const spray: { x: number; y: number; vx: number; vy: number; life: number; r: number }[] = [];
    const kick = (n: number, dir: number, spread = 1) => {
      for (let i = 0; i < n; i++) {
        spray.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + 8,
          vx: (dir || (Math.random() - 0.5) * 2) * (40 + Math.random() * 140) * spread,
          vy: v * (0.15 + Math.random() * 0.45) - Math.random() * 60 * spread,
          life: 0.5 + Math.random() * 0.4,
          r: 1 + Math.random() * 2,
        });
      }
    };
    let prevSy = window.scrollY;

    const onMove = (e: PointerEvent) => (target = Math.max(L, Math.min(R, e.clientX)));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keys = -1;
      if (e.key === "ArrowRight") keys = 1;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if ((e.key === "ArrowLeft" && keys < 0) || (e.key === "ArrowRight" && keys > 0)) keys = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);

    const drawTree = (tx: number, ty: number, s: number) => {
      ctx.fillStyle = FG;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 22 * s);
      ctx.lineTo(tx + 9 * s, ty - 6 * s);
      ctx.lineTo(tx - 9 * s, ty - 6 * s);
      ctx.closePath();
      ctx.moveTo(tx, ty - 14 * s);
      ctx.lineTo(tx + 12 * s, ty + 4 * s);
      ctx.lineTo(tx - 12 * s, ty + 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(tx - 1.5 * s, ty + 4 * s, 3 * s, 5 * s);
      // Snow on the tip and along the lower branches.
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(tx, ty - 22 * s);
      ctx.lineTo(tx + 4 * s, ty - 15 * s);
      ctx.lineTo(tx - 4 * s, ty - 15 * s);
      ctx.closePath();
      ctx.moveTo(tx - 12 * s, ty + 4 * s);
      ctx.lineTo(tx - 6 * s, ty - 1 * s);
      ctx.lineTo(tx - 2 * s, ty + 4 * s);
      ctx.closePath();
      ctx.moveTo(tx + 3 * s, ty + 4 * s);
      ctx.lineTo(tx + 8 * s, ty);
      ctx.lineTo(tx + 12 * s, ty + 4 * s);
      ctx.closePath();
      ctx.fill();
    };

    const drawSkier = (sx: number, sy: number, a: number) => {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(a);
      ctx.strokeStyle = FG;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      for (const dx of [-4, 4]) {
        ctx.beginPath();
        ctx.moveTo(dx, -12);
        ctx.lineTo(dx, 12);
        ctx.stroke();
      }
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.roundRect(-6, -8, 12, 13, 4);
      ctx.fill();
      ctx.fillStyle = FG;
      ctx.beginPath();
      ctx.arc(0, -11, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!crashed) {
        t += dt;
        v = Math.min(V_MAX, v + ACCEL * dt);
        if (keys) target = Math.max(L, Math.min(R, target + keys * STEER * dt));
        const dx = Math.max(-STEER * dt, Math.min(STEER * dt, target - x));
        x += dx;
        lean += (-(dx / dt) / STEER * 0.6 - lean) * Math.min(1, dt * 10);
        y += v * dt;

        // Carving throws powder to the outside of the turn; going straight leaves a light dusting.
        const lateral = Math.abs(dx) / dt;
        const n = Math.floor(lateral / 90) + (Math.random() < 0.35 ? 1 : 0);
        if (n) kick(n, lateral > 40 ? -Math.sign(dx) : 0);

        // Scroll with the skier; once the page bottoms out, the skier keeps going down the screen.
        const want = Math.min(maxScroll, y - vh * SKIER_Y);
        if (want > window.scrollY) window.scrollTo(0, want);

        const lastT = tracks[tracks.length - 1];
        if (y - lastT.y > 5) tracks.push({ x, y });

        for (const tr of trees) {
          if (Math.abs(tr.y - y) < 20 && Math.hypot(tr.x - x, tr.y - y) < HIT * tr.s + 4) {
            crashed = true;
            kick(55, 0, 1.8);
            finish("crash");
            break;
          }
        }
        if (!crashed && y >= docEnd) {
          crashed = true; // stop moving
          finish("done");
        }

        hudTick += dt;
        if (hudTick > 0.1) {
          hudTick = 0;
          setHud({ t, m: Math.round((y - vh * SKIER_Y) / 10) });
        }
      } else {
        spin += dt * 9;
      }

      // Draw in document coordinates offset by scroll.
      const sy = window.scrollY;
      const dsy = sy - prevSy;
      prevSy = sy;
      ctx.clearRect(0, 0, vw, vh);

      ctx.fillStyle = SNOW;
      for (const f of flakes) {
        f.y += f.vy * dt - dsy * 0.35 * (f.r / 2);
        f.x += Math.sin(now / 900 + f.ph) * 12 * dt;
        if (f.y > vh + 4 || f.y < -4) {
          f.y = f.y > 0 ? -4 : vh + 4;
          f.x = Math.random() * vw;
        }
        ctx.globalAlpha = 0.35 + f.r * 0.15;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = spray.length - 1; i >= 0; i--) {
        const p = spray[i];
        p.life -= dt;
        if (p.life <= 0) {
          spray.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 1 - 3 * dt;
        ctx.globalAlpha = Math.min(1, p.life * 1.6) * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y - sy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = FG;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1.5;
      for (const off of [-4, 4]) {
        ctx.beginPath();
        let started = false;
        for (const p of tracks) {
          const py = p.y - sy;
          if (py < -20 || py > vh + 20) continue;
          if (!started) {
            ctx.moveTo(p.x + off, py);
            started = true;
          } else ctx.lineTo(p.x + off, py);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const tr of trees) {
        const py = tr.y - sy;
        if (py > -30 && py < vh + 30) drawTree(tr.x, py, tr.s);
      }
      const phaseSpin = crashed && spin > 0 ? Math.min(spin, Math.PI * 2.5) : 0;
      drawSkier(x, y - sy, lean + phaseSpin);

      if (running) raf = requestAnimationFrame(frame);
    };

    const finish = (how: "crash" | "done") => {
      setHud({ t, m: Math.round((y - vh * SKIER_Y) / 10) });
      if (how === "done") {
        let prev: number | null = null;
        try {
          prev = Number(localStorage.getItem("ski-best")) || null;
          if (!prev || t < prev) localStorage.setItem("ski-best", String(t));
        } catch {}
        setBest(prev && prev < t ? prev : t);
        setLine(pick(FINISH_LINES));
      } else {
        spin = 0.0001;
        setLine(pick(CRASH_LINES));
      }
      setPhase(how);
      // The loop keeps running so snow keeps falling behind the results card.
    };

    game.current = {
      stop: () => {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("keyup", onKeyUp);
        ctx.clearRect(0, 0, vw, vh);
      },
    };

    setHud({ t: 0, m: 0 });
    setPhase("run");
    raf = requestAnimationFrame((n) => {
      last = n;
      frame(n);
    });
  }, []);

  // Triggers: footer button event, S key; Esc quits.
  useEffect(() => {
    const onStart = () => start();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && game.current) return exit();
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if ((e.key === "s" || e.key === "S") && !e.metaKey && !e.ctrlKey && !e.altKey && !typing && !game.current && !location.hash) {
        start();
      }
    };
    window.addEventListener("ski:start", onStart);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ski:start", onStart);
      window.removeEventListener("keydown", onKey);
    };
  }, [start, exit]);

  useEffect(() => () => game.current?.stop(), []);

  const time = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
  const active = phase !== "idle";

  return (
    <div
      className={`fixed inset-0 z-[70] ${active ? "touch-none" : "pointer-events-none"}`}
      aria-hidden={!active}
    >
      <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" />

      {active && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <p className="label flex items-center gap-3 rounded-full border border-line bg-bg/85 px-4 py-2 text-fg backdrop-blur">
            <span className="text-accent">Ski</span>
            <span className="tabular-nums">{time(hud.t)}</span>
            <span className="tabular-nums">{hud.m} m</span>
            <span className="text-muted">Esc to quit</span>
          </p>
        </div>
      )}

      {(phase === "crash" || phase === "done") && (
        <div className="absolute inset-0 grid place-items-center bg-bg/40 px-4" role="dialog" aria-label="Ski results">
          <div className="w-full max-w-xs rounded-[20px] border border-line bg-bg p-6 shadow-2xl" aria-live="polite">
            <p className="label">{phase === "crash" ? "Wiped out" : "Finished"}</p>
            <p className="display mt-3 text-5xl">{phase === "crash" ? `${hud.m} m` : time(hud.t)}</p>
            <p className="mt-2 text-muted">
              {phase === "crash" ? line : best !== null && best < hud.t ? `${line} Your best: ${time(best)}` : `New best. ${line}`}
            </p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={start} autoFocus className="h-11 flex-1 rounded-full bg-fg font-semibold text-bg">
                Again
              </button>
              <button type="button" onClick={exit} className="h-11 flex-1 rounded-full border border-line">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Footer trigger for the ski game. */
export function SkiButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("ski:start"))}
      className="label inline-flex h-11 items-center gap-2 text-fg transition-colors hover:text-accent"
    >
      Ski the page <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.65rem]">S</kbd>
    </button>
  );
}
