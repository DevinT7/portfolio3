"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type ViewerPhoto = { src: string; alt: string; caption: string; place: string; w: number; h: number };

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const RADIUS = 20; // matches the grid thumbnails

/** Transform + clip that make `to` look like `from`, with the clip cropping like object-fit: cover. */
function pose(from: DOMRect, to: DOMRect) {
  const s = Math.max(from.width / to.width, from.height / to.height);
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const cx = Math.max(0, (to.width * s - from.width) / 2 / s);
  const cy = Math.max(0, (to.height * s - from.height) / 2 / s);
  return { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(${cy}px ${cx}px round ${RADIUS / s}px)` };
}
const REST = { transform: "none", clipPath: `inset(0px round ${RADIUS}px)` };

const thumbRect = (src: string) => document.querySelector(`img[data-photo="${CSS.escape(src)}"]`)?.getBoundingClientRect() ?? null;
const onScreen = (r: DOMRect | null): r is DOMRect => !!r && r.bottom > 0 && r.top < window.innerHeight;

/**
 * Full-size photo. It grows out of the thumbnail you clicked and shrinks back into it (plain Web
 * Animations, same idea as the project panel). Arrow keys flip photos; Esc closes.
 */
export function PhotoViewer({
  photos,
  index,
  canMap,
  onNav,
  onClose,
  onMap,
}: {
  photos: ViewerPhoto[];
  index: number;
  canMap: (p: ViewerPhoto) => boolean;
  onNav: (i: number) => void;
  onClose: () => void;
  onMap: (p: ViewerPhoto) => void;
}) {
  const p = photos[index];
  const img = useRef<HTMLImageElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);
  const [shown, setShown] = useState(false);
  const closing = useRef(false);
  const first = useRef(true); // morph only the photo that was clicked, not ones reached by arrows
  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Size the image to fit the screen, keeping its shape.
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const fit = () => {
      const k = Math.min((window.innerWidth * 0.92) / p.w, (window.innerHeight * 0.78) / p.h, 1.6);
      setBox({ w: Math.round(p.w * k), h: Math.round(p.h * k) });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [p.w, p.h]);

  // Grow out of the thumbnail.
  useLayoutEffect(() => {
    const el = img.current;
    if (!el || !box.w || !first.current) return;
    first.current = false;
    const from = thumbRect(p.src);
    const to = el.getBoundingClientRect();
    if (from && !still()) el.animate([pose(from, to), REST], { duration: 600, easing: EASE });
    setShown(true);
  }, [box.w, p.src]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    const el = img.current;
    const to = el?.getBoundingClientRect();
    const from = thumbRect(photos[index].src);
    if (!el || !to || !onScreen(from) || still()) {
      el?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" });
      setTimeout(onClose, 250);
      return;
    }
    // Shrink onto the thumbnail; it stays hidden until we unmount, so it only reappears on landing.
    const a = el.animate([REST, pose(from, to)], { duration: 650, easing: EASE, fill: "forwards" });
    a.finished.then(onClose, onClose);
  }, [index, photos, onClose]);

  // Hide the grid thumbnail of the photo being viewed, so it isn't visible underneath until we land.
  useEffect(() => {
    const t = document.querySelector<HTMLElement>(`img[data-photo="${CSS.escape(p.src)}"]`);
    if (t) t.style.visibility = "hidden";
    return () => {
      if (t) t.style.visibility = "";
    };
  }, [p.src]);

  useEffect(() => {
    root.current?.focus({ preventScroll: true });
    document.documentElement.style.overflow = "hidden";
    const o = opener.current;
    return () => {
      document.documentElement.style.overflow = "";
      o?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") onNav((index + photos.length - 1) % photos.length);
      else if (e.key === "ArrowRight") onNav((index + 1) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, onNav, index, photos.length]);

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={p.caption} tabIndex={-1} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 outline-none">
      <div onClick={close} className={`absolute inset-0 bg-bg/85 backdrop-blur-md transition-opacity ${shown ? "opacity-100 duration-500" : "opacity-0 duration-500"}`} />
      {box.w > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={img} key={p.src} src={p.src} alt={p.alt} width={box.w} height={box.h} style={{ width: box.w, height: box.h, borderRadius: RADIUS }} className="relative max-w-none object-cover shadow-2xl" />
      )}
      <div className={`relative flex items-center gap-6 transition-opacity duration-300 ${shown ? "opacity-100 delay-300" : "opacity-0"}`}>
        <span className="label text-fg">{p.caption}</span>
        {canMap(p) && (
          <button type="button" onClick={() => onMap(p)} className="label h-11 text-fg transition-colors hover:text-accent">
            Show on map ↓
          </button>
        )}
        <button type="button" onClick={close} className="label h-11 text-fg transition-colors hover:text-accent">
          Close ✕
        </button>
      </div>
    </div>
  );
}
