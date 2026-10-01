"use client";

import { useRef, useState } from "react";
import { TravelMap } from "./TravelMap";

type Place = { name: string; lat: number; lon: number };
type Photo = { src: string; alt: string; caption: string; place: string; w: number; h: number };

const at = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * The photo grid and the travel map, linked. Click a pin (or a place name) and that
 * place's photos open under the map; click a photo and the map flies to where it was taken.
 */
export function Explore({ photos, places }: { photos: Photo[]; places: Place[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const map = useRef<HTMLDivElement>(null);

  const showOnMap = (p: Photo) => {
    const i = places.findIndex((pl) => pl.name === p.place);
    if (i < 0) return;
    setSel(i);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
  };

  const portraits = photos.filter((p) => p.h > p.w);
  const here = sel === null ? [] : photos.filter((p) => p.place === places[sel].name);

  return (
    <>
      <section aria-label="Photos" className="flex flex-col gap-4">
        {/* Portraits and landscapes each get one shared shape so rows line up. */}
        {[
          // Four portraits sit in a 2x2 / 4-up grid; otherwise three across.
          { list: portraits, cols: portraits.length % 4 === 0 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3", shape: "aspect-[3/4]" },
          { list: photos.filter((p) => p.h <= p.w), cols: "sm:grid-cols-2 lg:grid-cols-3", shape: "aspect-[4/3]" },
        ].map(({ list, cols, shape }) => (
          <ul key={cols} className={`grid grid-cols-1 gap-4 ${cols}`}>
            {list.map((p, i) => {
              // A lone last photo on the desktop row becomes a wide banner instead of leaving a gap.
              const wide = cols.includes("lg:grid-cols-3") && list.length % 3 === 1 && i === list.length - 1;
              return (
                <li key={p.src} className={`rise ${wide ? "lg:col-span-3" : ""}`} data-reveal style={at(i)}>
                  <figure>
                    <button
                      type="button"
                      onClick={() => showOnMap(p)}
                      aria-label={`${p.caption}: show on the map`}
                      className="group block w-full cursor-pointer rounded-[20px] text-left outline-offset-4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.src}
                        alt={p.alt}
                        width={p.w}
                        height={p.h}
                        loading="lazy"
                        className={`w-full rounded-[20px] bg-line object-cover ${wide ? "lg:aspect-[21/9]" : shape}`}
                      />
                      <figcaption className="label mt-2 transition-colors group-hover:text-accent">
                        {p.caption} <span aria-hidden className="opacity-0 transition-opacity group-hover:opacity-100">↓ Map</span>
                      </figcaption>
                    </button>
                  </figure>
                </li>
              );
            })}
          </ul>
        ))}
      </section>

      <section aria-labelledby="map-label" className="mt-16 md:mt-24">
        <h2 id="map-label" className="label rise mb-3" data-reveal>
          Been to · {places.length}
        </h2>
        <div ref={map} className="rise" data-reveal>
          <TravelMap places={places} selected={sel} onSelect={setSel} />
        </div>

        {/* Photos from the selected place. */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)] ${here.length ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          aria-live="polite"
        >
          <div className="overflow-hidden">
            {sel !== null && (
              <>
                <p className="label mb-3">
                  {places[sel].name} · {here.length} {here.length === 1 ? "photo" : "photos"}
                </p>
                <ul className="flex flex-wrap gap-3">
                  {here.map((p) => (
                    <li key={p.src}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt={p.alt} loading="lazy" className="h-40 w-auto rounded-[14px] bg-line object-cover md:h-52" />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
