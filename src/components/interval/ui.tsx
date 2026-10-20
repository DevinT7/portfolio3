"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { latest, series, type Rec, type Status } from "./data";

export const BROWN = "#8b4f1c";
export const PRIMARY = "#904d00";

const P: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  docs: "M7 3h7l5 5v13H7V3zM14 3v5h5M10 13h6M10 17h6",
  meds: "M9.500 4.500l10 10a4 4 0 01-5.700 5.700l-10-10a4 4 0 015.700-5.700zM7 10l7 7",
  chat: "M4 5h16v11H10l-5 4v-4H4V5z",
  profile: "M12 4a4 4 0 100 8 4 4 0 000-8zM4 21c0-4.500 3.500-7 8-7s8 2.500 8 7",
  bell: "M6 16V11a6 6 0 0112 0v5l2 2H4l2-2zM10 21h4",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  scan: "M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M8 12h8",
  check: "M5 12l5 5 9-10",
  drop: "M12 3s6 6.500 6 11a6 6 0 01-12 0c0-4.500 6-11 6-11z",
  fork: "M7 3v8a2 2 0 002 2v8M11 3v6M7 6h4M17 21V3c-2.500 1-3.500 4-3.500 8h3.500",
  arrow: "M5 12h14M13 6l6 6-6 6",
  send: "M12 19V5M6 11l6-6 6 6",
  x: "M6 6l12 12M18 6L6 18",
  steth: "M6 3v6a4 4 0 008 0V3M10 13v2a5 5 0 0010 0v-1M20 12a2 2 0 100 4 2 2 0 000-4z",
  mail: "M4 6h16v12H4V6zM4 7l8 6 8-6",
  spark: "M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800L12 3z",
  warn: "M12 4l9 16H3L12 4zM12 10v4M12 17v.5",
  phone: "M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  walk: "M13 4a1.500 1.500 0 100 3 1.500 1.500 0 000-3zM10 21l2-6-3-3 1-5 3 2 3 1M12 15l3 2v4",
  moon: "M20 14.500A8 8 0 019.500 4 8 8 0 1020 14.500z",
  back: "M15 5l-7 7 7 7",
  plus: "M12 5v14M5 12h14",
  copy: "M8 8h11v12H8V8zM5 16V4h11",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z",
  heart: "M12 20s-8-5-8-11a4.500 4.500 0 018-2.500A4.500 4.500 0 0120 9c0 6-8 11-8 11z",
};

export function Icon({ name, size = 20, fill = false, stroke = 1.8 }: { name: string; size?: number; fill?: boolean; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={P[name] ?? ""} />
    </svg>
  );
}

export const STATUS: Record<Status, { label: string; fg: string; bg: string }> = {
  low: { label: "↓ LOW", fg: "#a43c12", bg: "#ffe0d4" },
  high: { label: "↑ HIGH", fg: "#a43c12", bg: "#ffe0d4" },
  normal: { label: "OK", fg: "#6e3900", bg: "#ffdcc3" },
};

export function Tag({ children, fg = "#a43c12", bg = "#ffdad6" }: { children: ReactNode; fg?: string; bg?: string }) {
  return <span className="inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: fg, background: bg }}>{children}</span>;
}

/** Where sheets render: a layer above the scroll area and tab bar, inside the phone screen. */
export const SheetRoot = createContext<HTMLElement | null>(null);

/** Bottom sheet that lives inside the phone screen. */
export function Sheet({ onClose, children, eyebrow, title }: { onClose: () => void; children: ReactNode; eyebrow?: string; title?: string }) {
  const root = useContext(SheetRoot);
  const sheet = (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-[#241912]/35" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="iv-scroll max-h-[88%] overflow-y-auto rounded-t-[34px] bg-[#fff8f5] px-5 pb-8 pt-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
        <div className="mx-auto h-1 w-10 rounded-full bg-[#d9c3b3]" />
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow && <p className="iv-eyebrow" style={{ color: PRIMARY }}>{eyebrow}</p>}
            {title && <h3 className="mt-1 text-[28px] font-bold leading-tight">{title}</h3>}
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm" style={{ color: PRIMARY }}>Done</button>
        </div>
        {children}
      </div>
    </div>
  );
  return root ? createPortal(sheet, root) : sheet;
}

export function Ring({ done, total, size = 96 }: { done: number; total: number; size?: number }) {
  const r = size / 2 - 7, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffe3d3" strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={PRIMARY} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - (total ? done / total : 0))} style={{ transition: "stroke-dashoffset 500ms ease" }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xl font-semibold">{done}/{total}</span>
    </div>
  );
}

/** "A1C Range": where the latest result sits against the reference range. */
export function RangeCard({ metric, recs }: { metric: string; recs: Rec[] }) {
  const l = latest(metric, recs);
  if (!l) return null;
  const span = l.high - l.low, lo = l.low - span * 0.4, hi = l.high + span * 0.4;
  const pos = Math.min(98, Math.max(2, ((l.value - lo) / (hi - lo)) * 100));
  const s = STATUS[l.status];
  return (
    <div className="iv-soft p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">{metric} Range</p>
        <Tag fg={s.fg} bg={s.bg}>{l.status === "normal" ? "In range" : l.status}</Tag>
      </div>
      <div className="relative mt-3 h-2.5 rounded-full" style={{ background: "linear-gradient(90deg,#ffe3d3 0%,#ffe3d3 40%,#ffd9d4 100%)" }}>
        <i className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#241912] shadow" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-[#564334]"><span>{l.low}</span><span>{l.value} {l.unit} (You)</span><span>{l.high}</span></div>
    </div>
  );
}

/** Small line chart of one metric over time, with the reference band shaded. */
export function Chart({ metric, recs }: { metric: string; recs: Rec[] }) {
  const s = series(metric, recs);
  if (s.length < 2) return null;
  const vals = s.map((x) => x.lab.value), l0 = s[0].lab;
  const min = Math.min(...vals, l0.low), max = Math.max(...vals, l0.high);
  const pad = (max - min) * 0.12, y0 = min - pad, y1 = max + pad;
  const X = (i: number) => 18 + (i / (s.length - 1)) * 264, Y = (v: number) => 8 + (1 - (v - y0) / (y1 - y0)) * 104;
  const d = s.map((x, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(x.lab.value).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 300 140" className="w-full" role="img" aria-label={`${metric} over time`}>
      <rect x="18" y={Y(l0.high)} width="264" height={Math.max(2, Y(l0.low) - Y(l0.high))} fill="#d9f0d9" opacity="0.7" rx="6" />
      <path d={d} fill="none" stroke={PRIMARY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {s.map((x, i) => <circle key={x.date + i} cx={X(i)} cy={Y(x.lab.value)} r="4.500" fill="#fff" stroke={PRIMARY} strokeWidth="2.500" />)}
      {s.map((x, i) => (i === 0 || i === s.length - 1 ? <text key={`t${i}`} x={X(i)} y="134" textAnchor={i ? "end" : "start"} fontSize="10" fill="#897362">{x.date}</text> : null))}
    </svg>
  );
}

export function TrendCard({ metric, recs }: { metric: string; recs: Rec[] }) {
  const s = series(metric, recs);
  if (s.length < 2) return null;
  const a = s.at(-2)!, b = s.at(-1)!, delta = +(b.lab.value - a.lab.value).toFixed(1);
  return (
    <div className="iv-soft p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">{metric} Trend</p>
        <Tag fg="#6e3900" bg="#ffdcc3">{delta > 0 ? "+" : ""}{delta} {b.lab.unit}</Tag>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {[["Previous", a], ["Latest", b]].map(([k, x]) => {
          const v = x as typeof a;
          return (
            <div key={k as string} className="rounded-2xl bg-white p-3">
              <p className="iv-eyebrow !text-[10px]">{k as string}</p>
              <p className="mt-0.5 text-xl font-semibold">{v.lab.value} <span className="text-sm">{v.lab.unit}</span></p>
              <p className="text-xs text-[#897362]">{v.date}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
