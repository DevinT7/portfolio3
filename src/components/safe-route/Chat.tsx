"use client";

import { useEffect, useRef, useState } from "react";
import { REPLIES, type Chat as ChatT } from "./data";
import { BLUE, GREEN, Icon } from "./ui";

type Props = { chats: ChatT[]; setChats: (f: (c: ChatT[]) => ChatT[]) => void; toast: (m: string) => void };

const EMOJI: Record<string, string> = { m1: "👩‍💼", m2: "👨‍💼", m3: "👩‍🦰", m4: "👨‍🦱" };

const Avatar = ({ c, size = 48 }: { c: ChatT; size?: number }) => (
  <span className="relative grid shrink-0 place-items-center rounded-full bg-[#eef1f4]" style={{ width: size, height: size, fontSize: size * 0.5 }}>
    {EMOJI[c.id]}
    {c.online && <i className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" style={{ background: GREEN }} />}
  </span>
);

export function Chat({ chats, setChats, toast }: Props) {
  const [tab, setTab] = useState<"messages" | "friends">("messages");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cur = chats.find((c) => c.id === open);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [cur?.msgs.length, open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const openChat = (id: string) => {
    setOpen(id);
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = () => {
    const text = draft.trim();
    if (!text || !cur) return;
    const id = cur.id;
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, msgs: [...c.msgs, { me: true, text }] } : c)));
    setDraft("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
      setChats((cs) => cs.map((c) => (c.id === id ? { ...c, msgs: [...c.msgs, { me: false, text: reply }] } : c)));
    }, 1100);
  };

  if (cur) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2.5 border-b border-[#e6e8eb] bg-white px-3 py-2.5">
          <button type="button" onClick={() => setOpen(null)} aria-label="Back to chats" className="grid h-9 w-9 place-items-center" style={{ color: BLUE }}><Icon name="back" size={24} /></button>
          <Avatar c={cur} size={36} />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-tight">{cur.name}</p>
            <p className="truncate text-xs text-[#666]">{cur.online ? "Online" : cur.status}</p>
          </div>
        </div>
        <div ref={log} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
          {cur.msgs.length === 0 && <p className="m-auto text-sm text-[#666]">Say hi to {cur.name.split(" ")[0]}.</p>}
          {cur.msgs.map((m, i) => (
            <p key={i} className={`max-w-[78%] rounded-[18px] px-3.5 py-2 text-[15px] leading-snug ${m.me ? "self-end text-white" : "self-start bg-white shadow-sm"}`} style={m.me ? { background: BLUE } : undefined}>{m.text}</p>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-[#e6e8eb] bg-white p-3">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." aria-label="Message" className="sr-input h-10 min-w-0 flex-1 rounded-full" />
          <button type="submit" aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ background: BLUE }}><Icon name="send" size={17} /></button>
        </form>
      </div>
    );
  }

  const list = chats.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="px-4 pb-8 pt-4">
      <button type="button" onClick={() => toast("Connecting you with nearby safety buddies...")} className="sr-pill w-full" style={{ background: GREEN }}>Buddy System</button>
      <div className="mt-4 grid grid-cols-2 rounded-xl bg-[#e9ecef] p-1 text-sm font-semibold">
        {(["messages", "friends"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`h-9 rounded-lg ${tab === t ? "bg-white shadow-sm" : "text-[#666]"}`}>{t === "messages" ? "Messages" : "Buddies"}</button>
        ))}
      </div>
      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]"><Icon name="search" size={17} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search" className="sr-input h-10 pl-10" />
      </div>
      <ul className="mt-3 flex flex-col gap-2.5">
        {list.length === 0 && <li className="p-4 text-sm text-[#666]">No one matches that.</li>}
        {list.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => openChat(c.id)} className="sr-card-sm flex w-full items-center gap-3 p-3 text-left">
              <Avatar c={c} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-tight">{c.name}</p>
                <p className="mt-0.5 truncate text-xs text-[#666]">
                  {tab === "messages" ? (c.msgs.length ? c.msgs[c.msgs.length - 1].text : "No messages yet") : `${c.status} · ${c.where}`}
                </p>
              </div>
              {tab === "messages" && c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold text-white" style={{ background: "#ff3b30" }}>{c.unread}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
