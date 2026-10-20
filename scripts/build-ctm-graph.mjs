// Builds public/ctm/graph.json: a compact walking graph for the Safe Route demo.
// Usage: node scripts/build-ctm-graph.mjs <overpass-export.json>
// Export query (any bbox covering 30.250,-97.765,30.300,-97.720): ways with highway=primary..residential; footways are skipped.
// Output keeps only intersections/endpoints; each edge carries its shape so the line follows the street.
import { readFileSync, writeFileSync } from "node:fs";

const src = JSON.parse(readFileSync(process.argv[2], "utf8"));
const BOX = { s: 30.250, w: -97.765, n: 30.300, e: -97.720 };
const SKIP = new Set(["service", "steps", "footway", "path", "cycleway"]);

const pos = new Map();
for (const el of src.elements) if (el.type === "node") pos.set(el.id, [el.lon, el.lat]);
const inBox = ([x, y]) => x >= BOX.w && x <= BOX.e && y >= BOX.s && y <= BOX.n;

const ways = src.elements.filter((e) => e.type === "way" && !SKIP.has(e.tags?.highway));
const use = new Map();
for (const w of ways) for (const id of w.nodes) use.set(id, (use.get(id) ?? 0) + 1);
const keep = (w, i) => i === 0 || i === w.nodes.length - 1 || use.get(w.nodes[i]) > 1;

const R = 6371000, rad = Math.PI / 180;
const dist = (a, b) => {
  const dx = (b[0] - a[0]) * rad * Math.cos(((a[1] + b[1]) / 2) * rad), dy = (b[1] - a[1]) * rad;
  return Math.hypot(dx, dy) * R;
};

const nodeIdx = new Map(), nodes = [], edges = [];
const idx = (id) => {
  if (!nodeIdx.has(id)) { nodeIdx.set(id, nodes.length); nodes.push(pos.get(id).map((v) => +v.toFixed(5))); }
  return nodeIdx.get(id);
};
const r5 = (p) => p.map((v) => +v.toFixed(5));

for (const w of ways) {
  let start = null, shape = [];
  for (let i = 0; i < w.nodes.length; i++) {
    const p = pos.get(w.nodes[i]);
    if (!p || !inBox(p)) { start = null; shape = []; continue; }
    if (start === null) { start = i; shape = [p]; if (!keep(w, i)) { start = null; shape = []; } continue; }
    shape.push(p);
    if (keep(w, i)) {
      let len = 0;
      for (let k = 1; k < shape.length; k++) len += dist(shape[k - 1], shape[k]);
      const mid = shape.slice(1, -1).map(r5);
      edges.push([idx(w.nodes[start]), idx(w.nodes[i]), Math.round(len), ...(mid.length ? [mid.flat()] : [])]);
      start = i; shape = [p];
    }
  }
}

// largest connected component only, so every tap can route somewhere
const adj = nodes.map(() => []);
for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
const comp = new Array(nodes.length).fill(-1), sizes = [];
for (let s = 0; s < nodes.length; s++) {
  if (comp[s] >= 0) continue;
  const c = sizes.length; let n = 0; const st = [s]; comp[s] = c;
  while (st.length) { const u = st.pop(); n++; for (const v of adj[u]) if (comp[v] < 0) { comp[v] = c; st.push(v); } }
  sizes.push(n);
}
const big = sizes.indexOf(Math.max(...sizes));
const remap = new Map(); const N = [];
nodes.forEach((p, i) => { if (comp[i] === big) { remap.set(i, N.length); N.push(p); } });
const E = edges.filter(([a]) => comp[a] === big).map(([a, b, l, g]) => [remap.get(a), remap.get(b), l, ...(g ? [g] : [])]);

writeFileSync("public/ctm/graph.json", JSON.stringify({ nodes: N, edges: E }));
console.log(`${N.length} nodes, ${E.length} edges`);
