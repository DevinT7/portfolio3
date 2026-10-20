"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildGraph, routes, snap, type Graph, type LngLat, type Route, type Zones } from "@/lib/ctm/route";

/**
 * Live demo for the City of Austin entry: tap a start and an end, see the fastest walk and a safer one
 * that steers around crime hotspots. Same idea as the shipped app's routing (GraphHopper `foot` with the
 * hotspot polygons as avoid areas), run in the browser on a small OSM street graph. Opened lazily from
 * the project panel; nothing here loads on the home page.
 */

const BOUNDS: [LngLat, LngLat] = [[-97.765, 30.25], [-97.72, 30.3]]; // area the graph covers
const STYLE = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};
const SAFE = "#1d9e75";
const HOT = "#e24b4a";

const PRESETS: { label: string; a: LngLat; b: LngLat }[] = [
  { label: "Capitol → Rainey Street", a: [-97.7404, 30.2747], b: [-97.7385, 30.259] },
  { label: "Campus → Lady Bird Lake", a: [-97.7394, 30.2862], b: [-97.741, 30.264] },
];

const empty = { type: "FeatureCollection", features: [] } as const;
const line = (c: LngLat[]) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: c } }) as const;
const theme = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

type Result = { fast: Route; safe: Route };

export default function SafeRouteDemo() {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const data = useRef<{ graph: Graph; zones: Zones } | null>(null);
  const [pts, setPts] = useState<LngLat[]>([]);
  const [res, setRes] = useState<Result | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const state = useRef({ pts, res });

  // Paint whatever is in state into the map sources (also re-run after a style swap).
  const draw = useCallback(() => {
    const m = map.current;
    if (!m || !m.getSource("ctm-pins")) return; // layers not added yet (re-run from style.load)
    const { pts, res } = state.current;
    const set = (id: string, d: object) => (m.getSource(id) as GeoJSONSource | undefined)?.setData(d as never);
    set("ctm-fast", res ? line(res.fast.line) : empty);
    set("ctm-safe", res ? line(res.safe.line) : empty);
    set("ctm-pins", {
      type: "FeatureCollection",
      features: pts.map((c, i) => ({ type: "Feature", properties: { end: i === 1 }, geometry: { type: "Point", coordinates: c } })),
    });
  }, []);

  const run = useCallback((a: LngLat, b: LngLat, fit = true) => {
    const d = data.current;
    if (!d) return;
    const na = snap(d.graph, a), nb = snap(d.graph, b);
    if (na === null || nb === null) {
      setMsg("Outside the demo area. Tap closer to downtown or campus.");
      return;
    }
    const r = routes(d.graph, d.zones, na, nb);
    if (!r) { setMsg("No walking route between those points."); return; }
    const A = d.graph.nodes[na], B = d.graph.nodes[nb];
    setPts([A, B]);
    setRes(r);
    setMsg(null);
    if (fit) {
      const all = [...r.fast.line, ...r.safe.line];
      const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
      map.current?.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], { padding: 44, duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700 });
    }
  }, []);

  // Map + data, once.
  useEffect(() => {
    let dead = false;
    let obs: MutationObserver | undefined;
    (async () => {
      try {
        const [ml, g, z] = await Promise.all([
          import("maplibre-gl"),
          fetch("/ctm/graph.json").then((r) => r.json()),
          fetch("/ctm/zones.json").then((r) => r.json()),
        ]);
        if (dead || !box.current) return;
        // Turbopack can't bundle maplibre's inline worker, so serve the prebuilt one (copy of dist/maplibre-gl-worker.mjs; update with the package).
        ml.setWorkerUrl("/ctm/maplibre-worker.mjs");
        const zones: Zones = z.features.map((f: { geometry: { coordinates: LngLat[][] } }) => f.geometry.coordinates[0]);
        data.current = { graph: buildGraph(g, zones), zones };

        let current = theme();
        const m = new ml.Map({
          container: box.current,
          style: STYLE[current as "light" | "dark"],
          bounds: BOUNDS,
          maxBounds: [[BOUNDS[0][0] - 0.02, BOUNDS[0][1] - 0.02], [BOUNDS[1][0] + 0.02, BOUNDS[1][1] + 0.02]],
          cooperativeGestures: true,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
        });
        map.current = m;
        m.touchZoomRotate.disableRotation();

        const layers = () => {
          if (m.getSource("ctm-zones")) return;
          m.addSource("ctm-zones", { type: "geojson", data: z });
          m.addSource("ctm-fast", { type: "geojson", data: empty as never });
          m.addSource("ctm-safe", { type: "geojson", data: empty as never });
          m.addSource("ctm-pins", { type: "geojson", data: empty as never });
          m.addLayer({ id: "ctm-zones-fill", type: "fill", source: "ctm-zones", paint: { "fill-color": HOT, "fill-opacity": 0.2 } });
          m.addLayer({ id: "ctm-zones-line", type: "line", source: "ctm-zones", paint: { "line-color": HOT, "line-opacity": 0.55, "line-width": 1 } });
          m.addLayer({ id: "ctm-fast", type: "line", source: "ctm-fast", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": current === "dark" ? "#b9b8b0" : "#55554f", "line-width": 3, "line-dasharray": [1.5, 1.5] } });
          m.addLayer({ id: "ctm-safe", type: "line", source: "ctm-safe", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": SAFE, "line-width": 4.5 } });
          m.addLayer({
            id: "ctm-pins",
            type: "circle",
            source: "ctm-pins",
            paint: {
              "circle-radius": 7,
              "circle-color": ["case", ["get", "end"], "#ffffff", current === "dark" ? "#f0efea" : "#111111"],
              "circle-stroke-width": 3,
              "circle-stroke-color": ["case", ["get", "end"], current === "dark" ? "#f0efea" : "#111111", "#ffffff"],
            },
          });
          draw();
        };
        m.on("style.load", layers);
        // keep the attribution collapsed to its (i) button; it still opens on tap
        m.once("load", () => m.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show"));
        m.on("click", (e) => {
          const next = state.current.pts.length >= 2 ? [] : state.current.pts;
          const p: LngLat = [e.lngLat.lng, e.lngLat.lat];
          if (next.length === 0) {
            // first tap: just the start; clear any previous result
            setRes(null); setMsg(null);
            const s = snap(data.current!.graph, p);
            if (s === null) { setPts([]); setMsg("Outside the demo area. Tap closer to downtown or campus."); return; }
            const A = data.current!.graph.nodes[s];
            setPts([A]);
          } else {
            run(next[0], p);
          }
        });
        m.getCanvas().style.cursor = "crosshair";

        // follow the site's light/dark toggle
        obs = new MutationObserver(() => {
          const t = theme();
          if (t === current) return;
          current = t;
          m.setStyle(STYLE[t as "light" | "dark"]);
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        setReady(true);
      } catch {
        if (!dead) setFailed(true);
      }
    })();
    return () => {
      dead = true;
      obs?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, [run, draw]);

  useEffect(() => {
    state.current = { pts, res };
    draw();
  }, [pts, res, ready, draw]);

  const reset = () => { setPts([]); setRes(null); setMsg(null); map.current?.fitBounds(BOUNDS, { duration: 400 }); };
  const hint = res ? "Tap to start over" : pts.length === 1 ? "Tap a destination" : "Tap a start point";
  const same = res && Math.abs(res.safe.meters - res.fast.meters) < 5 && res.safe.safety >= res.fast.safety - 0.005;

  if (failed) return <p className="font-mono text-sm text-muted">The demo needs a connection to load map tiles. Try again later.</p>;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="label shrink-0">Try it · sample data</p>
        <p className="label text-right" aria-live="polite">{msg ?? hint}</p>
      </div>

      <div className="relative overflow-hidden rounded-[20px] border border-line bg-bg">
        <div ref={box} className="h-[19rem] w-full md:h-[22rem]" role="application" aria-label="Map of central Austin. Tap a start and a destination to compare routes." />
        {!ready && <p className="label pointer-events-none absolute inset-0 grid place-items-center">Loading map…</p>}
        <div className="pointer-events-none absolute left-2 top-2 flex gap-3 rounded-md border border-line bg-bg px-2.5 py-1.5 text-[11px] text-muted">
          <span className="flex items-center gap-1.5"><i className="inline-block h-[3px] w-3 rounded" style={{ background: SAFE }} />Safer</span>
          <span className="flex items-center gap-1.5"><i className="inline-block w-3 border-t-2 border-dashed border-muted" />Fastest</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: HOT, opacity: 0.45 }} />Hotspot</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => run(p.a, p.b)} className="label h-9 rounded-full border border-line px-3.5 text-fg transition-colors hover:border-fg">
            {p.label}
          </button>
        ))}
        {(pts.length > 0 || res) && (
          <button type="button" onClick={reset} className="label ml-auto h-9 px-2 text-fg hover:text-accent">Reset</button>
        )}
      </div>

      {res && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Score name="Fastest" r={res.fast} />
          <Score name="Safer" r={res.safe} good note={same ? "Already the safest way" : undefined} />
        </div>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted">Hotspots from Austin PD reports. Routes are simplified; the app used GraphHopper.</p>
    </div>
  );
}

function Score({ name, r, good, note }: { name: string; r: Route; good?: boolean; note?: string }) {
  return (
    <div className="rounded-2xl border border-line p-4" style={good ? { borderColor: SAFE } : undefined}>
      <p className="label">{name}</p>
      <p className="display mt-1 text-4xl">{Math.round(r.safety * 100)}%<span className="ml-1.5 font-mono text-xs text-muted">safe</span></p>
      <p className="mt-1 font-mono text-xs text-muted">{note ?? `${Math.max(1, Math.round(r.minutes))} min · ${(r.meters / 1609).toFixed(1)} mi`}</p>
    </div>
  );
}
