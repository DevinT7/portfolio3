"use client";

import { useRef, type ReactNode } from "react";
import { Magnetic } from "@/components/ui/magnetic";

/**
 * Top-right dock for the header links, after Watermelon's Dock: icons swell as the pointer
 * nears them and settle back on leave. Mouse only; touch gets plain buttons. Transform only, so
 * neighbours never move. Each icon also leans toward the pointer (Magnetic, from
 * motion-primitives).
 *
 * Touch: press-and-hold an icon, or slide along the bar, to see its label (the same tooltip hover
 * shows). A hold never activates the link.
 */
export function Dock({ children }: { children: ReactNode }) {
  const list = useRef<HTMLUListElement>(null);
  const raf = useRef(0);
  const hold = useRef(0);
  const held = useRef(false);
  const origin = useRef({ x: 0, y: 0 });

  /** Shows the label of the icon under (x, y); no arguments clears it. */
  const tipAt = (x?: number, y?: number) => {
    const hit = x === undefined || y === undefined ? null : document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-dock]");
    list.current?.querySelectorAll<HTMLElement>("[data-dock]").forEach((el) => {
      if (el === hit) el.setAttribute("data-tip", "");
      else el.removeAttribute("data-tip");
    });
  };
  const release = () => {
    clearTimeout(hold.current);
    tipAt();
    // The click that follows a hold lands right after this; swallow it, then forget.
    setTimeout(() => (held.current = false), 400);
  };

  const swell = (x: number | null) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      list.current?.querySelectorAll<HTMLElement>("[data-dock]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const near = x === null ? 0 : Math.max(0, 1 - Math.abs(x - (r.left + r.width / 2)) / 96);
        el.style.setProperty("--s", (1 + 0.4 * near * near).toFixed(3));
      });
    });
  };

  return (
    <nav aria-label="Links" className="absolute top-6 right-8 z-40 max-md:hidden">
      <ul
        ref={list}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          held.current = false;
          origin.current = { x: e.clientX, y: e.clientY };
          hold.current = window.setTimeout(() => {
            held.current = true;
            tipAt(origin.current.x, origin.current.y);
          }, 350);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") return swell(e.clientX);
          if (held.current) tipAt(e.clientX, e.clientY);
          else if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) > 10) clearTimeout(hold.current);
        }}
        onPointerUp={(e) => e.pointerType !== "mouse" && release()}
        onPointerCancel={release}
        onPointerLeave={(e) => e.pointerType === "mouse" && swell(null)}
        onClickCapture={(e) => {
          if (!held.current) return;
          e.preventDefault();
          e.stopPropagation();
        }}
        onContextMenu={(e) => held.current && e.preventDefault()}
        className="flex items-start justify-between gap-1 rounded-3xl border border-line bg-bg/85 px-2 py-2 shadow-sm backdrop-blur-md select-none [-webkit-touch-callout:none] max-md:touch-none md:justify-start md:gap-3 md:px-3"
      >
        {children}
      </ul>
    </nav>
  );
}

/** Wrap a link or button. Give it `dockBtn` and an aria-label. */
export function DockItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li data-dock className="group relative">
      <div className="origin-top scale-[var(--s,1)] transition-[scale] duration-200 ease-[var(--ease-out)]">
        <Magnetic intensity={0.35} range={64} springOptions={{ stiffness: 180, damping: 14, mass: 0.15 }}>
          {children}
        </Magnetic>
      </div>
      <span
        aria-hidden
        className="label pointer-events-none absolute top-full left-1/2 mt-3 -translate-x-1/2 -translate-y-1 rounded-md bg-fg px-2 py-1 whitespace-nowrap !text-bg opacity-0 transition-[opacity,translate] duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 group-data-[tip]:translate-y-0 group-data-[tip]:opacity-100"
      >
        {label}
      </span>
    </li>
  );
}

export const dockBtn =
  "grid size-11 place-items-center md:size-10 rounded-xl bg-fg/5 text-fg transition-colors hover:bg-accent hover:text-bg";

const svg = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const IconUser = () => (
  <svg {...svg}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" /></svg>
);
export const IconMail = () => (
  <svg {...svg}><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></svg>
);
export const IconGithub = () => (
  <svg {...svg}><path d="M9 19c-4 1.2-4-2-5.5-2.5M14.5 21v-3.2c0-.9.1-1.4-.5-2 2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.1 5.8 2.4 5.8 2.4a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 8.8c0 4.7 2.8 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></svg>
);
export const IconLinkedin = () => (
  <svg {...svg}><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5V16M8 7.6v.1M12 16v-3.2a2.3 2.3 0 0 1 4.6 0V16M12 10.5V16" /></svg>
);
export const IconFile = () => (
  <svg {...svg}><path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z" /><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" /></svg>
);
/** Shows a moon in light mode and a sun in dark mode (same `dark:` trick as ThemeToggle). */
export const IconTheme = () => (
  <>
    <svg {...svg} className="dark:hidden"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
    <svg {...svg} className="hidden dark:block"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>
  </>
);
