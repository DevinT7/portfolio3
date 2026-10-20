// Sample content and the little bit of logic behind the Interval demo (chat answers, interaction checks).
// Mirrors the iOS app's showcase data (Models/SampleData.swift, MedicationSafetyEngine.swift). All in memory.

export type Status = "low" | "normal" | "high";
export type Lab = { metric: string; value: number; unit: string; low: number; high: number; status: Status };
export type Rec = { id: string; title: string; kind: "Lab" | "Visit" | "Rx"; provider: string; date: string; ts: number; summary: string; flagged: boolean; labs: Lab[] };
export type Med = { id: string; name: string; dose: string; form: string; time: string; hour: number; note: string; food: boolean; left: number; taken: boolean };

const lab = (metric: string, value: number, unit: string, low: number, high: number): Lab => ({
  metric, value, unit, low, high, status: value < low ? "low" : value > high ? "high" : "normal",
});
const panel = (a1c: number, iron: number, d: number): Lab[] => [lab("A1C", a1c, "%", 4, 5.6), lab("Iron", iron, "µg/dL", 60, 170), lab("Vitamin D", d, "ng/mL", 30, 100)];

export const RECORDS: Rec[] = [
  { id: "r1", title: "Blood panel", kind: "Lab", provider: "Dr. Patel", date: "Apr 18", ts: 6, summary: "A1C climbed again; iron is still low.", flagged: true, labs: panel(6.2, 52, 38) },
  { id: "r2", title: "Prescription summary", kind: "Rx", provider: "Central Pharmacy", date: "Apr 5", ts: 5, summary: "Active medications synced to your profile.", flagged: false, labs: [] },
  { id: "r3", title: "Annual physical", kind: "Visit", provider: "Dr. Patel", date: "Jan 19", ts: 4.5, summary: "BP 128/82. Recommend continued monitoring.", flagged: false, labs: [] },
  { id: "r4", title: "Blood panel", kind: "Lab", provider: "Dr. Patel", date: "Feb 12", ts: 4, summary: "A1C mildly elevated; iron improving slowly.", flagged: false, labs: panel(5.9, 46, 34) },
  { id: "r5", title: "Blood panel", kind: "Lab", provider: "Dr. Patel", date: "Dec 2", ts: 3, summary: "Vitamin D back in range; iron still trailing.", flagged: false, labs: panel(5.8, 44, 31) },
  { id: "r6", title: "Blood panel", kind: "Lab", provider: "Dr. Patel", date: "Sep 1", ts: 2, summary: "Iron and vitamin D both landed below range.", flagged: true, labs: panel(5.7, 41, 27) },
  { id: "r7", title: "Blood panel", kind: "Lab", provider: "Dr. Patel", date: "Jun 4", ts: 1, summary: "Borderline A1C with low vitamin D at baseline.", flagged: true, labs: panel(5.6, 63, 24) },
];

export const SCANS: Omit<Rec, "id" | "date" | "ts">[] = [
  { title: "Lipid panel", kind: "Lab", provider: "Dr. Patel", summary: "LDL is slightly high; the rest is in range.", flagged: true, labs: [lab("LDL", 138, "mg/dL", 0, 129), lab("HDL", 54, "mg/dL", 40, 90)] },
  { title: "Thyroid panel", kind: "Lab", provider: "Dr. Patel", summary: "TSH is in range.", flagged: false, labs: [lab("TSH", 2.1, "mIU/L", 0.4, 4.5)] },
];

export const MEDS: Med[] = [
  { id: "m1", name: "Lisinopril", dose: "10 mg tablet", form: "tablet", time: "7:00 AM", hour: 7, note: "For blood pressure", food: false, left: 24, taken: true },
  { id: "m2", name: "Iron supplement", dose: "65 mg tablet", form: "tablet", time: "8:00 AM", hour: 8, note: "Morning — away from calcium", food: false, left: 28, taken: true },
  { id: "m3", name: "Amoxicillin", dose: "500 mg capsule", form: "capsule", time: "1:00 PM", hour: 13, note: "Take with food", food: true, left: 14, taken: false },
  { id: "m4", name: "Metformin", dose: "500 mg tablet", form: "tablet", time: "6:00 PM", hour: 18, note: "Take with dinner", food: true, left: 30, taken: false },
];

/** Trend of one metric across lab records, oldest first. */
export const series = (metric: string, recs: Rec[]) =>
  recs
    .filter((r) => r.labs.some((l) => l.metric === metric))
    .sort((a, b) => a.ts - b.ts)
    .map((r) => ({ date: r.date, lab: r.labs.find((l) => l.metric === metric)! }));

export const latest = (metric: string, recs: Rec[]) => series(metric, recs).at(-1)?.lab;

// ---- Interaction check ----

export type Severity = "Review" | "Careful" | "High risk";
export type Issue = { severity: Severity; title: string; summary: string; tip: string };

const R: { a: RegExp; b: RegExp; i: Issue }[] = [
  { a: /ibuprofen|naproxen|advil|aleve|nsaid/i, b: /lisinopril|losartan|enalapril/i, i: { severity: "Careful", title: "Kidney and blood-pressure caution", summary: "NSAIDs can blunt the blood-pressure effect of ACE inhibitors or ARBs and add kidney stress if they become a repeated pattern.", tip: "Occasional use is usually fine. Ask your pharmacist before making it a habit." } },
  { a: /potassium/i, b: /lisinopril|losartan|enalapril/i, i: { severity: "High risk", title: "Potassium can run too high", summary: "This combination can raise potassium levels, especially if it is used without lab monitoring.", tip: "Check with your prescriber before taking them together." } },
  { a: /ibuprofen|naproxen|advil|aleve|nsaid/i, b: /warfarin/i, i: { severity: "High risk", title: "Bleeding risk goes up", summary: "NSAIDs and warfarin together can increase bleeding risk, including stomach bleeding.", tip: "Avoid unless your prescriber says otherwise." } },
  { a: /ibuprofen/i, b: /naproxen/i, i: { severity: "High risk", title: "Same drug class overlap", summary: "These medications sit in the same NSAID family, so stacking them can increase stomach, kidney, and bleeding risk.", tip: "Pick one, not both." } },
  { a: /iron/i, b: /levothyroxine/i, i: { severity: "Careful", title: "Absorption timing conflict", summary: "Iron can lower how much levothyroxine your body absorbs if they are taken too close together.", tip: "Keep them at least 4 hours apart." } },
  { a: /iron/i, b: /doxycycline|tetracycline|ciprofloxacin/i, i: { severity: "Careful", title: "Iron can block antibiotic absorption", summary: "Iron can bind certain antibiotics and make them absorb less well.", tip: "Space them by at least 2 hours." } },
  { a: /iron/i, b: /calcium|magnesium|zinc|multivitamin/i, i: { severity: "Careful", title: "Minerals can crowd out iron", summary: "Calcium, magnesium, zinc, and multivitamins can reduce iron absorption if they land too close together.", tip: "Take iron in the morning and calcium later in the day." } },
  { a: /metformin/i, b: /alcohol/i, i: { severity: "Review", title: "Alcohol and metformin", summary: "Heavy drinking with metformin raises the risk of lactic acidosis and can swing blood sugar.", tip: "Keep it light and eat first." } },
];

export const EXTRA_MEDS = ["Ibuprofen", "Naproxen", "Warfarin", "Potassium supplement", "Levothyroxine", "Doxycycline", "Calcium"];

export function checkPair(x: string, y: string): Issue | null {
  for (const r of R) if ((r.a.test(x) && r.b.test(y)) || (r.a.test(y) && r.b.test(x))) return r.i;
  return null;
}

// ---- Chat ----

export type Card = { kind: "range" | "trend"; metric: string } | { kind: "med"; id: string };
export type Msg = { id: number; me: boolean; text: string; cards?: Card[]; sos?: boolean; source?: string; done?: boolean };

export const STARTERS = ["What does my A1C mean?", "Any risky meds?", "Am I low on iron?"];
const SOS = /chest pain|can'?t breathe|trouble breathing|overdose|suicid|kill myself|stroke|seizure|passing out|bleeding a lot/i;

export function answer(q: string, recs: Rec[], meds: Med[]): Pick<Msg, "text" | "cards" | "sos" | "source"> {
  const sos = SOS.test(q);
  const base = (m: Pick<Msg, "text" | "cards" | "source">) => ({ ...m, sos });
  const a1c = latest("A1C", recs), iron = latest("Iron", recs);
  if (sos)
    return base({ text: `Here is the quick picture: ${meds.length} active meds, A1C ${a1c?.value}%, iron ${iron?.value} µg/dL, and BP 128/82.\n\nTell me what you want to focus on and I will break it down clearly.`, cards: [{ kind: "range", metric: "Iron" }], source: "Your labs · Apr 18" });
  if (/a1c|sugar|diabet|glucose/i.test(q)) {
    const s = series("A1C", recs), prev = s.at(-2)?.lab.value;
    return base({ text: `Your latest A1C is ${a1c?.value}%, up from ${prev}% in February.\n\nThat is still in the prediabetes range, but it is a level many people improve with steady food, movement, and medication habits.`, cards: [{ kind: "range", metric: "A1C" }, { kind: "trend", metric: "A1C" }], source: "Your labs · Apr 18" });
  }
  if (/iron|ferritin|anemi/i.test(q))
    return base({ text: `Yes, a little. Your iron is ${iron?.value} µg/dL, below the 60 to 170 range, though it has climbed from 41 since September.\n\nKeep taking it in the morning, away from calcium, and re-check at your next panel.`, cards: [{ kind: "range", metric: "Iron" }, { kind: "trend", metric: "Iron" }], source: "Your labs · Apr 18" });
  if (/vitamin d|vit d/i.test(q))
    return base({ text: "Your vitamin D is 38 ng/mL, comfortably in range and up from 24 last June.", cards: [{ kind: "range", metric: "Vitamin D" }], source: "Your labs · Apr 18" });
  if (/risk|interact|safe|together|mix/i.test(q))
    return base({ text: "I checked your four meds against each other and found no high-risk combinations.\n\nOne timing note: keep your iron at least 2 hours from any calcium or antacid, and take metformin and amoxicillin with food.", cards: meds.slice(0, 2).map((m) => ({ kind: "med" as const, id: m.id })), source: "Your meds · openFDA" });
  const m = meds.find((x) => q.toLowerCase().includes(x.name.toLowerCase().split(" ")[0]));
  if (m) return base({ text: `${m.name}: ${m.dose}, ${m.time}. ${m.note}. You have about ${m.left} left.`, cards: [{ kind: "med", id: m.id }], source: "Your meds" });
  if (/pressure|bp|blood pressure/i.test(q)) return base({ text: "Your last reading was 128/82 at your annual physical. It is a touch high, so Dr. Patel recommended continued monitoring. Lisinopril at 7:00 AM is doing its job.", source: "Your records · Jan 19" });
  return base({ text: "I can help with your meds, labs, and visit notes. Try asking about your A1C, your iron, or whether any of your meds clash.", source: "AI inference · verify with your doctor" });
}

// ---- Doctor draft ----

export function draft(note: string, recs: Rec[], meds: Med[]) {
  const a1c = latest("A1C", recs), iron = latest("Iron", recs);
  return {
    subject: "Question about my recent labs",
    body: `Hello Dr. Patel,\n\nI wanted to follow up on my most recent blood panel. My A1C was ${a1c?.value}% and my iron was ${iron?.value} µg/dL.\n\n${note.trim() || "I would like to know whether these results change anything about my current plan."}\n\nI am currently taking ${meds.map((m) => m.name).join(", ")}.\n\nThank you,\nDevin`,
  };
}
