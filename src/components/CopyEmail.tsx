"use client";

import { useRef, useState } from "react";

/**
 * Click to copy. Hover pops the whole row slightly (the label scales with the address so they never overlap). After Watermelon's Inline Toast: on click the
 * label blur-swaps to a checkmark and an accent bar sweeps under the address.
 */
const HOLD = 1800;

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(false);
      requestAnimationFrame(() => setCopied(true)); // restart the sweep on a quick second click
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), HOLD);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex origin-left items-baseline gap-3 text-left text-[clamp(1.25rem,2.6vw,2rem)] font-medium tracking-tight transition-transform duration-300 ease-[var(--ease-out)] hover:scale-[1.04] focus-visible:scale-[1.04]"
    >
      <span className="relative">
        {email}
        {copied && <span aria-hidden className="copy-sweep absolute inset-x-0 -bottom-1 h-0.5 bg-accent" style={{ "--hold": `${HOLD}ms` } as React.CSSProperties} />}
      </span>
      <span className="label relative inline-grid" aria-live="polite">
        <span className={`copy-swap col-start-1 row-start-1 ${copied ? "is-out" : ""}`}>Copy</span>
        <span className={`copy-swap col-start-1 row-start-1 inline-flex items-center gap-1.5 text-accent ${copied ? "" : "is-out"}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
          Copied
        </span>
      </span>
    </button>
  );
}
