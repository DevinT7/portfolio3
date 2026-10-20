import type { CSSProperties, ReactNode } from "react";

/** Stroke icons (Ionicons-style outlines, as the app uses for incident types and actions). */
const P: Record<string, string> = {
  Theft: "M6 8h12l1 12H5L6 8zM9 8V7a3 3 0 016 0v1",
  Assault: "M12 4l9 16H3L12 4zM12 10v4M12 17v.5",
  Burglary: "M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5",
  Vandalism: "M4 20l7-7M14 6l4 4M12 8l4-4 4 4-4 4M4 20l3-1 2-2-2-2-2 2-1 3z",
  Harassment: "M12 4a4 4 0 100 8 4 4 0 000-8zM5 20c0-4 3-6 7-6s7 2 7 6",
  Other: "M5 12h.01M12 12h.01M19 12h.01",
  Drugs: "M9 4h6M10 4v5l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V4",
  up: "M7 11v9H4v-9h3zM7 11l4-7c1.5 0 2.5 1 2 3l-.5 3H19a2 2 0 012 2.3l-1 6a2 2 0 01-2 1.7H7",
  down: "M7 13V4H4v9h3zM7 13l4 7c1.5 0 2.5-1 2-3l-.5-3H19a2 2 0 002-2.3l-1-6A2 2 0 0018 3H7",
  comment: "M12 4c4.5 0 8 3 8 7s-3.5 7-8 7c-1 0-2-.2-3-.5L5 20l1-3.5C4.5 15.200 4 13.200 4 11c0-4 3.500-7 8-7z",
  flag: "M5 21V4M5 4h12l-2.500 4 2.500 4H5",
  pin: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 7.500a2.500 2.500 0 100 5 2.500 2.500 0 000-5z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  back: "M15 5l-7 7 7 7",
  x: "M6 6l12 12M18 6L6 18",
  send: "M4 12l16-8-6 16-3-7-7-1z",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  filter: "M4 7h16M7 12h10M10 17h4",
  locate: "M12 4v3M12 17v3M4 12h3M17 12h3M12 8.500a3.500 3.500 0 100 7 3.500 3.500 0 000-7z",
  directions: "M12 3l9 9-9 9-9-9 9-9zM9 12h6M13 10l2 2-2 2",
  gear: "M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 00-.1-1.200l2-1.500-2-3.400-2.300.9a7 7 0 00-2.100-1.200L14 3h-4l-.5 2.600a7 7 0 00-2.100 1.200l-2.300-.9-2 3.400 2 1.500A7 7 0 005 12c0 .4 0 .8.100 1.200l-2 1.500 2 3.400 2.300-.9c.6.500 1.300.9 2.100 1.200L10 21h4l.5-2.600c.8-.3 1.500-.7 2.100-1.200l2.300.9 2-3.400-2-1.500c.1-.4.100-.8.100-1.200z",
  check: "M5 12l5 5 9-10",
};

export function Icon({ name, size = 20, color = "currentColor", stroke = 1.8 }: { name: string; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={P[name] ?? P.Other} />
    </svg>
  );
}

/** Filled glyphs for the bottom tab bar. `cut` is the bar color used for the knock-out details. */
export function TabGlyph({ id, size = 26 }: { id: string; size?: number }) {
  const cut = "#fbfbfc";
  const s = { width: size, height: size } as CSSProperties;
  const common = { viewBox: "0 0 24 24", style: s, "aria-hidden": true } as const;
  if (id === "home")
    return <svg {...common} fill="currentColor"><path d="M12 2.500L2 11.500h3V21h5.500v-6h3v6H19V11.500h3L12 2.500z" /></svg>;
  if (id === "feed")
    return <svg {...common}><circle cx="12" cy="12" r="10.500" fill="currentColor" /><circle cx="11" cy="11" r="4.200" fill="none" stroke={cut} strokeWidth="1.900" /><path d="M14.200 14.200l3.500 3.500" stroke={cut} strokeWidth="2" strokeLinecap="round" /></svg>;
  if (id === "map")
    return <svg {...common} fill="currentColor"><path d="M2 5.500l6-2.500v15.500l-6 2.500V5.500zM9.500 3l5 2.500V21l-5-2.500V3zM16 5.500l6-2.500v15.500l-6 2.500V5.500z" /></svg>;
  if (id === "report")
    return <svg {...common}><path d="M4 3.500h16a1.500 1.500 0 011.500 1.500v10a1.500 1.500 0 01-1.500 1.500h-6l-2 4-2-4H4A1.500 1.500 0 012.500 15V5A1.500 1.500 0 014 3.500z" fill="currentColor" /><path d="M12 7v4.500" stroke={cut} strokeWidth="2.200" strokeLinecap="round" /><circle cx="12" cy="14" r="1.200" fill={cut} /></svg>;
  return <svg {...common} fill="currentColor"><path d="M3 4h11a1.500 1.500 0 011.500 1.500v6A1.500 1.500 0 0114 13H8l-3 2.500V13H3A1.500 1.500 0 011.500 11.500v-6A1.500 1.500 0 013 4zM17 8h4a1.500 1.500 0 011.500 1.500v6A1.500 1.500 0 0121 17h-1v2.500L17 17h-5v-2.500h2A3.500 3.500 0 0017.500 11V8z" /></svg>;
}

export const BLUE = "#007aff";
export const RED = "#ff6b6b";
export const GREEN = "#28a745";
export const AMBER = "#ffa500";

/** Round colored icon tile, as on the home screen's quick actions. */
export function Tile({ color, children, size = 48 }: { color: string; children: ReactNode; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full text-white" style={{ background: color, width: size, height: size }}>
      {children}
    </span>
  );
}
