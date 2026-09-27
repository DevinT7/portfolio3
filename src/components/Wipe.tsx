import type { ReactNode } from "react";

/** A headline line revealed by an accent block sweeping across it. */
export function Wipe({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span data-reveal className={`wipe ${className}`} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      <span className="wipe-text">{children}</span>
    </span>
  );
}
