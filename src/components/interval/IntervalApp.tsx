"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DemoStage, Phone } from "@/components/DemoStage";
import { MEDS, RECORDS, type Med, type Msg, type Rec } from "./data";
import { Home } from "./Home";
import { Docs } from "./Docs";
import { Meds } from "./Meds";
import { Chat } from "./Chat";
import { Profile } from "./Profile";
import { Chart, Icon, PRIMARY, Sheet, SheetRoot } from "./ui";

/**
 * A working web recreation of the Interval iPhone app (SwiftUI) for its project panel: Home, Docs, Meds, Chat,
 * Profile. Skinned with the app's warm palette. The AI chat is a small rule-based stand-in for the on-device
 * model. Sample data, in memory only.
 */

export type Tab = "home" | "docs" | "meds" | "chat" | "profile";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "HOME", icon: "home" },
  { id: "docs", label: "DOCS", icon: "docs" },
  { id: "meds", label: "MEDS", icon: "meds" },
  { id: "chat", label: "CHAT", icon: "chat" },
  { id: "profile", label: "PROFILE", icon: "profile" },
];

export default function IntervalApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [meds, setMeds] = useState<Med[]>(MEDS);
  const [recs, setRecs] = useState<Rec[]>(RECORDS);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [health, setHealth] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [trend, setTrend] = useState<string | null>(null);
  const [note, setNote] = useState<{ id: number; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const body = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<HTMLElement | null>(null);

  const toast = useCallback((text: string) => {
    clearTimeout(timer.current);
    setNote({ id: Date.now(), text });
    timer.current = setTimeout(() => setNote(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = useCallback((t: Tab) => { setTab(t); body.current?.scrollTo({ top: 0 }); }, []);
  const toggle = (id: string) => setMeds((ms) => ms.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m)));
  const addRec = (r: Omit<Rec, "id" | "date" | "ts">) => setRecs((rs) => [{ ...r, id: `s${Date.now()}`, date: "Just now", ts: 7 }, ...rs]);
  const clearPending = useCallback(() => setPending(null), []);
  const ask = (q: string) => { setPending(q); go("chat"); };

  const scrolls = tab !== "chat";
  return (
    <DemoStage label="Interval app demo" title="Try the app" blurb="Log a dose, scan a lab, check two meds, ask the chat about your A1C. Sample data, nothing saved." note="A web recreation of the SwiftUI app. Chat answers come from a small rule-based stand-in, not the on-device model.">
      <Phone className="iv-app" screenClass="bg-[#fff8f5]">
       <SheetRoot.Provider value={root}>
        <div ref={body} className={`iv-scroll relative min-h-0 flex-1 ${scrolls ? "overflow-y-auto" : "overflow-hidden"}`}>
          {tab === "home" && <Home meds={meds} toggle={toggle} recs={recs} go={go} health={health} trend={setTrend} toast={toast} />}
          {tab === "docs" && <Docs recs={recs} add={addRec} toast={toast} ask={ask} />}
          {tab === "meds" && <Meds meds={meds} toggle={toggle} add={(m) => setMeds((ms) => [...ms, m])} toast={toast} />}
          {tab === "chat" && <Chat msgs={msgs} setMsgs={setMsgs} recs={recs} meds={meds} pending={pending} clear={clearPending} toast={toast} />}
          {tab === "profile" && <Profile recs={recs} meds={meds} health={health} setHealth={setHealth} toast={toast} />}
        </div>

        {/* status bar: sits over the scrolling content with a fade so text never collides with it */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[60px] items-start justify-between bg-gradient-to-b from-[#fff8f5] from-70% to-transparent px-8 pt-[19px] text-[15px] font-semibold">
          <span>9:41</span>
          <span className="flex items-center gap-1.5" aria-hidden>
            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.500" width="3" height="8.500" rx="1" /><rect x="13.500" y="0" width="3" height="11" rx="1" /></svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.500" y="0.500" width="21" height="11" rx="3.500" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="18" height="8" rx="2.200" fill="currentColor" /><rect x="22.500" y="4" width="1.800" height="4" rx="0.900" fill="currentColor" opacity="0.4" /></svg>
          </span>
        </div>

        {note && <p key={note.id} role="status" className="pointer-events-none absolute inset-x-5 bottom-28 z-40 rounded-2xl bg-[#3a2e25]/95 px-4 py-3 text-center text-sm font-medium text-[#ffede3] shadow-lg">{note.text}</p>}

        <nav aria-label="App sections" className="absolute inset-x-3 bottom-[22px] z-30 grid grid-cols-5 rounded-[32px] bg-white/95 p-1 shadow-[0_8px_24px_rgba(144,77,0,0.16)] ring-1 ring-[#ddc1ae]/50 backdrop-blur">
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button key={t.id} type="button" onClick={() => go(t.id)} aria-current={on ? "page" : undefined} className="flex flex-col items-center gap-0.5 rounded-[28px] py-1.5" style={{ color: on ? PRIMARY : "#241912", background: on ? "rgba(223,206,196,0.45)" : undefined }}>
                <Icon name={t.icon} size={22} fill={on} stroke={on ? 1.6 : 1.9} />
                <span className="text-[9.5px] font-semibold tracking-[0.08em]">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div ref={setRoot} className="pointer-events-none absolute inset-0 z-50 [&>*]:pointer-events-auto" />

        {trend && (
          <Sheet onClose={() => setTrend(null)} eyebrow="Trend" title={trend}>
            <div className="iv-card mt-4 p-3"><Chart metric={trend} recs={recs} /></div>
            <button type="button" onClick={() => { setTrend(null); ask(`What does my ${trend} mean?`); }} className="iv-btn mt-4">Ask Interval about this</button>
          </Sheet>
        )}
       </SheetRoot.Provider>
      </Phone>
    </DemoStage>
  );
}
