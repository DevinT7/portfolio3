"use client";

import { useEffect } from "react";
import { Wipe } from "./Wipe";

const HOLD_MS = 1250; // orange screen + name wipe
const LIFT_MS = 900;

/**
 * First-visit intro. The inline script in layout.tsx decides whether it runs and adds
 * `html.intro` before first paint, so the curtain is up before anything else shows.
 * The name wipes in, then the curtain lifts and the homepage reveals start underneath.
 * Any click, key, scroll or touch lifts it early.
 */
export function Intro({ name }: { name: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const curtain = document.getElementById("curtain");
    if (!root.classList.contains("intro") || !curtain) return;

    window.scrollTo(0, 0);
    root.style.overflow = "hidden";
    curtain.querySelector(".wipe")?.classList.add("is-in");

    const timers: ReturnType<typeof setTimeout>[] = [];
    let lifted = false;
    const lift = (ms: number) => {
      if (lifted) return;
      lifted = true;
      unlisten();
      curtain.style.setProperty("--lift", `${ms}ms`);
      curtain.classList.add("lift");
      // Start the homepage reveals as the curtain clears the hero.
      timers.push(setTimeout(() => window.dispatchEvent(new Event("intro:done")), ms * 0.35));
      timers.push(
        setTimeout(() => {
          root.classList.remove("intro");
          root.style.overflow = "";
          curtain.classList.remove("lift");
        }, ms),
      );
    };

    const skip = () => lift(550);
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const unlisten = () => events.forEach((e) => window.removeEventListener(e, skip));
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));
    timers.push(setTimeout(() => lift(LIFT_MS), HOLD_MS));

    return () => {
      timers.forEach(clearTimeout);
      unlisten();
    };
  }, []);

  const [first, ...rest] = name.split(" ");
  return (
    <div id="curtain" className="curtain" aria-hidden>
      <p className="curtain-name display text-[clamp(2.75rem,8vw,6.5rem)]">
        <Wipe delay={150}>
          {first} <span className="serif">{rest.join(" ")}</span>
        </Wipe>
      </p>
    </div>
  );
}
