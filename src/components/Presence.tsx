"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

type Peer = { x: number; y: number; city: string; hue: number; path: string; seen: number };

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IDLE_MS = 6000;
const MAX_PEERS = 25;

/**
 * Live visitors, on Supabase Realtime (presence + broadcast; no tables). Each visitor sees the
 * others' cursors on the same page, labelled with a city from the edge's IP geolocation. Nothing is
 * stored and nothing is sent until someone else is here. Renders nothing without the env vars.
 */
export function Presence() {
  const path = usePathname();
  const pathRef = useRef(path);
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const [others, setOthers] = useState(0);
  const channel = useRef<RealtimeChannel | null>(null);
  const me = useRef({ id: "", hue: 0, city: "" });
  const alone = useRef(true);

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  useEffect(() => {
    if (!URL || !KEY) return;
    if (matchMedia("(pointer: coarse)").matches && !matchMedia("(pointer: fine)").matches) return; // no cursors on phones

    const id = crypto.randomUUID();
    me.current = { id, hue: Math.floor(Math.random() * 360), city: "" };
    let dead = false;
    let last = 0;

    const client = createClient(URL, KEY, { realtime: { params: { eventsPerSecond: 20 } } });
    const ch = client.channel("portfolio:presence", { config: { presence: { key: id }, broadcast: { self: false } } });
    channel.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const keys = Object.keys(ch.presenceState()).filter((k) => k !== id);
      alone.current = keys.length === 0;
      setOthers(keys.length);
      setPeers((p) => Object.fromEntries(Object.entries(p).filter(([k]) => keys.includes(k))));
    });

    ch.on("broadcast", { event: "cursor" }, ({ payload }) => {
      const { id: from, x, y, city, hue, path: at } = payload ?? {};
      if (typeof from !== "string" || !Number.isFinite(x) || !Number.isFinite(y)) return;
      setPeers((p) => {
        if (!(from in p) && Object.keys(p).length >= MAX_PEERS) return p;
        return { ...p, [from]: { x, y, city: String(city ?? "").slice(0, 40), hue: Number(hue) || 0, path: String(at), seen: Date.now() } };
      });
    });

    fetch("/api/geo")
      .then((r) => r.json())
      .then((g) => {
        if (typeof g.city === "string") me.current.city = g.city;
      })
      .catch(() => {})
      .finally(() => {
        if (dead) return;
        ch.subscribe((status) => {
          if (status === "SUBSCRIBED") ch.track({ city: me.current.city });
        });
      });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || alone.current || document.hidden) return;
      const now = performance.now();
      if (now - last < 50) return;
      last = now;
      ch.send({
        type: "broadcast",
        event: "cursor",
        payload: { id, x: e.clientX / innerWidth, y: e.clientY + scrollY, city: me.current.city, hue: me.current.hue, path: pathRef.current },
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Drop cursors that have gone quiet.
    const sweep = setInterval(() => {
      const cutoff = Date.now() - IDLE_MS;
      setPeers((p) => {
        const live = Object.entries(p).filter(([, v]) => v.seen > cutoff);
        return live.length === Object.keys(p).length ? p : Object.fromEntries(live);
      });
    }, 2000);

    return () => {
      dead = true;
      window.removeEventListener("pointermove", onMove);
      clearInterval(sweep);
      client.removeChannel(ch);
      channel.current = null;
    };
  }, []);

  if (!URL || !KEY) return null;

  return (
    <>
      <div aria-hidden className="pointer-events-none absolute top-0 left-0 z-[60] h-0 w-full">
        {Object.entries(peers)
          .filter(([, p]) => p.path === path)
          .map(([k, p]) => (
            <div
              key={k}
              className="absolute top-0 left-0 transition-transform duration-100 ease-linear will-change-transform"
              style={{ transform: `translate3d(${p.x * 100}vw, ${p.y}px, 0)` }}
            >
              <svg width="14" height="18" viewBox="0 0 14 18" className="drop-shadow-sm" style={{ color: `hsl(${p.hue} 70% 50%)` }}>
                <path d="M1 1l11 7-5 1.5L5 15z" fill="currentColor" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
              </svg>
              <span
                className="absolute top-4 left-3 rounded-full px-2 py-0.5 font-mono text-[0.65rem] whitespace-nowrap text-white"
                style={{ background: `hsl(${p.hue} 70% 42%)` }}
              >
                {p.city || "Visitor"}
              </span>
            </div>
          ))}
      </div>
      {others > 0 && (
        <p className="label fixed bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5" role="status">
          <span className="size-1.5 rounded-full bg-accent" />
          {others === 1 ? "1 other here" : `${others} others here`}
        </p>
      )}
    </>
  );
}
