/**
 * Walking routes for the Safe Route demo. Same idea as the shipped app (GraphHopper `foot` with the
 * hotspot polygons as `avoid` areas), run in the browser on a small OSM graph (scripts/build-ctm-graph.mjs).
 * "Fastest" is plain shortest path; "safer" adds a penalty for edges that cross a hotspot.
 */

export type LngLat = [number, number];
type Edge = { to: number; len: number; shape: LngLat[]; hot: number }; // hot: share of the edge inside a hotspot, 0..1

export type Graph = { nodes: LngLat[]; adj: Edge[][] };
export type Zones = LngLat[][]; // polygon outer rings
export type Route = { line: LngLat[]; meters: number; minutes: number; safety: number }; // safety: 0..1, share of the walk outside hotspots

const WALK_MPS = 1.4;
const HOT_PENALTY = 14; // a fully-in-hotspot meter costs this many times a normal one
const SAMPLE_M = 15;

const inRing = ([x, y]: LngLat, ring: LngLat[]) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const inZones = (p: LngLat, zones: Zones) => zones.some((r) => inRing(p, r));

const meters = (a: LngLat, b: LngLat) => {
  const k = Math.PI / 180;
  return Math.hypot((b[0] - a[0]) * k * Math.cos(((a[1] + b[1]) / 2) * k), (b[1] - a[1]) * k) * 6371000;
};

/** Share of a line (by length) that sits inside a hotspot, sampled every ~15 m. */
function hotShare(line: LngLat[], zones: Zones) {
  let hot = 0, total = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], len = meters(a, b);
    const n = Math.max(1, Math.round(len / SAMPLE_M));
    for (let s = 0; s < n; s++) {
      const t = (s + 0.5) / n;
      if (inZones([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], zones)) hot += len / n;
    }
    total += len;
  }
  return total ? hot / total : 0;
}

type RawGraph = { nodes: LngLat[]; edges: [number, number, number, number[]?][] };

export function buildGraph(raw: RawGraph, zones: Zones): Graph {
  const adj: Edge[][] = raw.nodes.map(() => []);
  for (const [a, b, len, mid] of raw.edges) {
    const via: LngLat[] = [];
    for (let i = 0; mid && i < mid.length; i += 2) via.push([mid[i], mid[i + 1]]);
    const shape = [raw.nodes[a], ...via, raw.nodes[b]];
    const hot = hotShare(shape, zones);
    adj[a].push({ to: b, len, shape, hot });
    adj[b].push({ to: a, len, shape: [...shape].reverse(), hot });
  }
  return { nodes: raw.nodes, adj };
}

/** Closest graph node to a tap, or null when the tap is too far from any street (meters). */
export function snap(g: Graph, p: LngLat, maxM = 250): number | null {
  let best = -1, bd = Infinity;
  for (let i = 0; i < g.nodes.length; i++) {
    const d = meters(p, g.nodes[i]);
    if (d < bd) { bd = d; best = i; }
  }
  return bd <= maxM ? best : null;
}

function search(g: Graph, from: number, to: number, penalty: number): Edge[] | null {
  const cost = new Map<number, number>([[from, 0]]);
  const prev = new Map<number, { node: number; edge: Edge }>();
  const open: [number, number][] = [[meters(g.nodes[from], g.nodes[to]), from]]; // [f, node]; small graph, linear pop is fine
  const done = new Set<number>();
  while (open.length) {
    let k = 0;
    for (let i = 1; i < open.length; i++) if (open[i][0] < open[k][0]) k = i;
    const [, u] = open.splice(k, 1)[0];
    if (done.has(u)) continue;
    if (u === to) break;
    done.add(u);
    for (const e of g.adj[u]) {
      const c = cost.get(u)! + e.len * (1 + penalty * e.hot);
      if (c < (cost.get(e.to) ?? Infinity)) {
        cost.set(e.to, c);
        prev.set(e.to, { node: u, edge: e });
        open.push([c + meters(g.nodes[e.to], g.nodes[to]), e.to]);
      }
    }
  }
  if (!prev.has(to) && from !== to) return null;
  const path: Edge[] = [];
  for (let n = to; n !== from; n = prev.get(n)!.node) path.push(prev.get(n)!.edge);
  return path.reverse();
}

function toRoute(path: Edge[], zones: Zones): Route {
  const line: LngLat[] = [];
  let m = 0;
  for (const e of path) { line.push(...(line.length ? e.shape.slice(1) : e.shape)); m += e.len; }
  return { line, meters: m, minutes: m / WALK_MPS / 60, safety: 1 - hotShare(line, zones) };
}

export function routes(g: Graph, zones: Zones, a: number, b: number): { fast: Route; safe: Route } | null {
  const f = search(g, a, b, 0), s = search(g, a, b, HOT_PENALTY);
  return f && s ? { fast: toRoute(f, zones), safe: toRoute(s, zones) } : null;
}
