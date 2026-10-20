"use client";

import { useEffect, useRef, useState } from "react";
import { SCANS, type Rec } from "./data";
import { Chart, Icon, PRIMARY, STATUS, Sheet, Tag } from "./ui";

type Props = { recs: Rec[]; add: (r: Omit<Rec, "id" | "date" | "ts">) => void; toast: (m: string) => void; ask: (q: string) => void };
function Thumb({ flagged }: { flagged: boolean }) {
  return (
    <svg width="46" height="60" viewBox="0 0 46 60" className="shrink-0 rounded-xl border border-[#ddc1ae] bg-[#fffdfb]" aria-hidden>
      <rect x="7" y="8" width="18" height="3" rx="1.500" fill="#cdbba9" />
      {[16, 22, 28, 34, 40].map((y, i) => <rect key={y} x="7" y={y} width={i % 2 ? 26 : 32} height="2" rx="1" fill="#e3d6c9" />)}
      {flagged && <><circle cx="9" cy="24" r="2" fill="#e24b4a" /><circle cx="9" cy="36" r="2" fill="#e24b4a" /></>}
    </svg>
  );
}

const FILTERS = ["All", "Flagged", "Labs", "Visits"] as const;

export function Docs({ recs, add, toast, ask }: Props) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const [metric, setMetric] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scans = useRef(0);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  const list = recs.filter((r) => {
    const hay = `${r.title} ${r.provider} ${r.summary} ${r.labs.map((l) => l.metric).join(" ")}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    return f === "All" || (f === "Flagged" && r.flagged) || (f === "Labs" && r.kind === "Lab") || (f === "Visits" && r.kind === "Visit");
  });
  const flagged = list.filter((r) => r.flagged);
  const rest = list.filter((r) => !r.flagged);
  const cur = recs.find((r) => r.id === open);

  const scan = () => {
    setScanning(true);
    t.current = setTimeout(() => {
      const s = SCANS[scans.current++ % SCANS.length];
      add(s);
      setScanning(false);
      setF("All");
      toast(`Parsed ${s.labs.length} result${s.labs.length > 1 ? "s" : ""} from your scan`);
    }, 1700);
  };

  const card = (r: Rec) => (
    <li key={r.id}>
      <button type="button" onClick={() => setOpen(r.id)} className="iv-card w-full p-4 text-left">
        <div className="flex items-start gap-3">
          <Thumb flagged={r.flagged} />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-[17px] font-semibold">{r.title}{r.flagged && <Tag>Flag</Tag>}</p>
            <p className="mt-0.5 text-sm text-[#897362]">{r.provider}</p>
          </div>
          <span className="text-sm text-[#897362]">{r.date}</span>
        </div>
        <p className="mt-2.5 text-sm leading-snug text-[#564334]">{r.summary}</p>
        {r.labs.length > 0 && (
          <ul className="mt-2.5 border-t border-dashed border-[#ddc1ae] pt-2">
            {r.labs.slice(0, 3).map((l) => (
              <li key={l.metric} className="flex items-center justify-between py-1 text-[15px]">
                <span>{l.metric}</span>
                <span className="flex items-center gap-2"><b className="font-semibold" style={{ color: l.status === "normal" ? "#241912" : "#a43c12" }}>{l.value} {l.unit}</b><Tag fg={STATUS[l.status].fg} bg={STATUS[l.status].bg}>{STATUS[l.status].label}</Tag></span>
              </li>
            ))}
          </ul>
        )}
      </button>
    </li>
  );

  return (
    <div className="px-5 pb-32 pt-[76px]">
      <p className="iv-eyebrow" style={{ color: PRIMARY }}>Your records</p>
      <h2 className="iv-title mt-1.5">Documents</h2>
      <p className="mt-2 text-[15px] leading-snug text-[#564334]">Every lab, prescription, and visit note, in one place.</p>

      <div className="iv-soft mt-4 p-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: PRIMARY }}><Icon name="search" size={18} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, doctor, or lab" aria-label="Search records" className="iv-input h-12 pl-11" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((x) => <button key={x} type="button" onClick={() => setF(x)} aria-pressed={f === x} className="iv-chip" style={f === x ? { background: PRIMARY, color: "#fff", borderColor: PRIMARY } : undefined}>{x}</button>)}
        </div>
        <p className="mt-3 text-[13px] text-[#564334]">{recs.length} records across labs, prescriptions, and visit notes.</p>
      </div>

      <button type="button" onClick={scan} disabled={scanning} className="mt-3.5 flex w-full items-center gap-3.5 rounded-[24px] border border-[#f0c9a6] bg-[#ffe3d3] p-4 text-left">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#ffd0bb] text-[#a43c12]"><Icon name="scan" size={26} /></span>
        <span className="min-w-0 flex-1"><b className="block text-[17px] font-semibold">{scanning ? "Reading your document…" : "Scan new document"}</b><span className="text-[13px] text-[#564334]">{scanning ? "Finding labs and dates" : "Lab, prescription, or visit note. I'll parse it."}</span></span>
        {!scanning && <span className="text-[#a43c12]"><Icon name="arrow" size={20} /></span>}
      </button>

      {flagged.length > 0 && (
        <>
          <div className="mt-6 flex items-baseline justify-between"><h3 className="text-xl font-semibold">Needs attention</h3><span className="iv-eyebrow !text-[10.5px]">{flagged.length} flagged</span></div>
          <ul className="mt-3 flex flex-col gap-3">{flagged.map(card)}</ul>
        </>
      )}
      {rest.length > 0 && (
        <>
          <h3 className="mt-6 text-xl font-semibold">{f === "Flagged" ? "More" : "All records"}</h3>
          <ul className="mt-3 flex flex-col gap-3">{rest.map(card)}</ul>
        </>
      )}
      {list.length === 0 && <p className="mt-6 text-center text-sm text-[#897362]">Nothing matches that.</p>}

      {cur && !metric && (
        <Sheet onClose={() => setOpen(null)} eyebrow={`${cur.kind === "Lab" ? "Lab panel" : cur.kind === "Rx" ? "Prescription" : "Visit note"} · ${cur.date}`} title={cur.title}>
          <p className="mt-2 text-[15px] leading-snug text-[#564334]">{cur.provider}. {cur.summary}</p>
          {cur.labs.length > 0 && (
            <ul className="iv-card mt-4 divide-y divide-[#f0dccd] !rounded-[22px]">
              {cur.labs.map((l) => (
                <li key={l.metric}>
                  <button type="button" onClick={() => setMetric(l.metric)} className="flex w-full items-center justify-between p-3.5 text-left">
                    <span><b className="block text-[15px] font-semibold">{l.metric}</b><span className="text-xs text-[#897362]">Range {l.low} to {l.high} {l.unit}</span></span>
                    <span className="flex items-center gap-2"><b className="font-semibold">{l.value} {l.unit}</b><Tag fg={STATUS[l.status].fg} bg={STATUS[l.status].bg}>{STATUS[l.status].label}</Tag></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {cur.labs.length > 0 && <p className="mt-2 text-center text-xs text-[#897362]">Tap a result for its trend.</p>}
          <button type="button" onClick={() => { setOpen(null); ask(cur.labs[0] ? `What does my ${cur.labs.find((l) => l.status !== "normal")?.metric ?? cur.labs[0].metric} mean?` : "Any risky meds?"); }} className="iv-btn mt-4">Ask Interval about this</button>
        </Sheet>
      )}
      {cur && metric && (
        <Sheet onClose={() => setMetric(null)} eyebrow="Trend" title={metric}>
          <div className="iv-card mt-4 p-3"><Chart metric={metric} recs={recs} /></div>
          <p className="mt-2 text-xs text-[#897362]">Green band is the reference range.</p>
        </Sheet>
      )}
    </div>
  );
}
