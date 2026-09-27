import { CopyEmail } from "@/components/CopyEmail";
import { ScrollEffects } from "@/components/ScrollEffects";
import { Sheet } from "@/components/Sheet";
import { Thumb } from "@/components/Thumb";
import { Wipe } from "@/components/Wipe";
import { EntryList } from "@/components/EntryList";
import { Intro } from "@/components/Intro";
import { Letters } from "@/components/Letters";
import { site } from "@/content/site";
import { findMedia } from "@/lib/media";

const external = [...site.links, { label: "Résumé", href: site.resume }];

export default function Home() {
  const withMedia = <T extends { id: string }>(list: T[], offset: number) =>
    list.map((e, i) => ({ ...e, found: findMedia(`work/${e.id}`), tint: i + offset }));
  const work = withMedia(site.work, 0);
  const leadership = withMedia(site.leadership, site.work.length);
  const photo = findMedia("me");

  return (
    <>
      <div id="page" className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 md:px-8">
        <ScrollEffects />
        <Intro />

        <header className="rise flex h-16 items-center justify-between md:h-20" data-reveal>
          <span className="label text-fg">{site.name}</span>
          <nav aria-label="Links">
            <ul className="flex gap-4 md:gap-6">
              <li>
                <a href="#about" className="label text-fg transition-colors hover:text-accent">
                  About
                </a>
              </li>
              {external.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener" className="label text-fg transition-colors hover:text-accent">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="flex-1">
          <section className="grid items-end gap-8 pt-10 pb-12 md:pt-16 md:pb-16 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 id="name" className="display relative z-10 w-fit text-[clamp(4rem,15.5vw,8rem)] lg:text-[min(11vw,10.5rem)]">
                <span className="sr-only">{site.name}</span>
                <span className="block" aria-hidden>
                  <Wipe delay={100}>
                    <Letters text="Devin" />
                  </Wipe>
                </span>
                <span className="block" aria-hidden>
                  <Wipe delay={260}>
                    <span className="serif">
                      <Letters text="Thenuwara" start={5} />
                    </span>
                  </Wipe>
                </span>
              </h1>

              <div className="rise mt-8 flex flex-wrap items-center gap-x-8 gap-y-3" data-reveal style={{ "--d": "700ms" } as React.CSSProperties}>
                <p className="text-lg">
                  {site.role} <span className="text-muted">— {site.school}</span>
                </p>
                <p className="label inline-flex items-center gap-2 text-fg">
                  <span className="size-2 rounded-full bg-accent" aria-hidden />
                  {site.status}
                </p>
              </div>
            </div>

            <figure className="rise hidden lg:col-span-3 lg:col-start-10 lg:block" data-reveal style={{ "--d": "400ms" } as React.CSSProperties}>
              <div className="aspect-[4/5] overflow-hidden rounded-[20px]">
                <Thumb found={photo} name="Photo" i={2} position="50% 85%" alt={site.name} />
              </div>
            </figure>
          </section>

          <section aria-labelledby="work-label">
            <h2 id="work-label" className="label rise mb-3" data-reveal style={{ "--d": "450ms" } as React.CSSProperties}>
              Work
            </h2>
            <EntryList items={work} />
          </section>

          <section aria-labelledby="leadership-label" className="mt-16 md:mt-20">
            <h2 id="leadership-label" className="label rise mb-3" data-reveal>
              Leadership
            </h2>
            <EntryList items={leadership} small offset={site.work.length} />
          </section>
        </main>

        <footer className="rise flex flex-col gap-6 py-16 md:flex-row md:items-end md:justify-between md:py-24" data-reveal>
          <CopyEmail email={site.email} />
          <p className="label">© {new Date().getFullYear()}</p>
        </footer>
      </div>

      <Sheet entries={[...work, ...leadership]} about={{ ...site.about, photo: findMedia("me-about") ?? photo }} />
    </>
  );
}
