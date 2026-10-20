"use client";

import { useState } from "react";
import { checkPair, EXTRA_MEDS, type Issue, type Med } from "./data";
import { Icon, PRIMARY, Sheet, Tag } from "./ui";

type Props = { meds: Med[]; toggle: (id: string) => void; add: (m: Med) => void; toast: (m: string) => void };
const TABS = ["Schedule", "All meds", "Interactions", "Streak"] as const;
const TIMES = ["7:00 AM", "8:00 AM", "12:00 PM", "1:00 PM", "6:00 PM", "9:00 PM"];
const SEV: Record<Issue["severity"], { fg: string; bg: string }> = { Review: { fg: "#705d00", bg: "#ffe16d" }, Careful: { fg: "#a43c12", bg: "#ffdcc3" }, "High risk": { fg: "#93000a", bg: "#ffdad6" } };
const hourOf = (t: string) => { const [h, rest] = t.split(":"); return (+h % 12) + (rest.includes("PM") ? 12 : 0); };

export function Meds({ meds, toggle, add, toast }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Schedule");
  const taken = meds.filter((m) => m.taken).length;
  const sorted = [...meds].sort((a, b) => a.hour - b.hour);
  const nextId = sorted.find((m) => !m.taken)?.id;

  return (
    <div className="px-5 pb-32 pt-[76px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="iv-eyebrow" style={{ color: PRIMARY }}>{new Date().toLocaleDateString("en-US", { weekday: "long" })} · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          <h2 className="iv-title mt-1.5">Medications</h2>
          <p className="mt-1.5 text-[15px] font-medium text-[#564334]"><span style={{ color: PRIMARY }}>{taken} taken</span> · {meds.length - taken} remaining today</p>
        </div>
        <button type="button" onClick={() => toast(meds.length - taken ? `${meds.length - taken} doses still to take today.` : "All caught up.")} aria-label="Reminders" className="relative grid h-12 w-12 place-items-center rounded-2xl border border-[#ddc1ae] bg-white" style={{ color: PRIMARY }}>
          <Icon name="bell" size={22} />
          {meds.length - taken > 0 && <i className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold not-italic text-white" style={{ background: PRIMARY }}>{meds.length - taken}</i>}
        </button>
      </div>

      <div className="iv-card mt-4 p-4">
        <div className="flex items-baseline justify-between"><span className="iv-eyebrow">Daily goal</span><span className="text-2xl font-bold">{taken}<span className="text-base font-medium text-[#897362]"> / {meds.length}</span></span></div>
        <div className="mt-2.5 flex gap-2">{meds.map((m) => <i key={m.id} className="h-2 flex-1 rounded-full" style={{ background: m.taken ? PRIMARY : "#e4cfc0", transition: "background 300ms" }} />)}</div>
        <p className="mt-2.5 text-sm text-[#564334]">{meds.length - taken ? `${meds.length - taken} dose${meds.length - taken > 1 ? "s" : ""} left to hit today's goal.` : "Goal hit. Nice work."}</p>
      </div>

      <div className="mt-4 grid grid-cols-4 rounded-full border border-[#ddc1ae] bg-[#fff1e9] p-1 text-[12.5px] font-semibold">
        {TABS.map((t) => <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className="h-10 rounded-full" style={tab === t ? { background: PRIMARY, color: "#fff" } : undefined}>{t}</button>)}
      </div>

      {tab === "Schedule" && (
        <ul className="mt-5 flex flex-col gap-4">
          {sorted.map((m) => (
            <li key={m.id} className="flex gap-3">
              <div className="w-[62px] shrink-0 pt-1 text-right"><p className="whitespace-nowrap text-[13px] font-semibold text-[#564334]">{m.time}</p><p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: m.taken ? "#897362" : PRIMARY }}>{m.taken ? "Taken" : m.id === nextId ? "Upcoming" : "Later"}</p></div>
              <div className="iv-card min-w-0 flex-1 p-3.5" style={m.taken ? undefined : undefined}>
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff1e9] text-[#897362]"><Icon name="meds" size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2"><p className="truncate text-[17px] font-semibold" style={m.taken ? { textDecoration: "line-through", color: "#7a6659" } : undefined}>{m.name}</p><span className="shrink-0 text-[14px] font-semibold text-[#564334]">{m.time}</span></div>
                    <p className="mt-0.5 text-sm text-[#564334]">{m.note}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1e9] px-3 py-1.5 text-[13px] font-medium text-[#564334]"><Icon name={m.food ? "fork" : "drop"} size={14} />{m.food ? "With food" : "With water"}</span>
                  <button type="button" onClick={() => { toggle(m.id); toast(m.taken ? `${m.name} unmarked` : `${m.name} logged`); }} aria-pressed={m.taken} className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold" style={m.taken ? { background: PRIMARY, color: "#fff" } : { background: "#fff", border: `1.5px solid ${PRIMARY}`, color: PRIMARY }}>
                    {m.taken && <Icon name="check" size={15} stroke={2.6} />}{m.taken ? "Taken" : "Take"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "All meds" && <All meds={meds} add={add} toast={toast} />}
      {tab === "Interactions" && <Interactions meds={meds} />}
      {tab === "Streak" && <Streak taken={taken} total={meds.length} />}
    </div>
  );
}

function All({ meds, add, toast }: { meds: Med[]; add: (m: Med) => void; toast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [time, setTime] = useState("9:00 PM");
  const [issues, setIssues] = useState<Issue[] | null>(null);

  const commit = () => {
    add({ id: `m${Date.now()}`, name: name.trim(), dose: "1 tablet", form: "tablet", time, hour: hourOf(time), note: "Added just now", food: false, left: 30, taken: false });
    toast(`${name.trim()} added`);
    setOpen(false); setName(""); setIssues(null);
  };
  const check = () => {
    if (!name.trim()) return;
    const found = meds.map((m) => checkPair(name, m.name)).filter((x): x is Issue => !!x);
    if (found.length) setIssues(found); else commit();
  };

  return (
    <div className="mt-5">
      <ul className="flex flex-col gap-3">
        {meds.map((m) => (
          <li key={m.id} className="iv-card flex items-center gap-3 p-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff1e9] text-[#897362]"><Icon name="meds" size={20} /></span>
            <div className="min-w-0 flex-1"><p className="text-[16px] font-semibold">{m.name}</p><p className="text-[13px] text-[#564334]">{m.dose} · {m.time}</p></div>
            <span className="text-right text-xs text-[#897362]"><b className="block text-base font-semibold text-[#241912]">{m.left}</b>left</span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setOpen(true)} className="iv-btn mt-4"><Icon name="plus" size={18} stroke={2.4} />Add medication</button>
      {open && (
        <Sheet onClose={() => { setOpen(false); setIssues(null); }} eyebrow="New medication" title="Add a med">
          <label htmlFor="iv-med" className="mt-4 block text-sm font-semibold">Name</label>
          <input id="iv-med" list="iv-med-list" value={name} onChange={(e) => { setName(e.target.value); setIssues(null); }} placeholder="Try ibuprofen" className="iv-input mt-1.5 h-12" />
          <datalist id="iv-med-list">{EXTRA_MEDS.map((x) => <option key={x} value={x} />)}</datalist>
          <label htmlFor="iv-time" className="mt-3 block text-sm font-semibold">Time</label>
          <select id="iv-time" value={time} onChange={(e) => setTime(e.target.value)} className="iv-input mt-1.5 h-12">{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
          {issues && (
            <div className="mt-4 flex flex-col gap-2.5" role="alert">
              {issues.map((i) => (
                <div key={i.title} className="rounded-2xl border border-[#ecc9ad] bg-[#ffeadd] p-3.5">
                  <Tag fg={SEV[i.severity].fg} bg={SEV[i.severity].bg}>{i.severity}</Tag>
                  <p className="mt-2 text-[15px] font-semibold">{i.title}</p>
                  <p className="mt-1 text-sm leading-snug text-[#564334]">{i.summary}</p>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={issues ? commit : check} className="iv-btn mt-4">{issues ? "Add anyway" : "Check and add"}</button>
        </Sheet>
      )}
    </div>
  );
}

function Interactions({ meds }: { meds: Med[] }) {
  const options = [...meds.map((m) => m.name), ...EXTRA_MEDS.filter((x) => !meds.some((m) => m.name.startsWith(x)))];
  const [a, setA] = useState("Lisinopril");
  const [b, setB] = useState("Ibuprofen");
  const [res, setRes] = useState<{ issue: Issue | null } | null>(null);
  const sel = (v: string, set: (s: string) => void, id: string, label: string) => (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <select id={id} value={v} onChange={(e) => { set(e.target.value); setRes(null); }} className="iv-input mt-1.5 h-12">{options.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );
  return (
    <div className="mt-5">
      <div className="iv-soft flex flex-col gap-3 p-4">
        {sel(a, setA, "iv-a", "First medication")}
        {sel(b, setB, "iv-b", "Second medication")}
        <button type="button" onClick={() => setRes({ issue: a === b ? null : checkPair(a, b) })} className="iv-btn">Check interaction</button>
      </div>
      {res && (
        <div className="iv-card mt-3 p-4" role="status">
          {res.issue ? (
            <>
              <Tag fg={SEV[res.issue.severity].fg} bg={SEV[res.issue.severity].bg}>{res.issue.severity}</Tag>
              <p className="mt-2.5 text-[18px] font-semibold leading-snug">{res.issue.title}</p>
              <p className="mt-1.5 text-[15px] leading-snug text-[#564334]">{res.issue.summary}</p>
              <p className="mt-3 rounded-2xl bg-[#fff1e9] p-3 text-sm font-medium text-[#6e3900]">{res.issue.tip}</p>
            </>
          ) : (
            <>
              <Tag fg="#6e3900" bg="#ffdcc3">No known issue</Tag>
              <p className="mt-2.5 text-[15px] leading-snug text-[#564334]">{a === b ? "Pick two different medications." : `Nothing in the checker flags ${a} with ${b}. Still worth asking your pharmacist.`}</p>
            </>
          )}
        </div>
      )}
      <p className="mt-3 text-xs leading-relaxed text-[#897362]">A small sample of the app&apos;s rules, based on openFDA label data. Not medical advice.</p>
    </div>
  );
}

function Streak({ taken, total }: { taken: number; total: number }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = (new Date().getDay() + 6) % 7;
  return (
    <div className="mt-5">
      <div className="iv-card p-5 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#ffe3d3]" style={{ color: "#e0703a" }}><Icon name="flame" size={26} fill /></span>
        <p className="mt-2 text-[44px] font-bold leading-none">{taken === total ? 7 : 6}</p>
        <p className="mt-1 text-sm text-[#564334]">day streak</p>
        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="grid h-9 w-9 place-items-center rounded-full text-white" style={{ background: i < today || (i === today && taken === total) ? PRIMARY : "#efe0d3", outline: i === today ? `2px solid ${PRIMARY}` : undefined, outlineOffset: 2 }}>{(i < today || (i === today && taken === total)) && <Icon name="check" size={16} stroke={2.8} />}</span>
              <span className="text-[11px] font-semibold text-[#897362]">{d}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-[#564334]">Take every dose today to extend it. Best run: 12 days.</p>
    </div>
  );
}
