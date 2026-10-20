// Builds public/ctm/crimes.json for the Safe Route demo from the app's crime_data.json (APD open data).
// Usage: node scripts/build-ctm-crimes.mjs <path/to/crime_data.json>
// Keeps incidents near central Austin and buckets the ~100 raw offense names into 6 categories.
import { readFileSync, writeFileSync } from "node:fs";

const rows = JSON.parse(readFileSync(process.argv[2], "utf8"));
const BOX = { s: 30.22, w: -97.8, n: 30.33, e: -97.68 };
const CATS = ["Theft", "Assault", "Burglary", "Vandalism", "Drugs", "Other"];
const cat = (d) =>
  /THEFT|ROBBERY|SHOPLIFT|STOLEN|FRAUD|FORGERY|CREDIT CARD/.test(d) ? 0
  : /ASSAULT|HARASS|THREAT|FAMILY|DISTURB|STALK|KIDNAP|WEAPON|TERRORISTIC/.test(d) ? 1
  : /BURGLARY|TRESPASS|BREAK/.test(d) ? 2
  : /DAMAGE|CRIMINAL MISCHIEF|GRAFFITI|VANDAL|ARSON/.test(d) ? 3
  : /MARIJUANA|DRUG|NARCOTIC|CONTROLLED|DWI|INTOXIC|ALCOHOL|PUBLIC INTOX/.test(d) ? 4
  : 5;
const title = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const pts = [];
for (const r of rows) {
  const lat = parseFloat(r.Latitude), lng = parseFloat(r.Longitude);
  if (!(lat >= BOX.s && lat <= BOX.n && lng >= BOX.w && lng <= BOX.e)) continue;
  pts.push([+lng.toFixed(5), +lat.toFixed(5), cat(r["Highest Offense Description"]), title(r["Highest Offense Description"]), title(r.Address ?? ""), (r["Occurred Date"] ?? "").slice(0, 10)]);
}
writeFileSync("public/ctm/crimes.json", JSON.stringify({ cats: CATS, pts }));
const n = CATS.map((c, i) => `${c} ${pts.filter((p) => p[2] === i).length}`).join(", ");
console.log(`${pts.length} of ${rows.length} incidents. ${n}`);
