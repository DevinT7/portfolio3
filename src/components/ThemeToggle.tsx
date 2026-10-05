"use client";

import type { ReactNode } from "react";

/**
 * Light/dark switch. The label comes from CSS (`dark:` variants keyed on <html data-theme>),
 * so it's right on first paint with no state to hydrate. The choice is saved in localStorage.
 */
export function ThemeToggle({ className = "label block text-fg transition-colors hover:text-accent", children }: { className?: string; children?: ReactNode } = {}) {
  const flip = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.classList.add("theme-fade");
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTimeout(() => root.classList.remove("theme-fade"), 400);
  };

  return (
    <button type="button" onClick={flip} className={className} aria-label="Switch between light and dark theme">
      {children ?? (
        <>
          <span className="dark:hidden">Dark</span>
          <span className="hidden dark:inline">Light</span>
        </>
      )}
    </button>
  );
}
