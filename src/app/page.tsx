import { CopyEmail } from "@/components/CopyEmail";
import { ScrollEffects } from "@/components/ScrollEffects";
import { Wipe } from "@/components/Wipe";
import { WorkList } from "@/components/WorkList";
import { site } from "@/content/site";
import { findMedia } from "@/lib/media";

const links = [...site.links, { label: "Résumé", href: site.resume }];

export default function Home() {
  const work = site.work.map((w) => ({ ...w, found: findMedia(w.media) }));

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-4 md:px-8">
      <ScrollEffects />

      <header className="rise flex h-16 items-center justify-between md:h-20" data-reveal>
        <span className="label text-fg">{site.name}</span>
        <nav aria-label="Links">
          <ul className="flex gap-5">
            {links.map((l) => (
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
        <section className="pt-[12vh] pb-14 md:pt-[16vh] md:pb-20">
          <h1 className="display text-[clamp(4rem,15.5vw,13.5rem)]">
            <span className="block">
              <Wipe delay={100}>Devin</Wipe>
            </span>
            <span className="block">
              <Wipe delay={260}>
                <span className="serif">Thenuwara</span>
              </Wipe>
            </span>
          </h1>

          <div className="rise mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3" data-reveal style={{ "--d": "700ms" } as React.CSSProperties}>
            <p className="text-lg">
              {site.role} <span className="text-muted">— {site.school}</span>
            </p>
            <p className="label inline-flex items-center gap-2 text-fg">
              <span className="size-2 rounded-full bg-accent" aria-hidden />
              {site.status}
            </p>
          </div>
        </section>

        <section aria-label="Work">
          <WorkList items={work} />
        </section>
      </main>

      <footer className="rise flex flex-col gap-6 py-16 md:flex-row md:items-end md:justify-between md:py-24" data-reveal>
        <CopyEmail email={site.email} />
        <p className="label">© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
