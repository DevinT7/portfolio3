"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The Résumé link in the header. Opens a preview of the PDF in a modal, with Download and Open
 * buttons, so visitors don't get sent to a new tab. Phones don't preview PDFs inline well, so
 * they get the buttons instead. Esc or a click outside closes it.
 */
export function ResumeViewer({ href, filename }: { href: string; filename: string }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const page = document.getElementById("page");
    page?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      page?.removeAttribute("inert");
      document.documentElement.style.overflow = "";
      opener.current?.focus({ preventScroll: true });
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const btn = "label inline-flex h-11 items-center px-3 text-fg transition-colors hover:text-accent";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          opener.current = e.currentTarget;
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className="label text-fg transition-colors hover:text-accent"
      >
        Résumé
      </button>

      <div className={`fixed inset-0 z-[55] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={close} className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Résumé"
          tabIndex={-1}
          className={`absolute top-1/2 left-1/2 flex h-[min(92dvh,60rem)] w-[min(94vw,56rem)] -translate-x-1/2 flex-col overflow-hidden rounded-[20px] border border-line bg-bg shadow-2xl outline-none transition-[opacity,scale,translate] duration-500 ease-[var(--ease-out)] ${open ? "-translate-y-1/2 scale-100 opacity-100" : "-translate-y-[46%] scale-95 opacity-0"}`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-line pr-2 pl-5">
            <span className="label text-fg">Résumé</span>
            <div className="flex items-center">
              <a href={href} download={filename} className={btn} tabIndex={open ? 0 : -1}>
                Download ↓
              </a>
              <a href={href} target="_blank" rel="noopener" className={btn} tabIndex={open ? 0 : -1}>
                Open ↗
              </a>
              <button type="button" onClick={close} className={btn} tabIndex={open ? 0 : -1}>
                Close ✕
              </button>
            </div>
          </div>

          {/* Inline preview on larger screens; only loaded once opened. */}
          {open && <iframe src={`${href}#toolbar=0&navpanes=0&view=FitH`} title="Résumé preview" className="hidden min-h-0 w-full flex-1 bg-white md:block" />}
          <div className="grid flex-1 place-items-center p-8 text-center md:hidden">
            <p className="text-muted">A preview isn’t available on phones. Open the résumé or download a copy.</p>
          </div>
        </div>
      </div>
    </>
  );
}
