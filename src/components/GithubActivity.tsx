import { site } from "@/content/site";

type Ev = { type: string; created_at: string; repo: { name: string } };

const TZ = "America/Chicago";
const DAYS = 30;
const key = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

/**
 * Live from GitHub's public events API (refreshed hourly on the server): a section in the same
 * style as Work and Leadership, with a 30-day bar chart of pushes and a link to the last repo.
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
  const max = Math.max(1, ...count.values());
  const last = pushes[0];
  const when = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(new Date(last.created_at));
  const repo = last.repo.name.split("/").pop();

  return (
    <section aria-labelledby="activity-label" className="mt-20 md:mt-28">
      <div className="rise mb-4 flex items-baseline justify-between" data-reveal>
        <h2 id="activity-label" className="display text-[clamp(1.5rem,2.6vw,2rem)]">
          Activity
        </h2>
        <span className="label">
          {total} pushes · {DAYS} days
        </span>
      </div>

      <div className="rise border-t border-line pt-6" data-reveal>
        <div
          role="img"
          aria-label={`${total} GitHub pushes in the last ${DAYS} days, most recently to ${repo} on ${when}.`}
          className="flex h-20 items-end gap-[3px] md:h-24 md:gap-1"
        >
          {days.map((d) => {
            const n = count.get(d) ?? 0;
            return (
              <span
                key={d}
                title={`${d}: ${n} ${n === 1 ? "push" : "pushes"}`}
                className="flex-1 rounded-t-[3px]"
                style={{
                  height: n === 0 ? "4px" : `${Math.max(18, (n / max) * 100)}%`,
                  background: n === 0 ? "var(--line)" : "var(--accent)",
                  opacity: n === 0 ? 1 : 0.45 + 0.55 * (n / max),
                }}
              />
            );
          })}
        </div>
        <div className="label mt-2 flex justify-between">
          <span>{DAYS} days ago</span>
          <span>Today</span>
        </div>
      </div>

      <a
        href={`https://github.com/${last.repo.name}`}
        target="_blank"
        rel="noopener"
        className="rise group mt-6 flex items-baseline justify-between gap-6 border-y border-line py-4 outline-offset-4"
        data-reveal
      >
        <span className="text-lg">
          <span className="label mr-4">Last push</span>
          {repo} <span className="text-muted">· {when}</span>
        </span>
        <span className="label transition-colors group-hover:text-accent">GitHub ↗</span>
      </a>
    </section>
  );
}
