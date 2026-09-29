import type { Metadata } from "next";
import Link from "next/link";
import { ScrollEffects } from "@/components/ScrollEffects";
import { TravelMap } from "@/components/TravelMap";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About — Devin Thenuwara",
  description: site.about.line,
};

const at = (i: number) => ({ "--i": i } as React.CSSProperties);

export default function About() {
  const { line, interests, places, photos } = site.about;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 md:px-8">
      <ScrollEffects />

      <header className="rise flex h-16 items-center justify-between md:h-20" data-reveal>
        <Link href="/" className="label text-fg transition-colors hover:text-accent">
          ← {site.name}
        </Link>
        <span className="label">About</span>
      </header>

      <main className="flex-1">
        <section className="grid gap-8 pt-10 pb-12 md:pt-16 md:pb-16 lg:grid-cols-12">
          <h1 className="display rise text-[clamp(4rem,15.5vw,8rem)] lg:col-span-7 lg:text-[min(11vw,10.5rem)]" data-reveal>
            About
          </h1>
          <div className="rise flex flex-col justify-end gap-6 lg:col-span-5" data-reveal style={{ "--d": "150ms" } as React.CSSProperties}>
            <p className="text-lg">{line}</p>
            <ul className="display flex flex-wrap gap-x-5 gap-y-1 text-[clamp(1.75rem,4vw,2.5rem)]">
              {interests.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-label="Photos" className="flex flex-col gap-4">
          {/* Portraits and landscapes each get one shared shape so rows line up. */}
          {[
            { list: photos.filter((p) => p.h > p.w), cols: "sm:grid-cols-3", shape: "aspect-[3/4]" },
            { list: photos.filter((p) => p.h <= p.w), cols: "sm:grid-cols-2 lg:grid-cols-3", shape: "aspect-[4/3]" },
          ].map(({ list, cols, shape }) => (
            <ul key={cols} className={`grid grid-cols-1 gap-4 ${cols}`}>
              {list.map((p, i) => (
                <li key={p.src} className="rise" data-reveal style={at(i)}>
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" className={`w-full rounded-[20px] bg-line object-cover ${shape}`} />
                    <figcaption className="label mt-2">{p.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ))}
        </section>

        <section aria-labelledby="map-label" className="mt-16 md:mt-24">
          <h2 id="map-label" className="label rise mb-3" data-reveal>
            Been to · {places.length}
          </h2>
          <div className="rise" data-reveal>
            <TravelMap places={places} />
          </div>
        </section>
      </main>

      <footer className="rise flex items-end justify-between py-16 md:py-24" data-reveal>
        <Link href="/" className="label text-fg transition-colors hover:text-accent">
          ← Back
        </Link>
        <p className="label">© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
