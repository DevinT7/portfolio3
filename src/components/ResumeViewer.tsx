"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/**
 * The Résumé link in the header. Opens a preview of the PDF in a modal, with Download and Open
 * buttons, so visitors don't get sent to a new tab. The pages are drawn with PDF.js (loaded only
 * when the modal opens) into our own scrolling area, because browsers' built-in PDF viewers
 * won't scroll reliably inside an iframe. Esc or a click outside closes it.
 */
export function ResumeViewer({
  href,
  filename,
  className = "label text-fg transition-colors hover:text-accent",
  children = "Résumé",
}: {
  href: string;
  filename: string;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // portal exists once the button has been used
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const panel = useRef<HTMLDivElement>(null);
  const pages = useRef<HTMLDivElement>(null);
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

  // Draw every page of the PDF as a canvas, sized to the width of the scrolling area.
  useEffect(() => {
    const host = pages.current;
    if (!open || !host) return;
    let dead = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const doc = await pdfjs.getDocument({ url: href }).promise;
        if (dead) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        host.replaceChildren();
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (dead) return;
          const fit = host.clientWidth / page.getViewport({ scale: 1 }).width;
          const vp = page.getViewport({ scale: fit * dpr });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          canvas.className = "block w-full bg-white shadow-sm";
          canvas.setAttribute("role", "img");
          canvas.setAttribute(
            "aria-label",
            `Résumé, page ${n} of ${doc.numPages}`,
          );
          host.appendChild(canvas);
          await page.render({ canvas, viewport: vp }).promise;
          if (n === 1) setStatus("ready");
        }
      } catch {
        if (!dead) setStatus("error");
      }
    })();
    return () => {
      dead = true;
    };
  }, [open, href]);

  // The modal lives on <body>, outside #page, because #page goes inert while it is open.
  const btn =
    "label inline-flex h-11 items-center px-3 text-fg transition-colors hover:text-accent";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          opener.current = e.currentTarget;
          setStatus("loading");
          setMounted(true);
          // Next frame, so the modal mounts closed and animates open.
          requestAnimationFrame(() => setOpen(true));
        }}
        aria-haspopup="dialog"
        aria-label="Résumé"
        className={className}
      >
        {children}
      </button>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[55] ${open ? "" : "pointer-events-none"}`}
            aria-hidden={!open}
          >
            <div
              onClick={close}
              className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
            />
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
                  <a
                    href={href}
                    download={filename}
                    className={btn}
                    tabIndex={open ? 0 : -1}
                  >
                    Download ↓
                  </a>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener"
                    className={btn}
                    tabIndex={open ? 0 : -1}
                  >
                    Open ↗
                  </a>
                  <button
                    type="button"
                    onClick={close}
                    className={btn}
                    tabIndex={open ? 0 : -1}
                  >
                    Close ✕
                  </button>
                </div>
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-auto bg-black/5 p-3 md:p-6"
                tabIndex={open ? 0 : -1}
                aria-label="Résumé pages"
              >
                <div
                  ref={pages}
                  className="mx-auto flex max-w-[52rem] flex-col gap-4"
                />
                {status === "loading" && (
                  <p className="label py-16 text-center">Loading…</p>
                )}
                {status === "error" && (
                  <p className="py-16 text-center text-muted">
                    The preview didn’t load. Use Open or Download above.
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
