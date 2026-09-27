"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-baseline gap-3 text-left text-[clamp(1.5rem,4vw,3rem)] font-medium tracking-tight"
    >
      <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_0.12em] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-[var(--ease-out)] group-hover:bg-[length:100%_0.12em]">
        {email}
      </span>
      <span className="label" aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
