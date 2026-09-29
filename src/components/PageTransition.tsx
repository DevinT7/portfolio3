import { ViewTransition } from "react";

/**
 * Wraps a page so route changes slide in the direction of travel: links tagged
 * `transitionTypes={["nav-forward"]}` go deeper (home -> About), `nav-back` returns.
 * Untagged changes (browser back, refresh) get no animation. See globals.css for the motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const dir = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" } as const;
  return (
    <ViewTransition enter={dir} exit={dir} default="none">
      {children}
    </ViewTransition>
  );
}
