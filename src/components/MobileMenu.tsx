"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ResumeViewer } from "@/components/ResumeViewer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/content/site";

/**
 * Phone-only navigation: a fixed hamburger at the top right (it stays put while you scroll) that
 * slides a drawer in from the right with every link the desktop dock has, spelled out. The dock is
 * hidden below `md`; this is hidden at `md` and up. Lives on <body> so page transforms can't
 * break `fixed`. Esc, the scrim, the close button, or picking a link closes it.
 */
export function MobileMenu({ current }: { current: "home" | "about" }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    const btn = opener.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      btn?.focus({ preventScroll: true });
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted) return null;

  const close = () => setOpen(false);
  const row =
    "flex min-h-14 w-full items-center justify-between border-b border-line py-3 text-left text-2xl tracking-tight text-fg transition-colors active:text-accent";
  const arrow = <span aria-hidden className="label">↗</span>;

  return createPortal(
    <div className="md:hidden">
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed top-4 right-4 z-40 grid size-11 place-items-center rounded-xl border border-line bg-bg/85 text-fg shadow-sm backdrop-blur-md"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} inert={!open}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          className={`absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col border-l border-line bg-bg px-6 pb-8 outline-none transition-[translate] duration-500 ease-[var(--ease-out)] ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex h-[4.5rem] shrink-0 items-center justify-between">
            <span className="label">Menu</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="-mr-2 grid size-11 place-items-center rounded-xl text-fg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav aria-label="Menu" className="flex flex-col border-t border-line">
            <Link
              href={current === "home" ? "/about" : "/"}
              transitionTypes={[current === "home" ? "nav-forward" : "nav-back"]}
              onClick={close}
              className={row}
            >
              {current === "home" ? "About" : "Home"}
            </Link>
            <a href={`mailto:${site.email}`} onClick={close} className={row}>
              Email {arrow}
            </a>
            {site.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener" onClick={close} className={row}>
                {l.label} {arrow}
              </a>
            ))}
            <div onClickCapture={close}>
              <ResumeViewer href={site.resume} filename="Devin-Thenuwara-Resume.pdf" className={row}>
                Résumé
              </ResumeViewer>
            </div>
            <ThemeToggle className={row}>
              <span>Theme</span>
              <span className="label">
                <span className="dark:hidden">Dark</span>
                <span className="hidden dark:inline">Light</span>
              </span>
            </ThemeToggle>
          </nav>
        </div>
      </div>
    </div>,
    document.body,
  );
}
