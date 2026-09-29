"use client";

import { useState } from "react";
import type { Entry } from "@/content/site";

/**
 * A list of entries (work or leadership). Hovering a row dims the others and nudges its name. Clicking opens the project panel
 * (see <Sheet />) via the URL hash.
 */
const SIZES = {
  lg: { name: "text-[clamp(2rem,4.6vw,3.75rem)]", pad: "md:py-5", delay: "500ms" },
  md: { name: "text-[clamp(1.75rem,3.4vw,2.75rem)]", pad: "md:py-4", delay: "0ms" },
  sm: { name: "text-[clamp(1.5rem,2.8vw,2.25rem)]", pad: "md:py-3.5", delay: "0ms" },
} as const;

export function EntryList({
  items,
  size = "lg",
}: {
  items: Entry[];
  /** Name size: lg for Work, md for Projects, sm for Leadership. */
  size?: keyof typeof SIZES;
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <ul className="border-b border-line" onPointerLeave={() => setActive(null)}>
      {items.map((w, i) => {
        const dim = active !== null && active !== i;
        return (
          <li key={w.id} className="rise border-t border-line" data-reveal style={{ "--i": i, "--d": SIZES[size].delay } as React.CSSProperties}>
            <a
              href={`#${w.id}`}
              onPointerEnter={() => setActive(i)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(null)}
              className={`group grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-4 transition-opacity duration-500 outline-offset-4 md:grid-cols-[4rem_1fr_1fr_9rem] ${SIZES[size].pad} ${dim ? "opacity-30" : ""}`}
            >
              <span className="label hidden md:block">{w.year}</span>
              <span className={`display ${SIZES[size].name} transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-3 group-focus-visible:translate-x-3`}>
                {w.name}
              </span>
              <span className="col-start-1 row-start-2 text-muted md:col-start-auto md:row-start-auto">{w.what}</span>
              <span className="text-right font-mono text-sm">{w.stat}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
