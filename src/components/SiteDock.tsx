import Link from "next/link";
import { Dock, DockItem, dockBtn, IconFile, IconGithub, IconLinkedin, IconMail, IconTheme, IconUser } from "@/components/Dock";
import { MobileMenu } from "@/components/MobileMenu";
import { ResumeViewer } from "@/components/ResumeViewer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/content/site";

/** The top-right dock, shared by the home and About pages. `current` swaps the first icon: About on home, Home on About. */
export function SiteDock({ current }: { current: "home" | "about" }) {
  return (
    <>
    <MobileMenu current={current} />
    <Dock>
      <DockItem label={current === "home" ? "About" : "Home"}>
        <Link href={current === "home" ? "/about" : "/"} transitionTypes={[current === "home" ? "nav-forward" : "nav-back"]} aria-label={current === "home" ? "About" : "Home"} className={dockBtn}>
          {current === "home" ? <IconUser /> : <IconHome />}
        </Link>
      </DockItem>
      <DockItem label="Email">
        <a href={`mailto:${site.email}`} aria-label="Email" className={dockBtn}>
          <IconMail />
        </a>
      </DockItem>
      {site.links.map((l) => (
        <DockItem key={l.label} label={l.label}>
          <a href={l.href} target="_blank" rel="noopener" aria-label={l.label} className={dockBtn}>
            {l.label === "GitHub" ? <IconGithub /> : <IconLinkedin />}
          </a>
        </DockItem>
      ))}
      <DockItem label="Résumé">
        <ResumeViewer href={site.resume} filename="Devin-Thenuwara-Resume.pdf" className={dockBtn}>
          <IconFile />
        </ResumeViewer>
      </DockItem>
      <DockItem label="Theme">
        <ThemeToggle className={dockBtn}>
          <IconTheme />
        </ThemeToggle>
      </DockItem>
    </Dock>
    </>
  );
}

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5" />
  </svg>
);
