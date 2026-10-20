"use client";

import { useState } from "react";
import { draft, latest, type Med, type Rec } from "./data";
import { Icon, PRIMARY, Sheet } from "./ui";

type Props = { recs: Rec[]; meds: Med[]; health: boolean; setHealth: (v: boolean) => void; toast: (m: string) => void };
const CONDITIONS = ["Hypertension", "Prediabetes", "Iron deficiency"];

export function Profile({ recs, meds, health, setHealth, toast }: Props) {
  const [conds, setConds] = useState(CONDITIONS);
  const [allergy, setAllergy] = useState<string[]>([]);
  const [addA, setAddA] = useState("");
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("doctor@clinic.com");
  const [out, setOut] = useState<{ subject: string; body: string } | null>(null);
  const flagged = recs.filter((r) => r.flagged).length;

  const copy = async () => {
    if (!out) return;
    try { await navigator.clipboard.writeText(`Subject: ${out.subject}\n\n${out.body}`); toast("Draft copied"); } catch { toast("Couldn't copy. Select the text instead."); }
  };

  return (
    <div className="px-5 pb-32 pt-[76px]">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-[#f0c9a6] bg-[#ffdcc3] text-xl font-semibold" style={{ color: PRIMARY }}>DT</span>
        <div><p className="iv-eyebrow" style={{ color: PRIMARY }}>Health profile</p><h2 className="text-[27px] font-bold leading-tight">Devin T.</h2><p className="text-sm text-[#564334]">Austin, TX</p></div>
      </div>

      <div className="iv-card mt-5 p-4">
        <p className="iv-eyebrow">Conditions</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {conds.map((c) => <button key={c} type="button" onClick={() => setConds((x) => x.filter((y) => y !== c))} aria-label={`Remove ${c}`} className="iv-chip" style={{ background: "#ffdcc3", borderColor: "#f3b693", color: "#6e3900" }}>{c} <span className="ml-1.5 opacity-60">×</span></button>)}
          {conds.length === 0 && <span className="text-sm text-[#897362]">None logged.</span>}
        </div>
        <p className="iv-eyebrow mt-4">Allergies</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {allergy.map((c) => <button key={c} type="button" onClick={() => setAllergy((x) => x.filter((y) => y !== c))} aria-label={`Remove ${c}`} className="iv-chip" style={{ background: "#ffdad6", borderColor: "#f4b8b2", color: "#93000a" }}>{c} <span className="ml-1.5 opacity-60">×</span></button>)}
          {allergy.length === 0 && <span className="text-sm text-[#897362]">None logged.</span>}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const v = addA.trim(); if (v && !allergy.includes(v)) { setAllergy((x) => [...x, v]); toast(`${v} allergy added. Interaction checks will use it.`); } setAddA(""); }} className="mt-3 flex gap-2">
          <input value={addA} onChange={(e) => setAddA(e.target.value)} placeholder="Add an allergy" aria-label="Add an allergy" className="iv-input h-11 min-w-0 flex-1" />
          <button type="submit" className="iv-chip !h-11" style={{ color: PRIMARY }}>Add</button>
        </form>
      </div>

      <div className="iv-card mt-3.5 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#ffe3d3]" style={{ color: "#e0703a" }}><Icon name="heart" size={22} fill /></span>
          <div className="min-w-0 flex-1"><p className="text-[17px] font-semibold">Apple Health</p><p className="mt-0.5 text-sm leading-snug text-[#564334]">{health ? "Steps, sleep, and water sync to Home." : "Read-only and on-device. Nothing leaves your phone."}</p></div>
        </div>
        <button type="button" onClick={() => { setHealth(!health); toast(health ? "Apple Health disconnected" : "Apple Health connected"); }} aria-pressed={health} className="mt-3 inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold" style={health ? { background: "#ffeadd", color: "#6e3900", border: "1px solid #ecc9ad" } : { background: "#8b4f1c", color: "#fff" }}>{health ? "Connected ✓" : "Connect"}</button>
      </div>

      <div className="iv-soft mt-3.5 p-4">
        <p className="text-[17px] font-semibold">Loaded into Interval</p>
        <p className="mt-0.5 text-sm text-[#564334]">The app is keeping tabs on your labs, records, and trends.</p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[[recs.length, "Records"], [meds.length, "Meds"], [flagged, "Flagged"]].map(([n, l]) => <div key={l as string} className="rounded-2xl bg-white p-2.5"><dt className="sr-only">{l}</dt><dd className="text-xl font-bold">{n}</dd><p className="text-[11px] text-[#897362]">{l}</p></div>)}
        </dl>
        <p className="mt-3 text-sm text-[#564334]">Latest: A1C {latest("A1C", recs)?.value}%, iron {latest("Iron", recs)?.value} µg/dL</p>
      </div>

      <button type="button" onClick={() => setOpen(true)} className="iv-btn mt-4"><Icon name="mail" size={18} />Share with doctor</button>

      {open && (
        <Sheet onClose={() => { setOpen(false); setOut(null); }} eyebrow="Doctor email" title="Doctor draft">
          {!out ? (
            <>
              <p className="mt-3 text-[15px] leading-snug text-[#564334]">Type what you want help with and Interval will turn it into a polished email draft.</p>
              <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-[#fadfc3] p-3 text-sm font-medium" style={{ color: "#6e3900" }}><Icon name="steth" size={18} />Using Dr. Patel as the most recent provider context.</div>
              <label htmlFor="iv-email" className="mt-4 block text-sm font-semibold">Send to</label>
              <input id="iv-email" value={email} onChange={(e) => setEmail(e.target.value)} className="iv-input mt-1.5 h-12" />
              <label htmlFor="iv-note" className="mt-3 flex items-center gap-1.5 text-sm font-semibold"><Icon name="spark" size={15} />What should Interval write?</label>
              <textarea id="iv-note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Example: I want to ask whether my recent A1C and iron results change anything about my current meds." className="iv-input mt-1.5 resize-none py-3 leading-snug" />
              <button type="button" onClick={() => setOut(draft(note, recs, meds))} className="iv-btn mt-4">Create email<Icon name="mail" size={18} /></button>
            </>
          ) : (
            <>
              <div className="iv-card mt-4 p-4">
                <p className="iv-eyebrow">To</p><p className="text-[15px]">{email}</p>
                <p className="iv-eyebrow mt-3">Subject</p><p className="text-[15px] font-semibold">{out.subject}</p>
                <p className="iv-eyebrow mt-3">Draft preview</p>
                <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">{out.body}</p>
              </div>
              <div className="mt-3 flex gap-2.5">
                <button type="button" onClick={() => setOut(null)} className="iv-chip !h-12 flex-1 justify-center">Edit</button>
                <button type="button" onClick={copy} className="iv-btn !h-12 flex-[1.4]"><Icon name="copy" size={17} />Copy draft</button>
              </div>
              <p className="mt-3 text-center text-xs text-[#897362]">The app opens Mail from here. The demo just copies it.</p>
            </>
          )}
        </Sheet>
      )}
    </div>
  );
}
