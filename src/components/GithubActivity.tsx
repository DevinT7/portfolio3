import { site } from "@/content/site";

type Ev = { type: string; created_at: string; repo: { name: string } };

const TZ = "America/Chicago";
const DAYS = 14;
const key = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

/** "2026-09-18" -> "September 18th", like GitHub's contribution tooltips. */
function nice(k: string) {
  const [y, m, d] = k.split("-").map(Number);
  const month = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
  const suffix = d % 100 >= 11 && d % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[d % 10] ?? "th";
  return `${month} ${d}${suffix}`;
}

/**
 * Live from GitHub's public events API (refreshed hourly on the server): a 14-day strip of
 * squares, one per day, shaded by how many pushes you made, plus the last repo pushed to.
 * Renders nothing if GitHub can't be reached.
 */
export async function GithubActivity() {
  let events: Ev[] = [];
  try {
    const res = await fetch(`https://api.github.com/users/${site.github}/events/public?per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    events = await res.json();
  } catch {
    return null;
  }
  const pushes = events.filter((e) => e.type === "PushEvent");
  if (!pushes.length) return null;

  const today = new Date();
  const days = Array.from({ length: DAYS }, (_, i) => key(new Date(today.getTime() - (DAYS - 1 - i) * 86_400_000)));
  const count = new Map(days.map((d) => [d, 0]));
  for (const e of pushes) {
    const k = key(new Date(e.created_at));
    if (count.has(k)) count.set(k, count.get(k)! + 1);
  }
  const total = [...count.values()].reduce((a, b) => a + b, 0);
  const last = pushes[0];
  const when = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(new Date(last.created_at));
  const repo = last.repo.name.split("/").pop();

  return (
    <a
      href={`https://github.com/${last.repo.name}`}
      target="_blank"
      rel="noopener"
      className="group flex flex-wrap items-center gap-x-5 gap-y-3 outline-offset-4"
      aria-label={`GitHub: ${total} pushes in the last ${DAYS} days. Last push to ${repo} on ${when}.`}
    >
      <span className="label text-fg">GitHub</span>
      <span className="flex gap-[3px]" aria-hidden>
        {days.map((d) => {
          const n = count.get(d) ?? 0;
          return (
            <span key={d} className="group/sq relative">
              <span
                className="block size-2.5 rounded-[2px] transition-transform duration-150 group-hover/sq:scale-125 md:size-3"
                style={{ background: n === 0 ? "var(--line)" : "var(--accent)", opacity: n === 0 ? 1 : Math.min(1, 0.35 + n * 0.22) }}
              />
              {/* Tooltip in the style of GitHub's contribution graph. */}
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 rounded-lg bg-fg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-bg opacity-0 shadow-lg transition-[opacity,translate] duration-150 group-hover/sq:translate-y-0 group-hover/sq:opacity-100"
              >
                {n === 0 ? "No pushes" : `${n} ${n === 1 ? "push" : "pushes"}`} on {nice(d)}.
                <span className="absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-fg" aria-hidden />
              </span>
            </span>
          );
        })}
      </span>
      <span className="label transition-colors group-hover:text-accent">
        {total} pushes · last {when} · {repo}
      </span>
    </a>
  );
}
