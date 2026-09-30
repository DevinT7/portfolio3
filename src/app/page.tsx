import Link from "next/link";
import { CopyEmail } from "@/components/CopyEmail";
import { ScrollEffects } from "@/components/ScrollEffects";
import { Sheet } from "@/components/Sheet";
import { Ski, SkiButton } from "@/components/Ski";
import { F1, F1Button } from "@/components/F1";
import { Ask, AskButton } from "@/components/Ask";
import { PageTransition } from "@/components/PageTransition";
import { ResumeViewer } from "@/components/ResumeViewer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GithubActivity } from "@/components/GithubActivity";
import { LapRail } from "@/components/LapRail";
import { Wipe } from "@/components/Wipe";
import { EntryList } from "@/components/EntryList";
import { Thumb } from "@/components/Thumb";
import { Intro } from "@/components/Intro";
import { NavOrigin } from "@/components/NavOrigin";
import { site } from "@/content/site";
import { findMedia } from "@/lib/media";

const facts = [
  ["Role", site.role],
  ["School", site.school],
  ["Based", site.base],
  ["Status", site.status],
  ["Now", site.now],
  ["Before", site.before],
];
const external = site.links;

export default function Home() {
  const withMedia = <T extends { id: string }>(list: T[], offset: number) =>
    list.map((e, i) => ({ ...e, found: findMedia(`work/${e.id}`), logo: findMedia(`logo/${e.id}`), tint: i + offset }));
  const work = withMedia(site.work, 0);
  const projects = withMedia(site.projects, site.work.length);
  const leadership = withMedia(site.leadership, site.work.length + site.projects.length);
  const photo = findMedia("me");

  return (
    <>
      <PageTransition>
      <div id="page" className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 md:px-8">
        <a href="#work-label" className="label fixed top-2 left-2 z-[70] -translate-y-16 bg-fg px-3 py-2 !text-bg focus:translate-y-0">
          Skip to work
        </a>
        <ScrollEffects />
        <NavOrigin />
        <Intro name={site.name} />

        <header className="rise flex h-16 items-center justify-end md:h-20 md:justify-between" data-reveal>
          <span />
          <nav aria-label="Links">
            <ul className="flex items-baseline gap-4 md:gap-6">
              <li>
                <Link href="/about" transitionTypes={["nav-forward"]} className="label text-fg transition-colors hover:text-accent">
                  About
                </Link>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="label text-fg transition-colors hover:text-accent">
                  Email
                </a>
              </li>
              {external.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener" className="label text-fg transition-colors hover:text-accent">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <ResumeViewer href={site.resume} filename="Devin-Thenuwara-Resume.pdf" />
              </li>
              <li>
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </header>

        <main className="flex-1">
          <section className="grid gap-8 pt-8 pb-10 md:pt-12 md:pb-12 lg:grid-cols-12 lg:items-stretch">
            <div className="flex flex-col justify-between gap-12 lg:col-span-8">
              <h1 className="hero-name display text-[clamp(3rem,6.5vw,5rem)]">
                <span className="block">
                  <Wipe delay={100}>Devin</Wipe>
                </span>
                <span className="block">
                  <Wipe delay={260}>
                    <span className="serif">Thenuwara</span>
                  </Wipe>
                </span>
              </h1>

              <dl className="hero-facts grid grid-cols-1 border-t border-line sm:grid-cols-2">
                {facts.map(([k, v], i) => (
                  <div key={k} className={`rise items-baseline gap-6 border-b border-line py-3 ${i >= 4 ? "hidden sm:flex sm:border-b-0" : i === 3 ? "flex border-b-0 sm:border-b" : "flex"}`} data-reveal style={{ "--i": i, "--d": "400ms" } as React.CSSProperties}>
                    <dt className="label w-16 shrink-0">{k}</dt>
                    <dd className="text-lg">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="hero-photo rise mx-auto w-full max-w-[280px] lg:col-span-3 lg:col-start-10 lg:mx-0 lg:max-w-none" data-reveal style={{ "--d": "400ms" } as React.CSSProperties}>
              <div className="aspect-[4/5] overflow-hidden rounded-[20px]">
                <Thumb found={photo} name="Photo" i={2} position="50% 85%" alt={site.name} />
              </div>
            </figure>
          </section>

          <div className="rise pb-12 md:pb-16" data-reveal>
            <GithubActivity />
          </div>

          <section aria-labelledby="work-label">
            <div className="rise mb-4 flex items-baseline justify-between" data-reveal style={{ "--d": "450ms" } as React.CSSProperties}>
              <h2 id="work-label" className="section-title display text-[clamp(1.5rem,2.6vw,2rem)]">
                Work
              </h2>
              <span className="label">{String(work.length).padStart(2, "0")}</span>
            </div>
            <EntryList items={work} />
          </section>

          <section aria-labelledby="projects-label" className="mt-16 md:mt-20">
            <div className="rise mb-4 flex items-baseline justify-between" data-reveal>
              <h2 id="projects-label" className="section-title display text-[clamp(1.5rem,2.6vw,2rem)]">
                Projects
              </h2>
              <span className="label">{String(projects.length).padStart(2, "0")}</span>
            </div>
            <EntryList items={projects} size="md" />
          </section>

          <section aria-labelledby="leadership-label" className="mt-16 md:mt-20">
            <div className="rise mb-4 flex items-baseline justify-between" data-reveal>
              <h2 id="leadership-label" className="section-title display text-[clamp(1.5rem,2.6vw,2rem)]">
                Leadership
              </h2>
              <span className="label">{String(leadership.length).padStart(2, "0")}</span>
            </div>
            <EntryList items={leadership} size="sm" />
          </section>
        </main>

        <footer className="rise flex flex-col gap-6 py-16 md:flex-row md:items-end md:justify-between md:py-24" data-reveal>
          <CopyEmail email={site.email} />
          <div className="flex items-center gap-6">
            <AskButton />
            <SkiButton />
            <F1Button />
            <p className="label">© {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
      </PageTransition>

      <LapRail />
      <Ski />
      <F1 />
      <Ask />
      <Sheet entries={[...work, ...projects, ...leadership]} />
    </>
  );
}
