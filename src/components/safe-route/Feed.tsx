"use client";

import { useState } from "react";
import { ago, type Post } from "./data";
import { AMBER, BLUE, GREEN, Icon, RED } from "./ui";
import type { Tab } from "./SafeRouteApp";

type Props = {
  posts: Post[];
  setPosts: (f: (p: Post[]) => Post[]) => void;
  toast: (m: string) => void;
  go: (t: Tab) => void;
};

type Vote = "up" | "down";

export function Feed({ posts, setPosts, toast, go }: Props) {
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const vote = (id: string, v: Vote) => {
    const cur = votes[id];
    setVotes((s) => {
      const n = { ...s };
      if (cur === v) delete n[id]; else n[id] = v;
      return n;
    });
    setPosts((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        let { likes, dislikes } = p;
        if (cur === "up") likes--; else if (cur === "down") dislikes--;
        if (cur !== v) { if (v === "up") likes++; else dislikes++; }
        return { ...p, likes, dislikes };
      }),
    );
  };

  const comment = (id: string) => {
    const text = draft.trim();
    if (!text) return;
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, comments: [...p.comments, { id: String(p.comments.length + 1), text }] } : p)));
    setDraft("");
  };

  return (
    <div className="px-4 pb-8 pt-6">
      <h2 className="text-center text-[22px] font-bold leading-tight">Community Safety Feed</h2>
      <p className="mx-auto mt-2 max-w-[18rem] text-center text-sm leading-snug text-[#666]">Stay informed about safety incidents in your area. Report crimes and help keep the community safe.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => go("report")} className="sr-pill" style={{ background: "#d9534f" }}><Icon name="plus" size={18} stroke={2.4} />Report Incident</button>
        <button type="button" onClick={() => go("map")} className="sr-pill" style={{ background: BLUE }}><Icon name="pin" size={18} />View on Map</button>
      </div>

      <h3 className="sr-h mt-7">Recent Reports ({posts.length})</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {posts.map((p) => {
          const v = votes[p.id];
          const isOpen = open === p.id;
          const isRep = reported.has(p.id);
          return (
            <li key={p.id} className="sr-card p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-[17px] font-semibold"><Icon name={p.type} size={24} color={BLUE} />{p.type}</span>
                <span className="text-sm text-[#666]">{ago(p.minsAgo).replace(" ago", " ago")}</span>
              </div>
              <p className="mt-3 text-[15px] leading-snug">{p.text}</p>
              <p className="mt-2.5 flex items-center gap-1.5 text-sm text-[#666]"><Icon name="pin" size={16} color="#666" />{p.place}, Austin, TX</p>
              <div className="mt-3 border-t border-[#ececec] pt-2.5 text-[13px] text-[#666]">{p.likes} likes · {p.dislikes} dislikes · {p.comments.length} comments</div>
              <div className="mt-2 grid grid-cols-4 border-t border-[#ececec] pt-1.5 text-[13px] font-medium">
                <Act on={v === "up"} color={BLUE} icon="up" label="Like" onClick={() => vote(p.id, "up")} />
                <Act on={v === "down"} color={RED} icon="down" label="Dislike" onClick={() => vote(p.id, "down")} />
                <Act on={isOpen} color={GREEN} icon="comment" label="Comment" onClick={() => { setOpen(isOpen ? null : p.id); setDraft(""); }} />
                <Act on={isRep} color={AMBER} icon="flag" label={isRep ? "Reported" : "Report"} onClick={() => (isRep ? undefined : setConfirm(confirm === p.id ? null : p.id))} />
              </div>
              {confirm === p.id && (
                <div className="mt-2 rounded-xl bg-[#fff6e5] p-3 text-sm">
                  <p>Report this post for review?</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => setConfirm(null)} className="h-9 flex-1 rounded-lg bg-white text-sm font-medium ring-1 ring-[#e6e8eb]">Cancel</button>
                    <button type="button" onClick={() => { setReported((s) => new Set(s).add(p.id)); setConfirm(null); toast("This post has been reported for review."); }} className="h-9 flex-1 rounded-lg text-sm font-semibold text-white" style={{ background: AMBER }}>Report</button>
                  </div>
                </div>
              )}
              {isOpen && (
                <div className="mt-2 border-t border-[#ececec] pt-3">
                  <p className="text-sm font-semibold">Recent Comments:</p>
                  {p.comments.length === 0 && <p className="mt-1.5 text-sm text-[#666]">No comments yet. Be the first.</p>}
                  <ul className="mt-1.5 flex flex-col gap-2.5">
                    {p.comments.map((c) => (
                      <li key={c.id} className="text-sm leading-snug">{c.text}</li>
                    ))}
                  </ul>
                  <form onSubmit={(e) => { e.preventDefault(); comment(p.id); }} className="mt-3 flex gap-2">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a comment..." aria-label="Add a comment" className="sr-input h-10 min-w-0 flex-1" />
                    <button type="submit" aria-label="Post comment" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ background: BLUE }}><Icon name="send" size={16} /></button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Act({ on, color, icon, label, onClick }: { on: boolean; color: string; icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="flex h-10 flex-col items-center justify-center gap-0.5 rounded-lg" style={{ color: on ? color : "#1a1a1a", background: on ? `${color}14` : undefined }}>
      <Icon name={icon} size={18} color={color} />
      <span className="text-[11px]">{label}</span>
    </button>
  );
}
