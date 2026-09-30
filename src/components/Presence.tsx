"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

type Peer = { x: number; y: number; city: string; hue: number; path: string; seen: number; fading?: boolean };

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FADE_MS = 4000; // quiet this long: fade out
const IDLE_MS = 6000; // then drop
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
  // Phones join and are counted (and their touches show up for desktop visitors), but don't draw cursors:
  // a phone's page is laid out too differently for another visitor's position to mean anything.
  const draws = useRef(false);

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  useEffect(() => {
    if (!URL || !KEY) return;
    draws.current = matchMedia("(pointer: fine)").matches;
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
      if (!draws.current || typeof from !== "string" || !Number.isFinite(x) || !Number.isFinite(y)) return;
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
      if (alone.current || document.hidden) return;
      const now = performance.now();
      if (now - last < 50) return;
      last = now;
      ch.send({
        type: "broadcast",
        event: "cursor",
        payload: { id, x: e.clientX / innerWidth, y: (e.clientY + scrollY) / document.documentElement.scrollHeight, city: me.current.city, hue: me.current.hue, path: pathRef.current },
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });

    // Fade cursors that have gone quiet, then drop them.
    const sweep = setInterval(() => {
      const now = Date.now();
      setPeers((p) => {
        let changed = false;
        const next: Record<string, Peer> = {};
        for (const [k, v] of Object.entries(p)) {
          if (now - v.seen > IDLE_MS) {
            changed = true;
            continue;
          }
          const fading = now - v.seen > FADE_MS;
          if (fading !== !!v.fading) {
            changed = true;
            next[k] = { ...v, fading };
          } else next[k] = v;
        }
        return changed ? next : p;
      });
    }, 1000);

    return () => {
      dead = true;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
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
            <Cursor key={k} peer={p} />
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

/**
 * One remote cursor. Updates arrive ~20 times a second, so instead of jumping to each one it eases
 * toward the latest position every frame, which reads as one continuous glide.
 */
function Cursor({ peer }: { peer: Peer }) {
  const el = useRef<HTMLDivElement>(null);
  const at = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef(0);
  const tx = peer.x * innerWidth;
  const ty = peer.y * document.documentElement.scrollHeight;

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!at.current || reduce) at.current = { x: tx, y: ty };
    const tick = () => {
      const c = at.current!;
      c.x += (tx - c.x) * 0.22;
      c.y += (ty - c.y) * 0.22;
      node.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      if (Math.abs(tx - c.x) + Math.abs(ty - c.y) > 0.3) raf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf.current);
    tick();
    return () => cancelAnimationFrame(raf.current);
  }, [tx, ty]);

  const { hue } = peer;
  return (
    <div
      ref={el}
      className="cursor-in absolute top-0 left-0 will-change-transform"
      style={{ opacity: peer.fading ? 0 : 1, transition: "opacity 0.6s ease" }}
    >
      <svg width="18" height="20" viewBox="0 0 18 20" className="absolute -top-0.5 -left-0.5 overflow-visible" style={{ filter: "drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.28))" }}>
        <path
          d="M1.5 1.2v14.3l3.6-3.2 2.6 5.6 2.3-1.1-2.6-5.5h4.9z"
          fill={`hsl(${hue} 62% 50%)`}
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute top-[18px] left-[14px] rounded-full px-2.5 py-[3px] text-[11px] leading-4 font-medium tracking-[0.01em] whitespace-nowrap text-white shadow-[0_2px_8px_rgb(0_0_0/0.16)]"
        style={{ background: `hsl(${hue} 50% 38% / 0.94)` }}
      >
        {peer.city || "Visitor"}
      </span>
    </div>
  );
}
