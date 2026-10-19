import { site } from "@/content/site";

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

type Repo = { name: string; full_name: string; pushed_at: string };
type Commit = { commit: { author: { date: string } } };

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

/**
 * Live from GitHub (refreshed every 10 minutes on the server): a 14-day strip of squares, one per day,
 * shaded by how many commits you made, plus the last repo pushed to. The public events feed lags and drops
 * pushes, so this reads recently pushed repos and their commits directly. Set GITHUB_TOKEN to lift the
 * 60 req/hr unauthenticated limit. Renders nothing if GitHub can't be reached.
 */
export async function GithubActivity() {
  let repos: Repo[] = [];
  try {
    const res = await fetch(`https://api.github.com/users/${site.github}/repos?sort=pushed&per_page=15`, {
      headers,
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    repos = await res.json();
  } catch {
    return null;
  }
  if (!repos.length) return null;

  const today = new Date();
  const days = Array.from({ length: DAYS }, (_, i) => key(new Date(today.getTime() - (DAYS - 1 - i) * 86_400_000)));
  const count = new Map(days.map((d) => [d, 0]));
  const since = new Date(today.getTime() - (DAYS + 1) * 86_400_000).toISOString();
  const active = repos.filter((r) => r.pushed_at >= since);
  const lists = await Promise.all(
    active.map(async (r): Promise<Commit[]> => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${r.full_name}/commits?author=${site.github}&since=${since}&per_page=100`,
          { headers, next: { revalidate: 600 } },
        );
        return res.ok ? await res.json() : [];
      } catch {
        return [];
      }
    }),
  );
  for (const c of lists.flat()) {
    const k = key(new Date(c.commit.author.date));
    if (count.has(k)) count.set(k, count.get(k)! + 1);
  }
  const total = [...count.values()].reduce((a, b) => a + b, 0);
  const last = repos[0];
  const when = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(new Date(last.pushed_at));
  const repo = last.name;

  return (
    <a
      href={`https://github.com/${last.full_name}`}
      target="_blank"
      rel="noopener"
      className="group flex flex-wrap items-center gap-x-5 gap-y-3 outline-offset-4"
      aria-label={`GitHub: ${total} commits in the last ${DAYS} days. Last push to ${repo} on ${when}.`}
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
                {n === 0 ? "No commits" : `${n} ${n === 1 ? "commit" : "commits"}`} on {nice(d)}.
                <span className="absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-fg" aria-hidden />
              </span>
            </span>
          );
        })}
      </span>
      <span className="label transition-colors group-hover:text-accent">
        {total} commits · last {when} · {repo}
      </span>
    </a>
  );
}
