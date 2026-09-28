"use client";

import { useState } from "react";
import { MAP, MAP_ROWS } from "@/content/world-dots";

type Place = { name: string; lat: number; lon: number };

// Equirectangular: 1 viewBox unit = 1 degree.
const W = MAP.lon1 - MAP.lon0;
const H = MAP.lat0 - MAP.lat1;
const X = (lon: number) => lon - MAP.lon0;
const Y = (lat: number) => MAP.lat0 - lat;
const ZOOM = 3.2;

// One path for all ~6,800 land dots: each dot is a zero-length segment with a round cap,
// written with relative moves along each row to keep the string small.
const DOTS = MAP_ROWS.split("\n")
  .map((row, r) => {
    if (!row) return "";
    const cols = row.split(" ").map(Number);
    const y = (r * MAP.step).toFixed(2);
    return cols
      .map((c, i) => (i === 0 ? `M${(c * MAP.step + MAP.step / 2).toFixed(2)} ${y}h0` : `m${((c - cols[i - 1]) * MAP.step).toFixed(2)} 0h0`))
      .join("");
  })
  .join("");

/**
 * Close places (Cancún and Cozumel, Denver/Durango/Santa Fe) would sit on top of each other,
 * so pins are pushed apart until they're MIN degrees apart (clear once zoomed in), with a pull
 * back toward the true spot. A thin line marks where each nudged pin really is.
 */
const MIN = 2.4;
function spread(places: Place[]) {
  const home = places.map((p) => ({ x: X(p.lon), y: Y(p.lat) }));
  const pos = home.map((p) => ({ ...p }));
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        let dx = pos[j].x - pos[i].x;
        let dy = pos[j].y - pos[i].y;
        let d = Math.hypot(dx, dy);
        if (d >= MIN) continue;
        if (d < 1e-6) [dx, dy, d] = [1, 0.3, 1.04];
        const push = (MIN - d) / 2 / d;
        pos[i].x -= dx * push;
        pos[i].y -= dy * push;
        pos[j].x += dx * push;
        pos[j].y += dy * push;
      }
    }
    for (let i = 0; i < pos.length; i++) {
      pos[i].x += (home[i].x - pos[i].x) * 0.04;
      pos[i].y += (home[i].y - pos[i].y) * 0.04;
    }
  }
  return pos.map((p, i) => ({ ...p, hx: home[i].x, hy: home[i].y }));
}

/**
 * Whole-world dotted map. Click anywhere (or a pin) to zoom in around it; click again or
 * press "World" to zoom back out. Pins keep their size while the map scales.
 */
export function TravelMap({ places }: { places: Place[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null);
  const pins = spread(places);

  const z = focus ? ZOOM : 1;
  // Translate (in % of the layer) so the focus point sits in the middle, clamped to the edges.
  const clamp = (v: number) => Math.max(100 - 100 * z, Math.min(0, v));
  const tx = focus ? clamp(50 - (focus.x / W) * 100 * z) : 0;
  const ty = focus ? clamp(50 - (focus.y / H) * 100 * z) : 0;

  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (focus) return setFocus(null);
    const r = e.currentTarget.getBoundingClientRect();
    setFocus({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
  };

  return (
    <div onPointerLeave={() => setActive(null)}>
      <div className="relative">
        <div
          className={`relative w-full overflow-hidden rounded-[14px] ${focus ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          style={{ aspectRatio: `${W} / ${H}` }}
          onClick={onMapClick}
        >
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-700 ease-[var(--ease-out)]"
            style={{ transform: `translate(${tx}%, ${ty}%) scale(${z})` }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
              <path d={DOTS} stroke="var(--muted)" strokeOpacity={0.4} strokeWidth={0.8} strokeLinecap="round" />
              {pins.map((p, i) =>
                Math.hypot(p.x - p.hx, p.y - p.hy) > 0.4 ? (
                  <g key={i} stroke="var(--muted)" strokeWidth={0.12} opacity={active === i ? 1 : 0.7}>
                    <line x1={p.hx} y1={p.hy} x2={p.x} y2={p.y} />
                    <circle cx={p.hx} cy={p.hy} r={0.25} fill="var(--muted)" stroke="none" />
                  </g>
                ) : null,
              )}
            </svg>

            <ul>
              {places.map((pl, i) => {
                const home = i === 0;
                const on = active === i;
                const p = pins[i];
                const edge = !focus && p.x / W < 0.15 ? "left-[-10px]" : !focus && p.x / W > 0.85 ? "right-[-10px]" : "left-0 -translate-x-1/2";
                return (
                  <li
                    key={pl.name}
                    className={`absolute transition-transform duration-700 ease-[var(--ease-out)] ${on ? "z-20" : home ? "z-10" : ""}`}
                    style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, transform: `scale(${1 / z})`, transformOrigin: "0 0" }}
                  >
                    <button
                      type="button"
                      aria-label={home ? `${pl.name} (home)` : pl.name}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!focus) setFocus({ x: p.x, y: p.y });
                        setActive(i);
                      }}
                      className="absolute top-0 left-0 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                    >
                      {home && <span className="absolute size-3 animate-ping rounded-full bg-accent opacity-40 motion-reduce:hidden" />}
                      <span
                        className={`relative rounded-full bg-accent ring-[1.5px] ring-bg transition-transform duration-300 ${home ? "size-2.5" : "size-1.5"} ${on ? "scale-[1.8]" : ""}`}
                      />
                    </button>
                    <span
                      role="tooltip"
                      className={`pointer-events-none absolute bottom-3 ${edge} rounded-full bg-fg px-3 py-1.5 text-sm whitespace-nowrap text-bg transition-[opacity,translate] duration-300 ${on ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
                    >
                      {pl.name}
                      {home && <span className="opacity-60"> · Home</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFocus(null)}
          tabIndex={focus ? 0 : -1}
          className={`label absolute top-2 right-2 h-8 rounded-full border border-line bg-bg px-3 text-fg transition-opacity duration-300 ${focus ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          World
        </button>
        <p className={`label pointer-events-none absolute right-2 bottom-1 transition-opacity duration-300 ${focus ? "opacity-0" : "opacity-100"}`}>
          Click to zoom
        </p>
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
        {places.map((p, i) => (
          <li key={p.name}>
            <button
              type="button"
              onPointerEnter={() => setActive(i)}
              onClick={() => {
                setFocus({ x: pins[i].x, y: pins[i].y });
                setActive(i);
              }}
              className={`transition-colors hover:text-fg ${active === i ? "text-fg" : ""}`}
            >
              {p.name}
              {i === 0 && <span className="text-accent"> ●</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
