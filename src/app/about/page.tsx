import type { Metadata } from "next";
import Link from "next/link";
import { ScrollEffects } from "@/components/ScrollEffects";
import { Explore } from "@/components/Explore";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About — Devin Thenuwara",
  description: site.about.line,
};

export default function About() {
  const { line, interests, places, photos } = site.about;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 md:px-8">
      <ScrollEffects />

      <header
        className="rise flex h-16 items-center justify-between md:h-20"
        data-reveal
      >
        <Link
          href="/"
          className="label text-fg transition-colors hover:text-accent"
        >
          ← {site.name}
        </Link>
        <span className="label">About</span>
      </header>

      <main className="flex-1">
        <section className="grid gap-8 pt-10 pb-12 md:pt-16 md:pb-16 lg:grid-cols-12">
          <h1
            className="display rise text-[clamp(4rem,15.5vw,8rem)] lg:col-span-7 lg:text-[min(11vw,10.5rem)]"
            data-reveal
          >
            About
          </h1>
          <div
            className="rise flex flex-col justify-end gap-6 lg:col-span-5"
            data-reveal
            style={{ "--d": "150ms" } as React.CSSProperties}
          >
            <p className="text-lg">{line}</p>
            <ul className="display flex flex-wrap gap-x-5 gap-y-1 text-[clamp(1.75rem,4vw,2.5rem)]">
              {interests.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        <Explore photos={photos} places={places} />
      </main>

      <footer
        className="rise flex items-end justify-between py-16 md:py-24"
        data-reveal
      >
        <Link
          href="/"
          className="label text-fg transition-colors hover:text-accent"
        >
          ← Back
        </Link>
        <p className="label">© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
