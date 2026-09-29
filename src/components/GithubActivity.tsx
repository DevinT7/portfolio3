import { site } from "@/content/site";

type Ev = { type: string; created_at: string; repo: { name: string } };

const TZ = "America/Chicago";
const DAYS = 30;
const key = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

/**
 * Live from GitHub's public events API (refreshed hourly on the server): a 30-day strip of
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
            <span
              key={d}
              title={`${d}: ${n} ${n === 1 ? "push" : "pushes"}`}
              className="size-2.5 rounded-[2px] md:size-3"
              style={{ background: n === 0 ? "var(--line)" : "var(--accent)", opacity: n === 0 ? 1 : Math.min(1, 0.35 + n * 0.22) }}
            />
          );
        })}
      </span>
      <span className="label transition-colors group-hover:text-accent">
        {total} pushes · last {when} · {repo}
      </span>
    </a>
  );
}
