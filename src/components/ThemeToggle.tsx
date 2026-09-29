"use client";

/**
 * Light/dark switch. The label comes from CSS (`dark:` variants keyed on <html data-theme>),
 * so it's right on first paint with no state to hydrate. The choice is saved in localStorage.
 */
export function ThemeToggle() {
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
    <button type="button" onClick={flip} className="label -mx-1 inline-flex h-11 items-center px-1 text-fg transition-colors hover:text-accent" aria-label="Switch between light and dark theme">
      <span className="dark:hidden">Dark</span>
      <span className="hidden dark:inline">Light</span>
    </button>
  );
}
