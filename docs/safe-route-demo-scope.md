# Safe Route live demo: scope

Branch: `feature/safe-route-demo`. Source app: `~/Documents/GitHub/Safe-Route-App` (Expo / React Native, "City of Austin" entry, id `ctm`).

## Goal

A "Try it" block inside the City of Austin side panel. Visitor taps a start and an end point on a small Austin map and sees two routes: the fastest and a safer one that avoids crime hotspots, each with a safety score. It runs in the browser with no backend and no API key.

## Where it lives (UI)

- Inside the existing `Sheet` panel for `ctm`, between the summary and the screenshot strip. No new footer button, no new page, no extra scroll length on the home page.
- Panel width is 34rem, so the map is about 420 px wide and 260 px tall (4:3 on mobile, full panel width).
- Labels: "Try it · sample data" above, a one-line hint that changes with state ("Tap two points" → "Now pick a destination"), a legend inside the map, two score tiles below, a one-line honesty note ("Sample of Austin PD reports, 2023. Routes are simplified.").
- Uses site tokens (`--bg`, `--fg`, `--muted`, `--line`, `--accent`) and the mono `label` style. Red zones and the green route are the only extra colors. Light and dark both work.
- Empty state shows two preset chips (for example "Campus → Downtown") so one tap runs the demo. Reset by tapping the map again.
- Reduced motion: route draws instantly instead of animating.
- Lazy: the map code and data only load when the panel opens (dynamic import), so the home page weight doesn't change.

## What gets recreated from the app

| Real app | Web demo |
|---|---|
| `assets/optimized_danger_zones.json`: 29 danger-zone polygons (20 KB) | Copy as-is to `public/ctm/zones.json` or inline. These are the hotspots. |
| GraphHopper `foot` route with an `avoid` MultiPolygon (`components/NavigationModal.tsx`) | Client-side A* on a small walking graph, with zone polygons as blocked or penalized edges. "Fastest" = same search with no penalty. |
| `checkRouteSafety`: score = share of route segments outside any zone | Port directly (about 30 lines, point-in-polygon). |
| Crime heatmap (`crime_data.json`, 1000 incidents) | Optional layer from `crime_heatmap.csv` (27 KB), downsampled. Off by default. |
| Chat, buddy system, reports, campaigns | Not included. Not part of the routing story. |

## Status: built with MapLibre

Decision: MapLibre GL (OpenFreeMap tiles, no key) instead of SVG, for real streets. Built: `src/lib/ctm/route.ts`, `src/components/SafeRouteDemo.tsx`, `scripts/build-ctm-graph.mjs`, data in `public/ctm/` (graph 282 KB / 85 KB gzip, zones 21 KB), hooked into `Sheet.tsx` via `demo: "safe-route"` on the `ctm` entry. `public/ctm/maplibre-worker.mjs` is a copy of the package worker (Turbopack can't bundle it); refresh it when upgrading maplibre-gl.

## Original open decisions

1. Map renderer: plain SVG (no dependency, matches the mockup, fits a stylized downtown/campus area) vs MapLibre GL (real streets, about 200 KB gzip, needs a free tile source). Recommended: SVG first. It's lighter, themeable, and avoids a tile provider. MapLibre is a later upgrade.
2. Street graph: build once from OpenStreetMap for downtown plus campus (about 300 nodes) with a script, and commit the resulting JSON. Needs a one-off build script in `scripts/`, not a runtime fetch.
3. Zone data in the repo: fine to ship (public APD data, rectangles only). Don't ship the raw incident rows.

## Security note

`Safe-Route-App/components/NavigationModal.tsx` contains a hardcoded GraphHopper API key (two places). Do not copy it into this repo. Rotate it, since the source repo is on GitHub. The demo needs no key.

## Build plan

1. `scripts/build-ctm-graph.mjs`: OSM extract → `public/ctm/graph.json` (nodes, edges, lengths).
2. `src/lib/ctm/route.ts`: A*, safety score, point-in-polygon. Pure functions, unit-testable.
3. `src/components/SafeRouteDemo.tsx`: SVG map, tap handling, presets, score tiles.
4. Hook into `Sheet.tsx` for `id === "ctm"` only (or add an optional `demo` field on `Entry` in `site.ts`).
5. Verify: both themes, mobile width, keyboard (tab to chips, arrow-key nudge of pins), `prefers-reduced-motion`.

Estimated size: about 400 lines plus the graph JSON (under 50 KB).

## Risks

- Routes follow a simplified graph, so the demo is a re-creation, not the shipped routing. The note on the panel says so.
- Only a small area is covered. Taps outside it snap to the nearest node or show "Outside the demo area".
