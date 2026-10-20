"use client";

import { useState } from "react";
import { CRIME_TYPES, type Post } from "./data";
import { BLUE, Icon } from "./ui";

const PLACES = ["West Campus", "6th Street", "East Austin", "South Congress"];

export function Report({ submit }: { submit: (p: Omit<Post, "id" | "minsAgo" | "likes" | "dislikes" | "comments">) => void }) {
  const [type, setType] = useState("");
  const [place, setPlace] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const send = () => {
    if (!type || !text.trim() || !place.trim()) return setErr("Please select a crime type, provide a description, and enter a location.");
    submit({ type, place: place.trim(), text: text.trim(), mine: true });
    setType(""); setPlace(""); setText(""); setErr(null);
  };

  return (
    <div className="px-4 pb-8 pt-5">
      <h3 className="sr-h">What type of incident occurred?</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {CRIME_TYPES.map((t) => {
          const on = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setErr(null); }}
              aria-pressed={on}
              className="sr-card-sm flex flex-col items-center gap-1.5 border-2 py-4 text-[15px]"
              style={{ borderColor: on ? BLUE : "transparent", color: on ? BLUE : "#555" }}
            >
              <Icon name={t} size={26} />
              {t}
            </button>
          );
        })}
      </div>

      <h3 className="sr-h mt-7">Location</h3>
      <div className="mt-3 flex gap-2.5">
        <input value={place} onChange={(e) => { setPlace(e.target.value); setErr(null); }} placeholder="Enter address or location" aria-label="Location" className="sr-input h-12 min-w-0 flex-1" />
        <button type="button" onClick={() => setPlace(PLACES[Math.floor(Math.random() * PLACES.length)])} aria-label="Use sample location" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: BLUE }}><Icon name="locate" size={22} /></button>
      </div>

      <h3 className="sr-h mt-7">Provide details</h3>
      <p className="mt-1.5 text-sm leading-snug text-[#666]">Describe what happened, when, and any other relevant information</p>
      <textarea value={text} onChange={(e) => { setText(e.target.value); setErr(null); }} rows={5} placeholder="Describe the incident in detail..." aria-label="Incident details" className="sr-input mt-3 resize-none py-3 leading-snug" />

      <p role="alert" className="mt-3 min-h-5 text-sm text-[#d9534f]">{err}</p>
      <button type="button" onClick={send} className="mt-1 h-12 w-full rounded-xl text-base font-semibold text-white" style={{ background: BLUE }}>Submit Report</button>
    </div>
  );
}
