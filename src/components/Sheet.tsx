"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Entry } from "@/content/site";
import type { Found } from "@/lib/media";
import { Thumb } from "./Thumb";

type Props = {
  entries: (Entry & { found: Found; tint: number })[];
  about: { line: string; interests: string[]; photo: Found };
};

/**
 * Side panel for a project (#ibm, #convergent, …) or #about. Driven by the URL hash so
 * every panel has a shareable link and the back button closes it.
 */
export function Sheet({ entries, about }: Props) {
  const [key, setKey] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null); // last opened, kept while closing
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pushed = useRef(false); // opened by an in-page click, so Back is the right way to close

  useEffect(() => {
    const valid = new Set(["about", ...entries.map((w) => w.id)]);
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
  const w = entries.find((e) => e.id === shown) ?? null;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-fg/25 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={w ? w.name : "About"}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col overflow-y-auto bg-bg outline-none transition-[translate,box-shadow] duration-600 ease-[var(--ease-out)] ${open ? "translate-x-0 shadow-2xl" : "translate-x-full shadow-none"}`}
      >
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between bg-bg px-6 md:h-20 md:px-8">
          <span className="label">{w ? `${w.role} · ${w.when}` : "About"}</span>
          <button type="button" onClick={close} className="label -mr-3 h-11 px-3 text-fg hover:text-accent">
            Close ✕
          </button>
        </div>

        {w && (
          <article key={w.id} className="flex flex-col gap-8 px-6 pb-12 md:px-8">
            <div className="aspect-[16/10] overflow-hidden rounded-[20px]">
              <Thumb found={w.found} name={w.name} i={w.tint} size="text-5xl" />
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
            {w.stack && <p className="font-mono text-sm text-muted">{w.stack.join(" · ")}</p>}
            {w.links && w.links.length > 0 && (
              <div className="flex gap-5">
                {w.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener" className="label text-fg hover:text-accent">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
          </article>
        )}

        {shown === "about" && (
          <article className="flex flex-col gap-8 px-6 pb-12 md:px-8">
            <div className="aspect-[4/5] w-2/3 overflow-hidden rounded-[20px]">
              <Thumb found={about.photo} name="Photo" i={2} size="text-3xl" position="50% 85%" />
            </div>
            <p className="text-lg">{about.line}</p>
            <div>
              <p className="label mb-3">Into</p>
              <ul className="display flex flex-wrap gap-x-5 gap-y-1 text-[clamp(2rem,6vw,3rem)]">
                {about.interests.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
