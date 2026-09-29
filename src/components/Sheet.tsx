"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Entry } from "@/content/site";
import type { Found } from "@/lib/media";
import { Thumb } from "./Thumb";

type Props = {
  entries: (Entry & { found: Found; logo: Found; tint: number })[];
};

/**
 * Side panel for a project (#ibm, #convergent, …). Driven by the URL hash so
 * every panel has a shareable link and the back button closes it.
 */
export function Sheet({ entries }: Props) {
  const [key, setKey] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null); // last opened, kept while closing
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
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={w?.name}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col overflow-y-auto bg-bg outline-none transition-[translate,box-shadow] duration-600 ease-[var(--ease-out)] ${open ? "translate-x-0 shadow-2xl" : "translate-x-full shadow-none"}`}
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
                  {w.shots.map((sh) => (
                    <li key={sh.src} className="shrink-0 snap-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sh.src} alt={sh.alt} loading="lazy" className="h-80 w-auto rounded-[18px] border border-line" />
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

      </div>
    </div>
  );
}
