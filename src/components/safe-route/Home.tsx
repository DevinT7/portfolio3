"use client";

import { useState } from "react";
import { ALERTS, CAMPAIGNS, RESOURCES } from "./data";
import { AMBER, BLUE, GREEN, Icon, RED, Tile } from "./ui";
import type { Tab } from "./SafeRouteApp";

const LEVEL = { high: RED, medium: AMBER, low: "#9aa0a6" } as const;

type Props = { go: (t: Tab) => void; joined: Set<string>; join: (id: string) => void; reports: number; toast: (m: string) => void };

export function Home({ go, joined, join, reports, toast }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const toCampaigns = () => document.getElementById("sr-campaigns")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const actions = [
    { label: "Safety Map", sub: "View crime hotspots", icon: "pin", color: BLUE, run: () => go("map") },
    { label: "Report Incident", sub: "Share safety concerns", icon: "Assault", color: RED, run: () => go("report") },
    { label: "Community Feed", sub: "Latest updates", icon: "comment", color: AMBER, run: () => go("feed") },
    { label: "Safety Campaigns", sub: `${joined.size} joined`, icon: "check", color: GREEN, run: toCampaigns },
  ];

  return (
    <div>
      <div className="relative h-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ctm/app/hero.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 grid place-content-center bg-black/40 px-5 text-center text-white">
          <h2 className="text-[22px] font-bold leading-tight">Community Safety Hub</h2>
          <p className="mt-1.5 text-sm opacity-90">Stay informed, stay connected, stay safe</p>
        </div>
      </div>

      <div className="px-4 pb-8 pt-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            [102, "Active Members", BLUE, "shield"],
            [CAMPAIGNS.length, "Safety Campaigns", GREEN, "people"],
            [reports, "Recent Reports", RED, "alert"],
          ].map(([n, l, c, ic]) => (
            <div key={l} className="sr-card flex flex-col items-center px-1.5 py-3.5 text-center">
              <Icon name={ic as string} size={26} color={c as string} />
              <p className="mt-2 text-2xl font-bold leading-none">{n}</p>
              <p className="mt-1.5 text-[11px] leading-tight text-[#666]">{l}</p>
            </div>
          ))}
        </div>

        <h3 className="sr-h mt-7">Quick Actions</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button key={a.label} type="button" onClick={a.run} className="sr-card flex flex-col items-center px-3 py-4 text-center active:scale-[0.97]">
              <Tile color={a.color}><Icon name={a.icon} size={22} /></Tile>
              <p className="mt-2.5 text-[15px] font-semibold leading-tight">{a.label}</p>
              <p className="mt-1 text-xs text-[#666]">{a.sub}</p>
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <h3 className="sr-h">Recent Alerts</h3>
          <button type="button" onClick={() => go("feed")} className="text-sm font-medium text-[#007aff]">See All</button>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {ALERTS.map((a) => (
            <li key={a.id} className="sr-card-sm p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold"><i className="h-2 w-2 rounded-full" style={{ background: LEVEL[a.level] }} />{a.type}</span>
                <span className="text-xs text-[#666]">{a.when}</span>
              </div>
              <p className="mt-2 text-sm text-[#666]">{a.place}</p>
              <p className="mt-1 text-[13px] leading-snug">{a.text}</p>
            </li>
          ))}
        </ul>

        <h3 id="sr-campaigns" className="sr-h mt-7 scroll-mt-3">Safety Campaigns</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {CAMPAIGNS.map((c, i) => {
            const on = joined.has(c.id);
            const isOpen = open === c.id;
            const color = [GREEN, AMBER, RED, BLUE, "#e91e63", "#9c27b0"][i];
            return (
              <li key={c.id} className="sr-card-sm overflow-hidden">
                <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen} className="flex w-full items-center gap-3 p-4 text-left">
                  <Tile color={color} size={44}><Icon name="check" size={20} /></Tile>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-tight">{c.title}</p>
                    <p className="mt-0.5 text-xs text-[#666]">{c.blurb}</p>
                    <p className="mt-1 text-xs font-medium" style={{ color: on ? GREEN : "#666" }}>{c.people + (on ? 1 : 0)} participants{on ? " · Joined" : ""}</p>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-[#eee] px-4 pb-4 pt-3 text-sm leading-relaxed">
                    <p>{c.about}</p>
                    <ul className="mt-2.5 flex flex-col gap-1.5">
                      {c.does.map((d) => (
                        <li key={d} className="flex gap-2"><span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />{d}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-[#666]">Meets {c.meets}</p>
                    <button
                      type="button"
                      onClick={() => { join(c.id); toast(on ? `Left ${c.title}` : `Joined ${c.title}`); }}
                      className="mt-3 h-11 w-full rounded-xl text-[15px] font-semibold text-white"
                      style={{ background: on ? "#ff3b30" : GREEN }}
                    >
                      {on ? "Leave Safety Campaign" : "Join Safety Campaign"}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <h3 className="sr-h mt-7">Emergency Resources</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {RESOURCES.map((r, i) => (
            <li key={r.id}>
              <button type="button" onClick={() => toast(`Demo only. This would dial ${r.number}.`)} className="sr-card-sm flex w-full items-center gap-3 p-4 text-left">
                <Tile color={[RED, "#e91e63", "#9c27b0", "#3f51b5"][i]} size={40}><Icon name="Assault" size={18} /></Tile>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-tight">{r.title}</p>
                  <p className="mt-0.5 text-xs text-[#666]">{r.blurb}</p>
                </div>
                <span className="text-sm font-semibold text-[#007aff]">{r.number}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
