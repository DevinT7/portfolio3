"use client";

import { latest, type Med, type Rec } from "./data";
import { Icon, PRIMARY, Ring, Tag } from "./ui";
import type { Tab } from "./IntervalApp";

type Props = { meds: Med[]; toggle: (id: string) => void; recs: Rec[]; go: (t: Tab) => void; health: boolean; trend: (m: string) => void; toast: (m: string) => void };

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export function Home({ meds, toggle, recs, go, health, trend, toast }: Props) {
  const done = meds.filter((m) => m.taken).length;
  const a1c = latest("A1C", recs);
  const stats = [
    { icon: "walk", label: "Steps", value: health ? "6,420" : "No data", pct: 64 },
    { icon: "moon", label: "Sleep", value: health ? "7h 12m" : "0h 0m", pct: 80 },
    { icon: "drop", label: "Water", value: health ? "48 oz" : "No data", pct: 55 },
  ];
  const day = [...meds].sort((a, b) => a.hour - b.hour);

  return (
    <div className="px-5 pb-32 pt-[76px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="iv-eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
          <h2 className="iv-title mt-2">{greeting()},<br />Devin.</h2>
        </div>
        <button type="button" onClick={() => go("profile")} aria-label="Open profile" className="grid h-12 w-12 place-items-center rounded-full border border-[#f0c9a6] bg-[#ffdcc3] text-base font-semibold" style={{ color: PRIMARY }}>DT</button>
      </div>

      <div className="iv-card mt-5 flex items-center gap-4 p-4">
        <Ring done={done} total={meds.length} size={84} />
        <div className="min-w-0">
          <p className="text-[19px] font-semibold">Today&apos;s meds</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {meds.map((m) => (
              <button key={m.id} type="button" onClick={() => { toggle(m.id); toast(m.taken ? `${m.name} unmarked` : `${m.name} logged`); }} aria-pressed={m.taken} className="rounded-full border px-3 py-1 text-[13px] font-semibold" style={m.taken ? { background: "#ffeadd", borderColor: "#ecc9ad", color: "#6e3900" } : { background: "#ffdcc3", borderColor: "#f3b693", color: "#a43c12" }}>
                {m.taken ? "✓ " : `${m.time.replace(":00", "").replace(" ", "")} `}{m.name.split(" ")[0].slice(0, 7)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <button key={s.label} type="button" onClick={() => toast(health ? `${s.label} from Apple Health` : "Connect Apple Health in Profile.")} className="iv-card !rounded-[22px] p-3 text-left">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#897362]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#ffe3d3] text-[#e0703a]"><Icon name={s.icon} size={13} /></span>{s.label}</span>
            <p className="mt-2.5 text-[15px] font-semibold leading-tight">{s.value}</p>
            <span className="mt-2.5 block h-1.5 rounded-full bg-[#ffe3d3]"><i className="block h-full rounded-full" style={{ width: health ? `${s.pct}%` : 0, background: PRIMARY, transition: "width 500ms" }} /></span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-[28px] border border-[#ecc9ad] bg-[#ffeadd] p-5">
        <div className="flex items-center justify-between"><Tag fg="#6e3900" bg="#fff">Flag</Tag><span className="iv-eyebrow">New</span></div>
        <p className="mt-3 text-[19px] font-semibold leading-snug">A1C result came back elevated</p>
        <p className="mt-2 text-[15px] leading-snug text-[#564334]">From the lab you scanned yesterday. Tap to review.</p>
        <button type="button" onClick={() => trend("A1C")} className="mt-3 rounded-full border border-[#f0c9a6] bg-[#ffdcc3] px-4 py-2 text-[15px] font-semibold" style={{ color: PRIMARY }}>See trend</button>
        <p className="mt-3 text-xs text-[#897362]">Latest {a1c?.value}% · range 4 to 5.6</p>
      </div>

      <p className="iv-eyebrow mt-7" style={{ color: PRIMARY }}>Today</p>
      <h3 className="mt-1 text-[28px] font-bold leading-tight">Your day</h3>
      <ul className="mt-3 flex flex-col gap-2.5">
        {day.map((m) => (
          <li key={m.id} className="iv-card !rounded-[20px] flex items-center gap-3 p-3.5">
            <span className="w-14 text-xs font-medium text-[#897362]">{m.time}</span>
            <span className="min-w-0 flex-1 text-[15px] font-semibold">{m.name}</span>
            <Tag fg={m.taken ? "#6e3900" : "#705d00"} bg={m.taken ? "#ffeadd" : "#ffe16d"}>{m.taken ? "Done" : "Next"}</Tag>
          </li>
        ))}
        <li className="iv-card !rounded-[20px] flex items-center gap-3 p-3.5">
          <span className="w-14 text-xs font-medium text-[#897362]">7:30 AM</span>
          <span className="min-w-0 flex-1 text-[15px] font-semibold">Morning walk (2.1mi)</span>
          <Tag fg="#6e3900" bg="#ffeadd">Done</Tag>
        </li>
      </ul>
    </div>
  );
}
