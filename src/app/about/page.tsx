import type { Metadata } from "next";
import Link from "next/link";
import { ScrollEffects } from "@/components/ScrollEffects";
import { NavOrigin } from "@/components/NavOrigin";
import { PageTransition } from "@/components/PageTransition";
import { SiteDock } from "@/components/SiteDock";
import { Explore } from "@/components/Explore";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About — Devin Thenuwara",
  description: site.about.line,
};

export default function About() {
  const { line, interests, places, photos } = site.about;

  return (
    <PageTransition>
    <div id="page" className="relative mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 md:px-8">
      <ScrollEffects />
      <NavOrigin />

      <header
        className="rise flex h-20 items-center justify-between"
        data-reveal
      >
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="label hidden origin-left text-fg transition-[color,transform] duration-300 ease-[var(--ease-out)] hover:scale-105 hover:text-accent md:inline-block"
        >
          ← {site.name}
        </Link>
      </header>
      <SiteDock current="about" />

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
          transitionTypes={["nav-back"]}
          className="label inline-block origin-left text-fg transition-[color,transform] duration-300 ease-[var(--ease-out)] hover:scale-105 hover:text-accent"
        >
          ← Back
        </Link>
        <p className="label">© {new Date().getFullYear()}</p>
      </footer>
    </div>
    </PageTransition>
  );
}
