"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHATS, FEED, type Chat as ChatT, type Post } from "./data";
import { Home } from "./Home";
import { Feed } from "./Feed";
import { Report } from "./Report";
import { Chat } from "./Chat";
import { MapScreen } from "./MapScreen";
import { BLUE, Icon, TabGlyph } from "./ui";
import { DemoStage, Phone } from "@/components/DemoStage";

/**
 * A working web recreation of the Safe Route app (React Native / Expo) for the City of Austin panel: Home hub,
 * crime feed, crime map with route planning, incident reports, and buddy chat. It is skinned like the shipped iOS app
 * and framed as a phone so it reads as the app, not as part of the site. Sample data, in memory only.
 */

export type Tab = "home" | "feed" | "map" | "report" | "chat";
const TABS: { id: Tab; label: string; title: string }[] = [
  { id: "home", label: "Home", title: "Safe Route" },
  { id: "feed", label: "Feed", title: "Crime Feed" },
  { id: "map", label: "Map", title: "Safety Map" },
  { id: "report", label: "Report", title: "Report Incident" },
  { id: "chat", label: "Chat", title: "Chat" },
];

export default function SafeRouteApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [mapSeen, setMapSeen] = useState(false); // mount the map on first visit, then keep it
  const [posts, setPosts] = useState<Post[]>(FEED);
  const [chats, setChats] = useState<ChatT[]>(CHATS);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<{ id: number; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const body = useRef<HTMLDivElement>(null);

  const toast = useCallback((text: string) => {
    clearTimeout(timer.current);
    setNote({ id: Date.now(), text });
    timer.current = setTimeout(() => setNote(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = useCallback((t: Tab) => {
    setTab(t);
    if (t === "map") setMapSeen(true);
    body.current?.scrollTo({ top: 0 });
  }, []);

  const unread = chats.reduce((n, c) => n + c.unread, 0);
  const cur = TABS.find((t) => t.id === tab)!;
  const light = tab === "report"; // the app's report screen has a white header with a blue back arrow

  return (
    <DemoStage label="Safe Route app demo" title="Try the app" blurb="Plan a walk on the map, file a report, join a campaign. Sample data, nothing saved." note="A web recreation of the React Native app. Incidents are Austin PD reports and routes are simplified.">
      <Phone className="sr-app" screenClass="bg-[#f8f9fa]">

          <header className={`relative z-20 flex shrink-0 items-end justify-between px-4 pb-3 pt-11 ${light ? "border-b border-[#e6e8eb] bg-white text-[#1a1a1a]" : "bg-black text-white"}`}>
            {light ? (
              <button type="button" onClick={() => go("home")} aria-label="Back to home" className="grid h-8 w-8 place-items-center" style={{ color: BLUE }}><Icon name="back" size={24} /></button>
            ) : (
              <button type="button" onClick={() => toast("Settings aren't part of the demo.")} aria-label="Settings" className="grid h-8 w-8 place-items-center"><Icon name="gear" size={22} /></button>
            )}
            <h2 className="text-[17px] font-semibold leading-8">{cur.title}</h2>
            {light ? <span className="w-8" /> : (
              <button type="button" onClick={() => toast("Sign-in isn't part of the demo.")} aria-label="Profile" className="grid h-8 w-8 place-items-center"><Icon name="Harassment" size={22} /></button>
            )}
          </header>

          <div ref={body} className={`relative min-h-0 flex-1 ${tab === "map" || tab === "chat" ? "overflow-hidden" : "overflow-y-auto"}`}>
            {tab === "home" && <Home go={go} joined={joined} join={(id) => setJoined((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })} reports={posts.length} toast={toast} />}
            {tab === "feed" && <Feed posts={posts} setPosts={setPosts} toast={toast} go={go} />}
            {tab === "report" && (
              <Report
                submit={(p) => {
                  setPosts((ps) => [{ ...p, id: `n${Date.now()}`, minsAgo: 0, likes: 0, dislikes: 0, comments: [] }, ...ps]);
                  toast("Report Submitted. Thank you for helping keep our community safe.");
                  go("feed");
                }}
              />
            )}
            {tab === "chat" && <Chat chats={chats} setChats={setChats} toast={toast} />}
            {mapSeen && <div className={tab === "map" ? "absolute inset-0" : "hidden"}><MapScreen active={tab === "map"} toast={toast} /></div>}
          </div>

          {note && (
            <p key={note.id} role="status" className="pointer-events-none absolute inset-x-5 bottom-24 z-20 rounded-2xl bg-[#1a1a1a]/90 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">{note.text}</p>
          )}

          <nav aria-label="App sections" className="grid shrink-0 grid-cols-5 border-t border-[#e3e5e8] bg-[#fbfbfc] pb-4 pt-1.5">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => go(t.id)} aria-current={tab === t.id ? "page" : undefined} className="relative flex flex-col items-center gap-0.5 py-1" style={{ color: tab === t.id ? "var(--sr-tab)" : "#8a8f98" }}>
                <TabGlyph id={t.id} />
                <span className="text-[10.5px] font-medium">{t.label}</span>
                {t.id === "chat" && unread > 0 && <i className="absolute right-[26%] top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff3b30] px-1 text-[10px] font-semibold not-italic text-white">{unread}</i>}
              </button>
            ))}
          </nav>
      </Phone>
    </DemoStage>
  );
}
