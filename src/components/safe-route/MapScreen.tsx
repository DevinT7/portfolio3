"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap, MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildGraph, routes, snap, type Graph, type LngLat, type Route, type Zones } from "@/lib/ctm/route";
import { BLUE, GREEN, Icon } from "./ui";

/**
 * Map tab, after the app's Map and Navigation screens: crime incidents (APD open data) as red rings, an optional
 * heatmap, hotspot polygons, a type filter, and a walking route planner with a safety score. Routes are computed in the
 * browser on an OSM graph (lib/ctm/route.ts); the shipped app called GraphHopper with the hotspots as avoid areas.
 */

const BOUNDS: [LngLat, LngLat] = [[-97.765, 30.25], [-97.72, 30.3]]; // area the route graph covers
const STYLE = "https://tiles.openfreemap.org/styles/positron"; // always light, like the app
const CATS = ["Theft", "Assault", "Burglary", "Vandalism", "Drugs", "Other"];
const PLACES: { name: string; at: LngLat }[] = [
  { name: "UT Tower", at: [-97.7394, 30.2862] },
  { name: "Texas Capitol", at: [-97.7404, 30.2747] },
  { name: "Austin City Hall", at: [-97.7467, 30.265] },
  { name: "Lady Bird Lake", at: [-97.741, 30.264] },
  { name: "Rainey Street", at: [-97.7385, 30.259] },
  { name: "7th and Chicon", at: [-97.727, 30.263] },
  { name: "South Congress", at: [-97.7497, 30.2535] },
];

const empty = { type: "FeatureCollection", features: [] } as const;
const lineFeature = (c: LngLat[]) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: c } }) as const;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Incident = { kind: string; cat: string; addr: string; date: string };
type Result = { fast: Route; safe: Route };
type Sheet = null | "filter" | "route";

const dist = (a: LngLat, b: LngLat) => Math.hypot((b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180), b[1] - a[1]);
function along(line: LngLat[], t: number): LngLat {
  const segs = line.slice(1).map((p, i) => dist(line[i], p));
  let want = segs.reduce((s, d) => s + d, 0) * t;
  for (let i = 0; i < segs.length; i++) {
    if (want <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? Math.min(1, want / segs[i]) : 0;
      return [line[i][0] + (line[i + 1][0] - line[i][0]) * k, line[i][1] + (line[i + 1][1] - line[i][1]) * k];
    }
    want -= segs[i];
  }
  return line[line.length - 1];
}
const scoreColor = (s: number) => (s >= 0.8 ? GREEN : s >= 0.5 ? "#e68a00" : "#d9534f");

export function MapScreen({ active, toast }: { active: boolean; toast: (m: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const data = useRef<{ graph: Graph; zones: Zones } | null>(null);
  const raf = useRef(0);

  const [cats, setCats] = useState<Set<string>>(new Set(CATS));
  const [heat, setHeat] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(4);
  const [avoid, setAvoid] = useState(true);
  const [res, setRes] = useState<Result | null>(null);
  const [shown, setShown] = useState<{ pts: LngLat[]; route: Route | null }>({ pts: [], route: null });
  const [walking, setWalking] = useState(false);
  const [sel, setSel] = useState<Incident | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const live = useRef({ cats, heat, shown });
  const paint = useCallback(() => {
    const m = map.current;
    if (!m || !m.getSource("ctm-pins")) return;
    const { cats, heat, shown } = live.current;
    const set = (id: string, d: object) => (m.getSource(id) as GeoJSONSource | undefined)?.setData(d as never);
    set("ctm-route", shown.route ? lineFeature(shown.route.line) : empty);
    set("ctm-pins", { type: "FeatureCollection", features: shown.pts.map((c, i) => ({ type: "Feature", properties: { end: i === 1 }, geometry: { type: "Point", coordinates: c } })) });
    const f = ["in", ["get", "cat"], ["literal", [...cats]]] as never;
    for (const id of ["ctm-inc", "ctm-halo", "ctm-heat"]) m.setFilter(id, f);
    m.setLayoutProperty("ctm-heat", "visibility", heat ? "visible" : "none");
  }, []);

  useEffect(() => {
    live.current = { cats, heat, shown };
    paint();
  }, [cats, heat, shown, ready, paint]);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setWalking(false);
    (map.current?.getSource("ctm-me") as GeoJSONSource | undefined)?.setData(empty as never);
  }, []);

  const find = useCallback(() => {
    const d = data.current;
    if (!d) return;
    if (from === to) return toast("Pick two different places.");
    const na = snap(d.graph, PLACES[from].at, 400), nb = snap(d.graph, PLACES[to].at, 400);
    const r = na === null || nb === null ? null : routes(d.graph, d.zones, na, nb);
    if (!r) return toast("No walking route between those places.");
    stop();
    setRes(r);
  }, [from, to, stop, toast]);

  const route = res ? (avoid ? res.safe : res.fast) : null;
  const same = res && Math.abs(res.safe.meters - res.fast.meters) < 5;

  const navigate = () => {
    const d = data.current;
    if (!res || !route || !d) return;
    setSheet(null);
    setShown({ pts: [route.line[0], route.line[route.line.length - 1]], route });
    const xs = route.line.map((p) => p[0]), ys = route.line.map((p) => p[1]);
    map.current?.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], { padding: { top: 60, bottom: 90, left: 40, right: 70 }, duration: reduced() ? 0 : 700 });
    if (reduced()) return;
    setWalking(true);
    const dur = Math.min(14000, Math.max(5000, route.meters * 9));
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      (map.current?.getSource("ctm-me") as GeoJSONSource | undefined)?.setData({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: along(route.line, t) } } as never);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else { setWalking(false); toast("You have arrived."); }
    };
    raf.current = requestAnimationFrame(tick);
  };

  const clearRoute = () => {
    stop();
    setShown({ pts: [], route: null });
    setRes(null);
    map.current?.fitBounds(BOUNDS, { duration: reduced() ? 0 : 400 });
  };

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const [ml, g, z, c] = await Promise.all([
          import("maplibre-gl"),
          fetch("/ctm/graph.json").then((r) => r.json()),
          fetch("/ctm/zones.json").then((r) => r.json()),
          fetch("/ctm/crimes.json").then((r) => r.json()),
        ]);
        if (dead || !box.current) return;
        // Turbopack can't bundle maplibre's inline worker, so serve the prebuilt one (copy of dist/maplibre-gl-worker.mjs; update with the package).
        ml.setWorkerUrl("/ctm/maplibre-worker.mjs");
        const zones: Zones = z.features.map((f: { geometry: { coordinates: LngLat[][] } }) => f.geometry.coordinates[0]);
        data.current = { graph: buildGraph(g, zones), zones };
        const crimes = {
          type: "FeatureCollection",
          features: (c.pts as [number, number, number, string, string, string][]).map(([x, y, k, kind, addr, date]) => ({
            type: "Feature", properties: { cat: c.cats[k], kind, addr, date }, geometry: { type: "Point", coordinates: [x, y] },
          })),
        };

        const m = new ml.Map({
          container: box.current,
          style: STYLE,
          bounds: BOUNDS,
          maxBounds: [[BOUNDS[0][0] - 0.03, BOUNDS[0][1] - 0.03], [BOUNDS[1][0] + 0.03, BOUNDS[1][1] + 0.03]],
          cooperativeGestures: true,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
        });
        map.current = m;
        m.touchZoomRotate.disableRotation();

        m.on("style.load", () => {
          if (m.getSource("ctm-zones")) return;
          const src = (id: string, d: unknown) => m.addSource(id, { type: "geojson", data: d as never });
          src("ctm-zones", z); src("ctm-crimes", crimes); src("ctm-route", empty); src("ctm-pins", empty); src("ctm-me", empty);
          m.addLayer({ id: "ctm-zones-fill", type: "fill", source: "ctm-zones", paint: { "fill-color": "#ff3b30", "fill-opacity": 0.1 } });
          m.addLayer({ id: "ctm-zones-line", type: "line", source: "ctm-zones", paint: { "line-color": "#ff3b30", "line-opacity": 0.45, "line-width": 1, "line-dasharray": [2, 2] } });
          m.addLayer({ id: "ctm-heat", type: "heatmap", source: "ctm-crimes", layout: { visibility: "none" }, paint: { "heatmap-radius": 26, "heatmap-intensity": 1, "heatmap-opacity": 0.8, "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(255,59,48,0)", 0.3, "rgba(255,160,40,0.5)", 0.6, "rgba(255,90,40,0.78)", 1, "rgba(220,20,20,0.95)"] } });
          m.addLayer({ id: "ctm-halo", type: "circle", source: "ctm-crimes", paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 8, 15, 22], "circle-color": "#ff3b30", "circle-opacity": 0.14 } });
          m.addLayer({ id: "ctm-inc", type: "circle", source: "ctm-crimes", paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 3, 15, 6], "circle-color": "rgba(255,59,48,0.18)", "circle-stroke-width": 1.5, "circle-stroke-color": "#e11d1d" } });
          m.addLayer({ id: "ctm-route", type: "line", source: "ctm-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#1a2cff", "line-width": 5 } });
          m.addLayer({ id: "ctm-pins", type: "circle", source: "ctm-pins", paint: { "circle-radius": 8, "circle-color": ["case", ["get", "end"], "#e0301e", "#1b8a3a"], "circle-stroke-width": 3, "circle-stroke-color": "#ffffff" } });
          m.addLayer({ id: "ctm-me", type: "circle", source: "ctm-me", paint: { "circle-radius": 8, "circle-color": BLUE, "circle-stroke-width": 3, "circle-stroke-color": "#ffffff" } });
          paint();
        });
        m.once("load", () => m.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show"));
        m.on("click", (e: MapMouseEvent) => {
          const hit = m.queryRenderedFeatures([[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]], { layers: ["ctm-inc"] })[0];
          setSel(hit ? (hit.properties as Incident) : null);
        });
        m.on("mousemove", (e) => { m.getCanvas().style.cursor = m.queryRenderedFeatures([[e.point.x - 6, e.point.y - 6], [e.point.x + 6, e.point.y + 6]], { layers: ["ctm-inc"] }).length ? "pointer" : ""; });
        setReady(true);
      } catch {
        if (!dead) setFailed(true);
      }
    })();
    return () => { dead = true; cancelAnimationFrame(raf.current); map.current?.remove(); map.current = null; };
  }, [paint]);

  // The tab keeps this mounted while hidden; tell the canvas when it becomes visible again.
  useEffect(() => { if (active) requestAnimationFrame(() => map.current?.resize()); }, [active, ready]);

  const toggleCat = (c: string) => setCats((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });

  if (failed) return <p className="p-6 text-sm text-[#666]">The map needs a connection to load tiles. Try again later.</p>;

  const fab = "grid h-12 w-12 place-items-center rounded-full text-white shadow-[0_3px_8px_rgba(0,0,0,0.25)]";
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#eef0f2]">
      <div ref={box} className="h-full w-full" role="application" aria-label="Map of central Austin with crime incidents and hotspots." />
      {!ready && <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-[#666]">Loading map…</p>}

      <div className="absolute right-3 top-3 flex flex-col gap-2.5">
        <button type="button" onClick={() => setSheet("filter")} aria-label="Filter crimes" className={fab} style={{ background: BLUE }}><Icon name="filter" size={22} /></button>
        <button type="button" onClick={() => setSheet("route")} aria-label="Plan a route" className={fab} style={{ background: BLUE }}><Icon name="directions" size={22} /></button>
      </div>
      <div className="absolute bottom-3 left-3 flex flex-col gap-2">
        <button type="button" onClick={() => map.current?.zoomIn()} aria-label="Zoom in" className={`${fab} !h-10 !w-10`} style={{ background: BLUE }}><Icon name="plus" size={20} stroke={2.4} /></button>
        <button type="button" onClick={() => map.current?.zoomOut()} aria-label="Zoom out" className={`${fab} !h-10 !w-10`} style={{ background: BLUE }}><Icon name="minus" size={20} stroke={2.4} /></button>
      </div>

      {shown.route && !sheet && (
        <div className="absolute inset-x-3 bottom-3 ml-14 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: scoreColor(shown.route.safety) }}>Safety Score: {Math.round(shown.route.safety * 100)}%</p>
            <p className="text-xs text-[#666]">{Math.max(1, Math.round(shown.route.minutes))} min · {(shown.route.meters / 1609).toFixed(1)} mi{walking ? " · Walking…" : ""}</p>
          </div>
          <button type="button" onClick={clearRoute} className="h-9 rounded-full bg-[#f1f3f5] px-4 text-sm font-semibold">Clear</button>
        </div>
      )}

      {sel && !sheet && (
        <div className="absolute inset-x-3 top-3 mr-16 rounded-2xl bg-white p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight">{sel.kind}</p>
              <p className="mt-1 text-xs text-[#666]">{sel.addr || "Address withheld"}</p>
              <p className="text-xs text-[#666]">{sel.date}</p>
            </div>
            <button type="button" onClick={() => setSel(null)} aria-label="Close" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f1f3f5]"><Icon name="x" size={14} /></button>
          </div>
        </div>
      )}

      {sheet && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/30" onClick={() => setSheet(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-full overflow-y-auto rounded-t-[22px] bg-white px-4 pb-5 pt-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.15)]">
            <div className="mx-auto h-1 w-9 rounded-full bg-[#d8dbe0]" />
            {sheet === "filter" ? (
              <>
                <div className="mt-3 flex items-center justify-between">
                  <h3 className="sr-h">Filter Crimes</h3>
                  <button type="button" onClick={() => setSheet(null)} className="text-sm font-semibold" style={{ color: BLUE }}>Done</button>
                </div>
                <ul className="mt-2">
                  {CATS.map((c) => (
                    <li key={c}>
                      <button type="button" onClick={() => toggleCat(c)} aria-pressed={cats.has(c)} className="flex w-full items-center justify-between border-b border-[#f0f0f0] py-3 text-[15px]">
                        {c}
                        <span className="grid h-6 w-6 place-items-center rounded-md border-2 text-white" style={{ borderColor: cats.has(c) ? BLUE : "#c9ced4", background: cats.has(c) ? BLUE : "transparent" }}>{cats.has(c) && <Icon name="check" size={14} stroke={3} />}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between py-3.5 text-[15px]">
                  Show heatmap
                  <Switch on={heat} set={setHeat} label="Show heatmap" />
                </div>
                <div className="flex gap-2.5">
                  <button type="button" onClick={() => setCats(new Set(CATS))} className="h-11 flex-1 rounded-xl bg-[#f1f3f5] text-sm font-semibold">Select all</button>
                  <button type="button" onClick={() => setCats(new Set())} className="h-11 flex-1 rounded-xl bg-[#f1f3f5] text-sm font-semibold">Clear all</button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-3 flex items-center justify-between">
                  <h3 className="sr-h">Enter your route</h3>
                  <button type="button" onClick={() => setSheet(null)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f3f5]"><Icon name="x" size={15} /></button>
                </div>
                <label className="mt-3 block text-xs font-medium text-[#666]" htmlFor="sr-from">Start location</label>
                <select id="sr-from" value={from} onChange={(e) => { setFrom(+e.target.value); setRes(null); }} className="sr-input mt-1 h-12 appearance-none">
                  {PLACES.map((p, i) => <option key={p.name} value={i}>{p.name}, Austin, TX</option>)}
                </select>
                <label className="mt-3 block text-xs font-medium text-[#666]" htmlFor="sr-to">End location</label>
                <select id="sr-to" value={to} onChange={(e) => { setTo(+e.target.value); setRes(null); }} className="sr-input mt-1 h-12 appearance-none">
                  {PLACES.map((p, i) => <option key={p.name} value={i}>{p.name}, Austin, TX</option>)}
                </select>
                <div className="mt-3.5 flex items-center justify-between text-[15px]">
                  Avoid danger zones
                  <Switch on={avoid} set={(v) => { setAvoid(v); }} label="Avoid danger zones" />
                </div>
                <button type="button" onClick={find} className="mt-3.5 h-12 w-full rounded-xl bg-black text-base font-semibold text-white">Find Route</button>
                {route && (
                  <>
                    <p className="mt-3.5 rounded-xl bg-[#f8f9fa] py-3 text-center text-lg font-bold" style={{ color: scoreColor(route.safety) }}>Safety Score: {Math.round(route.safety * 100)}%</p>
                    <p className="mt-1.5 text-center text-xs text-[#666]">
                      {Math.max(1, Math.round(route.minutes))} min · {(route.meters / 1609).toFixed(1)} mi
                      {!avoid && res && !same && res.safe.safety > res.fast.safety ? ` · a safer route scores ${Math.round(res.safe.safety * 100)}%` : ""}
                    </p>
                    {!avoid && res && !same && res.safe.safety > res.fast.safety + 0.02 && (
                      <button type="button" onClick={() => setAvoid(true)} className="mt-2 h-11 w-full rounded-xl bg-[#e8f5ec] text-sm font-semibold" style={{ color: GREEN }}>Find alternative route</button>
                    )}
                    <button type="button" onClick={navigate} className="mt-2.5 h-12 w-full rounded-xl text-base font-semibold text-white" style={{ background: BLUE }}>Navigate on Map</button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Switch({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} className="relative h-[30px] w-[50px] rounded-full transition-colors" style={{ background: on ? GREEN : "#d8dbe0" }}>
      <i className="absolute top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow transition-all" style={{ left: on ? 22 : 2 }} />
    </button>
  );
}

