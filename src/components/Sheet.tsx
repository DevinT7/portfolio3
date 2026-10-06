"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { Entry } from "@/content/site";
import type { Found } from "@/lib/media";
import { Thumb } from "./Thumb";

type Props = {
  entries: (Entry & { found: Found; logo: Found; tint: number })[];
};

/**
 * Side panel for a project (#ibm, #convergent, …). Driven by the URL hash so
 * every panel has a shareable link and the back button closes it. The panel opens out of the
 * row that opened it and closes back into it: it is clipped to that row's band and the clip
 * eases open (the Morphing Dialog idea from motion-primitives). `clip` is measured once on open
 * and reused on close, so flipping between projects doesn't re-run the morph. Motion's shared
 * `layoutId` was tried first but mis-measures a `fixed` panel on a scrolled page.
 */

/** "slide": panel glides in from the right and back out the same way. "morph": grows out of its row. */
const VARIANT: "slide" | "morph" = "slide";

const PANEL_W = 544; // max-w-[34rem]
const OPEN = "inset(0px 0px 0px 0px)";

/** clip-path that cuts the (right-aligned, full-height) panel down to a row's rectangle. */
function clipTo(id: string) {
  const row = document.querySelector(`ul a[href="#${CSS.escape(id)}"]`)?.closest("li")?.getBoundingClientRect();
  if (!row) return "inset(0px 0px 0px 100%)";
  const left = window.innerWidth - Math.min(PANEL_W, window.innerWidth);
  return `inset(${row.top}px ${window.innerWidth - row.right}px ${window.innerHeight - row.bottom}px ${row.left - left}px)`;
}
export function Sheet({ entries }: Props) {
  const [key, setKey] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null); // last opened, kept while closing
  const [zoom, setZoom] = useState<{ id: string; i: number } | null>(null); // screenshot open full size
  const [clip, setClip] = useState(OPEN);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pushed = useRef(false); // opened by an in-page click, so Back is the right way to close

  useEffect(() => {
    const valid = new Set(entries.map((w) => w.id));
    const sync = (e?: HashChangeEvent) => {
      const h = decodeURIComponent(location.hash.slice(1));
      const next = valid.has(h) ? h : null;
      if (next) {
        pushed.current = !!e;
        opener.current = document.activeElement as HTMLElement;
        setShown(next);
        // Re-measure for whichever project is showing, so close returns to *its* row.
        setClip(clipTo(next));
      }
      setKey(next);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [entries]);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      history.back();
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      setKey(null);
    }
  }, []);

  // While open: lock scroll, make the page inert, focus the panel, Esc to close.
  useEffect(() => {
    if (!key) return;
    const page = document.getElementById("page");
    page?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      page?.removeAttribute("inert");
      document.documentElement.style.overflow = "";
      // Only possible once the page is no longer inert.
      opener.current?.focus({ preventScroll: true });
      window.removeEventListener("keydown", onKey);
    };
  }, [key, close]);

  const open = key !== null;
  const idx = entries.findIndex((e) => e.id === shown);
  const w = idx >= 0 ? entries[idx] : null;
  const prev = idx >= 0 ? entries[(idx - 1 + entries.length) % entries.length] : null;
  const next = idx >= 0 ? entries[(idx + 1) % entries.length] : null;

  // Replace (not push) so Close still returns to the page in one step.
  const go = useCallback((id: string) => {
    panel.current?.scrollTo({ top: 0 });
    location.replace(`#${id}`);
  }, []);

  const shots = w?.shots ?? [];
  const zi = open && zoom && w && zoom.id === w.id && shots[zoom.i] ? zoom.i : null;

  // Full-size screenshot: Esc closes just the viewer, arrows flip screens (captured first so the
  // panel's own Esc / project arrows don't also fire).
  useEffect(() => {
    if (zi === null || !w) return;
    const id = w.id;
    const n = shots.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === "Escape") setZoom(null);
      else setZoom({ id, i: (zi + (e.key === "ArrowRight" ? 1 : n - 1)) % n });
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [zi, w, shots.length]);

  // Left/Right arrows flip between projects while a panel is open.
  useEffect(() => {
    if (!open || !prev || !next) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(prev.id);
      else if (e.key === "ArrowRight") go(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next, go]);

  return (
    <MotionConfig reducedMotion="user">
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity ${open ? "opacity-100 duration-500" : "opacity-0 duration-500"}`}
      />
      <AnimatePresence>
        {open && w && (
          <motion.div
            key="panel"
            ref={panel}
            {...(VARIANT === "slide"
              ? {
                  initial: { x: "100%" },
                  animate: { x: 0 },
                  exit: { x: "100%" },
                  transition: { type: "spring", stiffness: 380, damping: 40, mass: 1 },
                }
              : {
                  initial: { clipPath: clip },
                  animate: { clipPath: OPEN },
                  exit: {
                    clipPath: clip,
                    opacity: 0,
                    // Mirror of the open: contents stay put while the clip closes onto the row
                    // (ease reversed), and the whole panel fades over the last stretch.
                    transition: {
                      clipPath: { duration: 0.55, ease: [0.7, 0, 0.84, 0] },
                      opacity: { duration: 0.25, delay: 0.3, ease: "easeIn" },
                    },
                  },
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                })}
            role="dialog"
            aria-modal="true"
            aria-label={w.name}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 w-full max-w-[34rem] overflow-y-auto bg-bg shadow-2xl outline-none"
          >
            {/* Contents wait for the box to mostly arrive, so they aren't stretched mid-morph. */}
            <motion.div
              className="flex min-h-full flex-col"
              initial={{ opacity: VARIANT === "morph" ? 0 : 1 }}
              animate={{ opacity: 1, transition: { delay: 0.25, duration: 0.3 } }}
            >
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between bg-bg px-6 md:h-20 md:px-8">
          <span className="label">{w && `${w.role} · ${w.when}`}</span>
          <button type="button" onClick={close} className="label -mr-3 h-11 px-3 text-fg hover:text-accent">
            Close ✕
          </button>
        </div>

        {w && (
          <article key={w.id} className="flex flex-col gap-8 px-6 pb-12 md:px-8">
            <div className="aspect-[16/10] overflow-hidden rounded-[20px]">
              <Thumb found={w.found} logo={w.logo} name={w.name} i={w.tint} size="text-5xl" />
            </div>
            <div>
              <h2 className="display text-[clamp(3rem,9vw,4.5rem)]">{w.name}</h2>
              <p className="mt-4 text-lg leading-relaxed">{w.summary}</p>
            </div>
            <ul className="border-t border-line">
              {w.did.map((d) => (
                <li key={d} className="flex gap-3 border-b border-line py-3.5 leading-relaxed">
                  <span className="mt-[0.7em] h-0.5 w-3 shrink-0 bg-accent" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>
            {w.shots && w.shots.length > 0 && (
              <div>
                <p className="label mb-3">Screens</p>
                {/* Bleeds to the panel edge so it reads as scrollable. */}
                <ul className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 md:-mx-8 md:px-8">
                  {w.shots.map((sh, i) => (
                    <li key={sh.src} className="shrink-0 snap-start">
                      <button type="button" onClick={() => setZoom({ id: w.id, i })} aria-label={`View larger: ${sh.alt}`} className="block cursor-zoom-in rounded-[18px] outline-offset-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sh.src} alt="" loading="lazy" className="h-80 w-auto rounded-[18px] border border-line transition-opacity hover:opacity-90" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {w.links && w.links.length > 0 && (
              <div className="flex gap-5">
                {w.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener" className="label text-fg hover:text-accent">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
            {w.stack && <p className="font-mono text-sm text-muted">{w.stack.join(" · ")}</p>}
            {prev && next && (
              <nav aria-label="Other projects" className="flex justify-between gap-4 border-t border-line pt-5">
                <button type="button" onClick={() => go(prev.id)} className="label -ml-2 h-11 px-2 text-fg hover:text-accent">
                  ← {prev.name}
                </button>
                <button type="button" onClick={() => go(next.id)} className="label -mr-2 h-11 px-2 text-fg hover:text-accent">
                  {next.name} →
                </button>
              </nav>
            )}
          </article>
        )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {zi !== null && (
        <div role="dialog" aria-modal="true" aria-label="Screenshot viewer" className="viewer-in absolute inset-0 z-10 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shots[zi].src} alt={shots[zi].alt} onClick={(e) => e.stopPropagation()} className="max-h-[86dvh] max-w-[92vw] rounded-[24px] object-contain shadow-2xl" />
          <button type="button" onClick={() => setZoom(null)} className="label absolute top-3 right-3 h-11 px-3 !text-white/80 hover:!text-white md:top-5 md:right-6">
            Close ✕
          </button>
          {shots.length > 1 && (
            <>
              <button type="button" aria-label="Previous screen" onClick={(e) => { e.stopPropagation(); setZoom({ id: w!.id, i: (zi + shots.length - 1) % shots.length }); }} className="label absolute left-2 h-12 w-12 !text-white/80 hover:!text-white md:left-6">
                ←
              </button>
              <button type="button" aria-label="Next screen" onClick={(e) => { e.stopPropagation(); setZoom({ id: w!.id, i: (zi + 1) % shots.length }); }} className="label absolute right-2 h-12 w-12 !text-white/80 hover:!text-white md:right-6">
                →
              </button>
              <p className="label absolute bottom-3 left-1/2 -translate-x-1/2 !text-white/70">
                {zi + 1} / {shots.length}
              </p>
            </>
          )}
        </div>
      )}
    </div>
    </MotionConfig>
  );
}
