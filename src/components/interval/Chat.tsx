"use client";

import { useEffect, useRef, useState } from "react";
import { answer, latest, STARTERS, type Med, type Msg, type Rec } from "./data";
import { Chart, Icon, PRIMARY, RangeCard, Sheet, TrendCard } from "./ui";

type Props = { msgs: Msg[]; setMsgs: (f: (m: Msg[]) => Msg[]) => void; recs: Rec[]; meds: Med[]; pending: string | null; clear: () => void; toast: (m: string) => void };

function Typed({ text, fast, onDone }: { text: string; fast: boolean; onDone: () => void }) {
  const [n, setN] = useState(fast ? text.length : 0);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    if (fast) return;
    const t = setInterval(() => setN((v) => { if (v + 3 >= text.length) { clearInterval(t); setTimeout(() => done.current(), 0); return text.length; } return v + 3; }), 22);
    return () => clearInterval(t);
  }, [text, fast]);
  return <>{text.slice(0, n).split("\n\n").map((p, i) => <p key={i} className={i ? "mt-3" : ""}>{p}</p>)}</>;
}

export function Chat({ msgs, setMsgs, recs, meds, pending, clear, toast }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<null | "loaded" | "disclaimer">(null);
  const [trend, setTrend] = useState<string | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const seq = useRef(100);
  const sendRef = useRef<(q: string) => void>(() => {});

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); });
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (raw: string) => {
    const q = raw.trim();
    if (!q || busy) return;
    const id = seq.current++;
    setMsgs((m) => [...m, { id, me: true, text: q }]);
    setText("");
    setBusy(true);
    timer.current = setTimeout(() => {
      const a = answer(q, recs, meds);
      setMsgs((m) => [...m, { id: id + 1, me: false, ...a }]);
      seq.current++;
    }, 600);
  };
  useEffect(() => { sendRef.current = send; });
  useEffect(() => {
    if (pending) { clear(); sendRef.current(pending); }
  }, [pending, clear]);

  const last = msgs.at(-1);

  const a1c = latest("A1C", recs), iron = latest("Iron", recs);
  const call = (n: string) => toast(`Demo only. This would dial ${n}.`);

  return (
    <div className="relative flex h-full flex-col pb-[84px] pt-[72px]">
      <div className="border-b border-[#f0dccd] px-5 pb-3.5">
        <p className="iv-eyebrow" style={{ color: PRIMARY }}>Health chat</p>
        <h2 className="mt-1 text-[29px] font-bold leading-tight">Chat with Interval</h2>
        <p className="mt-1 text-sm leading-snug text-[#564334]">Ask about your meds, labs, and health history.</p>
      </div>

      <div className="iv-scroll flex shrink-0 gap-2 overflow-x-auto px-5 py-2.5">
        {STARTERS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="iv-chip">{s}</button>)}
      </div>

      <div ref={log} className="iv-scroll flex-1 overflow-y-auto px-5 pb-3 pt-3">
        <button type="button" onClick={() => setInfo("loaded")} className="flex w-full items-center justify-between rounded-2xl border border-[#ecc9ad] bg-[#ffeadd] px-3.5 py-2.5 text-left">
          <span><b className="block text-[10.5px] font-bold uppercase tracking-wider" style={{ color: PRIMARY }}>Loaded about you</b><span className="text-[13px] text-[#564334]">Tap to review what chat is using</span></span>
          <Icon name="arrow" size={16} />
        </button>

        <div className="mt-3 flex flex-col gap-3">
          <div className="iv-card !rounded-[22px] p-4 text-[15px] leading-snug">
            <p>Hi Devin. I have your latest conditions, meds, and labs loaded.</p><p className="mt-3">Ask me anything.</p>
          </div>

          {msgs.map((m, idx) => {
            const isLast = idx === msgs.length - 1;
            const fast = !isLast || !!m.done;
            return m.me ? (
              <p key={m.id} className="max-w-[85%] self-end rounded-[22px] px-4 py-3 text-[15px] leading-snug text-white" style={{ background: "#8b4f1c" }}>{m.text}</p>
            ) : (
              <div key={m.id} className="flex flex-col gap-3">
                {m.sos && (
                  <div className="rounded-[26px] p-4 text-white shadow-lg" style={{ background: "linear-gradient(135deg,#b3201f,#97410c)" }} role="alert">
                    <p className="flex items-center gap-2 text-[19px] font-semibold"><Icon name="warn" size={22} fill />Get help now</p>
                    <p className="mt-2 text-sm leading-snug opacity-95">This sounds serious. If you or someone else is in immediate danger, please contact emergency services. Don&apos;t wait.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => call("911")} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-semibold text-[#b3201f]"><Icon name="phone" size={16} fill />Call 911</button>
                      <button type="button" onClick={() => call("988")} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 text-[15px] font-semibold"><Icon name="phone" size={16} fill />Crisis line · 988</button>
                    </div>
                  </div>
                )}
                <div className="iv-card !rounded-[22px] p-4 text-[15px] leading-snug">
                  <Typed text={m.text} fast={fast} onDone={() => { setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, done: true } : x))); setBusy(false); }} />
                  {(fast || m.done) && (
                    <>
                      {m.cards && m.cards.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2.5">
                          {m.cards.map((c, i) =>
                            c.kind === "med" ? <MedCard key={i} med={meds.find((x) => x.id === c.id)} />
                            : <button key={i} type="button" onClick={() => setTrend(c.metric)} className="text-left">{c.kind === "range" ? <RangeCard metric={c.metric} recs={recs} /> : <TrendCard metric={c.metric} recs={recs} />}</button>,
                          )}
                        </div>
                      )}
                      {m.source && <p className="mt-3 inline-block rounded-full bg-[#fff1e9] px-2.5 py-1 text-[11px] font-medium text-[#6e3900]">{m.source}</p>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {busy && last?.me && <p className="px-1 text-sm text-[#897362]">Interval is thinking…</p>}
        </div>
        <button type="button" onClick={() => setInfo("disclaimer")} className="mx-auto mt-4 block text-xs font-medium text-[#897362] underline">Medical disclaimer</button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2.5 border-t border-[#f0dccd] bg-[#fff8f5] px-4 py-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about your health…" aria-label="Message Interval" className="iv-input h-12 min-w-0 flex-1 bg-[#fff1e9]" />
        <button type="submit" aria-label="Send" disabled={!text.trim() || busy} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white transition-colors" style={{ background: text.trim() && !busy ? "#8b4f1c" : "#e9dcd2" }}><Icon name="send" size={20} stroke={2.4} /></button>
      </form>

      {info === "loaded" && (
        <Sheet onClose={() => setInfo(null)} eyebrow="Chat context" title="Loaded about you">
          <ul className="iv-card mt-4 divide-y divide-[#f0dccd] !rounded-[22px] text-[15px]">
            {[["Conditions", "Hypertension, prediabetes"], ["Allergies", "None logged"], ["Medications", meds.map((m) => m.name).join(", ")], ["Latest lab", `A1C ${a1c?.value}%, iron ${iron?.value} µg/dL`]].map(([k, v]) => (
              <li key={k} className="p-3.5"><b className="block text-xs font-bold uppercase tracking-wider text-[#897362]">{k}</b>{v}</li>
            ))}
          </ul>
        </Sheet>
      )}
      {info === "disclaimer" && (
        <Sheet onClose={() => setInfo(null)} eyebrow="Please read" title="Medical disclaimer">
          <p className="mt-3 text-[15px] leading-relaxed text-[#564334]">Interval provides health information based on data you&apos;ve entered: your medications, lab results, and medical history. It is not a licensed medical professional and cannot diagnose, treat, or prevent any condition.</p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#564334]">Always consult a qualified healthcare provider before making any changes to your medication, diet, or treatment plan.</p>
        </Sheet>
      )}
      {trend && (
        <Sheet onClose={() => setTrend(null)} eyebrow="Trend" title={trend}>
          <div className="iv-card mt-4 p-3"><Chart metric={trend} recs={recs} /></div>
        </Sheet>
      )}
    </div>
  );
}

function MedCard({ med }: { med?: Med }) {
  return med ? (
    <div className="iv-soft p-3.5">
      <p className="text-[15px] font-semibold">{med.name}</p>
      <p className="text-sm text-[#564334]">{med.dose} · {med.time}</p>
    </div>
  ) : null;
}
