// All copy on the site. Keep it short and specific.
//
// Images: drop a file at /public/<path>.(jpg|png|webp|mp4|webm) and it's used automatically.
//   me              hero photo (also used in About unless me-about exists)
//   me-about        photo in the About panel
//   work/<id>       preview + panel image for any entry below

export type Entry = {
  id: string;
  year: string;
  name: string;
  what: string;
  stat: string;
  role: string;
  when: string;
  summary: string;
  did: string[];
  stack?: string[];
  links?: { label: string; href: string }[];
};

export const site = {
  name: "Devin Thenuwara",
  role: "Software Engineer",
  school: "UT Austin ’28",
  status: "Available Summer 2027",
  github: "DevinT7",
  base: "Austin, TX",
  now: "Texas Convergent",
  before: "IBM",
  email: "devinethenuwara@gmail.com",
  resume: "/resume.pdf",
  links: [
    { label: "GitHub", href: "https://github.com/DevinT7" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/devint7" },
  ],

  about: {
    line: "Informatics at UT Austin. Based in Austin, TX.",
    // Photos on /about. `place` must match a pin name in `places` so the map can link to it. Drop a file in /public/about and add a line here; the grid re-flows.
    photos: [
      { src: "/about/colombo.webp", alt: "Colombo skyline at dusk", caption: "Sri Lanka", place: "Sri Lanka", w: 1141, h: 856 },
      { src: "/about/dog.webp", alt: "My golden retriever resting on a porch", caption: "Home", place: "Austin, TX", w: 642, h: 856 },
      { src: "/about/sunset.webp", alt: "Sunset over the ocean with palm trees", caption: "Sri Lanka", place: "Sri Lanka", w: 642, h: 856 },
      { src: "/about/colorado.webp", alt: "Sun setting behind a ski lift and mountains", caption: "Colorado", place: "Denver, CO", w: 1141, h: 856 },
      { src: "/about/switzerland.webp", alt: "Snowy mountain above a Swiss village street", caption: "Switzerland", place: "Zürich, Switzerland", w: 642, h: 856 },
      { src: "/about/switzerland-lake.webp", alt: "Snowy Alps reflected in a lake at dusk", caption: "Switzerland", place: "Zürich, Switzerland", w: 1141, h: 856 },
      { src: "/about/florida.webp", alt: "Jurassic Park entrance at a theme park", caption: "Florida", place: "Orlando, FL", w: 1521, h: 856 },
      { src: "/about/alaska.webp", alt: "Snowy mountains and a glacier reflected in the water", caption: "Alaska", place: "Alaska", w: 1141, h: 856 },
      { src: "/about/honduras.webp", alt: "Green hills and a ferry dock on the water", caption: "Honduras", place: "Roatán, Honduras", w: 1141, h: 856 },
      { src: "/about/newyork.webp", alt: "New York skyline with the Empire State Building", caption: "New York", place: "New York, NY", w: 1141, h: 856 },
      { src: "/about/durango.webp", alt: "Green valley and mountains near Durango", caption: "Durango", place: "Durango, CO", w: 1141, h: 856 },
      { src: "/about/cota.webp", alt: "Turn 1 hill and grandstands at Circuit of the Americas", caption: "COTA", place: "Austin, TX", w: 1141, h: 856 },
      { src: "/about/lake-travis.webp", alt: "Sunset over Lake Travis with hills on the far shore", caption: "Lake Travis", place: "Austin, TX", w: 2000, h: 1500 },
    ],
    interests: ["F1", "Baking", "Basketball", "Traveling", "Skiing", "Swimming"],
    // Pins on the travel map. The first one is home.
    places: [
      { name: "Austin, TX", lat: 30.27, lon: -97.74 },
      { name: "San Francisco, CA", lat: 37.77, lon: -122.42 },
      { name: "New York, NY", lat: 40.71, lon: -74.01 },
      { name: "Denver, CO", lat: 39.74, lon: -104.99 },
      { name: "Durango, CO", lat: 37.28, lon: -107.88 },
      { name: "Seattle, WA", lat: 47.61, lon: -122.33 },
      { name: "Baltimore, MD", lat: 39.29, lon: -76.61 },
      { name: "Chicago, IL", lat: 41.88, lon: -87.63 },
      { name: "Miami, FL", lat: 25.76, lon: -80.19 },
      { name: "Orlando, FL", lat: 28.54, lon: -81.38 },
      { name: "Santa Fe, NM", lat: 35.69, lon: -105.94 },
      { name: "Alaska", lat: 61.22, lon: -149.9 },
      { name: "Vancouver, Canada", lat: 49.28, lon: -123.12 },
      { name: "Cancún, Mexico", lat: 21.16, lon: -86.85 },
      { name: "Cozumel, Mexico", lat: 20.42, lon: -86.92 },
      { name: "Roatán, Honduras", lat: 16.33, lon: -86.53 },
      { name: "United Kingdom", lat: 51.51, lon: -0.13 },
      { name: "France", lat: 48.86, lon: 2.35 },
      { name: "Zürich, Switzerland", lat: 47.38, lon: 8.54 },
      { name: "Sri Lanka", lat: 7.87, lon: 80.77 },
    ],
  },

  work: [
    {
      id: "ibm",
      year: "2026",
      name: "IBM",
      what: "watsonx voice runtime",
      stat: "2.23s latency",
      role: "Software Developer Intern",
      when: "Mar — Aug 2026",
      summary:
        "watsonx Orchestrate lets companies build AI agents that can take phone calls. I worked on its voice runtime: the part that turns a caller’s speech into text for the agent, and the agent’s reply back into speech.",
      did: [
        "Integrated Google Speech-to-Text and Text-to-Speech into the runtime. 2.23s median end-to-end response time, 0.0% error rate across 80+ traced calls.",
        "Built a direct gRPC streaming pipeline with Pipecat that skips the AI Gateway. It gets around API streaming connection limits and handles multiple languages automatically.",
        "Wrote CRUD APIs to move voice configuration out of local YAML files and into PostgreSQL.",
        "Extended auth to support service-account credentials across 5 speech providers.",
      ],
      stack: ["Python", "Pipecat", "gRPC", "Google Cloud STT/TTS", "PostgreSQL"],
    },
    {
      id: "convergent",
      year: "2026",
      name: "Convergent",
      what: "Member platform",
      stat: "300+ members",
      role: "Software Engineer",
      when: "Jun 2026 — Now",
      summary:
        "Texas Convergent has 300+ members and was tracking them in spreadsheets. I built the portal it now runs on: membership, roles, and event check-in.",
      did: [
        "Role-based access enforced in Postgres with row-level security, so permissions hold even if the UI is bypassed.",
        "Check-in QR codes rotate and are signed with HMAC-SHA256. A live camera scanner verifies them at the door.",
        "Tracked down a validation bug that was rejecting real codes and widened the redemption window from 2.5s to 10s.",
        "Wrote an idempotent Node.js ETL job that migrated 3 semesters of member records with natural-key upserts. It can be re-run without creating duplicates.",
      ],
      stack: ["Next.js", "React 19", "TypeScript", "PostgreSQL", "Node.js"],
      links: [{ label: "Website", href: "https://convergent-website.vercel.app" }],
    },
    {
      id: "ctm",
      year: "2025",
      name: "City of Austin",
      what: "Safety routing",
      stat: "Best App",
      role: "Software Engineer Intern",
      when: "Jun — Jul 2025",
      summary:
        "A public safety app that helps Austin residents avoid high-crime areas. Built with a multidisciplinary team in a 6-week sprint.",
      did: [
        "Processed 500+ live crime reports a day to calculate risk-averse navigation paths.",
        "Built a real-time sync layer on Firebase so users get safety alerts instantly while navigating.",
        "Wrote custom routing with GraphHopper and the Google Maps APIs, simulating 200+ safe routes weighted against historical crime density.",
        "Pitched the MVP to Capital Factory investors and won Overall Best App out of 8 teams.",
      ],
      stack: ["React", "TypeScript", "Firebase", "GraphHopper", "Google Maps"],
    },
    {
      id: "refind",
      year: "2026",
      name: "REFIND",
      what: "Event analytics",
      stat: "80 events",
      role: "Software Engineer, Forge",
      when: "Jan 2026 — Now",
      summary:
        "A B2B event platform for consumer brands. Brands can see which events actually paid off and how attendees felt about them.",
      did: [
        "Built the core product with a team, on Next.js and Supabase.",
        "Designed a multi-tenant backend with row-level security and Node.js. 10 brand workspaces, fully isolated from each other.",
        "Aggregated sentiment and conversion funnels from live attendee streams, turning 300+ interactions into per-campaign metrics.",
        "Built the dashboards: conversion rates and engagement heatmaps across 80 events and 250+ attendees.",
      ],
      stack: ["Next.js", "Supabase", "Node.js", "Tailwind CSS"],
    },
    {
      id: "forge",
      year: "2026",
      name: "Forge",
      what: "Multimodal retrieval",
      stat: "Tech lead",
      role: "Software Tech Lead, Texas Convergent",
      when: "Jul 2026 — Now",
      summary: "Event-to-image retrieval for Pax Historia, a YC-backed AI game studio: given an event in the game, find the right image for it.",
      did: [
        "Leading a team of 13 engineers.",
        "Benchmarking lexical, embedding, and hybrid multimodal retrieval against each other.",
      ],
      stack: ["Python", "Embeddings"],
    },
    {
      id: "studymon",
      year: "2026",
      name: "StudyMon",
      what: "Study tracker",
      stat: "AI + maps",
      role: "Full Stack Developer",
      when: "Mar 2026",
      summary: "A study tracker for UT students. Studying at real campus spots earns you Pokémon-style creatures.",
      did: [
        "AI study assistant on the Anthropic and OpenAI APIs that recommends spots through tool-calling.",
        "Supabase with row-level security, plus server actions for session logic.",
        "Campus map built with React Leaflet.",
      ],
      stack: ["Next.js", "Tailwind CSS", "Supabase", "React Leaflet"],
    },
  ] satisfies Entry[],

  leadership: [
    {
      id: "baxa",
      year: "2026",
      name: "Texas BAXA",
      what: "Corporate Director",
      stat: "Exec Board",
      role: "Corporate Director",
      when: "Apr 2026 — Now",
      summary:
        "My job is emailing hundreds of companies for sponsorships. The old process was one Excel sheet updated by hand and every email copied into Gmail one at a time, hours of work per batch.",
      did: [
        "Contacts come in as a CSV and live in Supabase. The import generates emails and skips duplicate companies.",
        "Bulk send pulls the company name from each email into the template and puts the drafts straight into Gmail.",
        "LinkedIn extractor: on a recruiter’s profile, it combines Hunter.io with an extraction algorithm to guess their email, no paid service like ContactOut needed.",
        "Built-in email verifier, and Quick Send for pasting any emails you’ve gathered and sending right away.",
        "One-click follow-ups for companies that haven’t replied.",
        "Brought in $1,000+ from 4 companies so far and ran recruiting events and case competitions for 150+ members.",
      ],
      stack: ["Supabase", "Hunter.io", "Gmail"],
      links: [{ label: "Code", href: "https://github.com/DevinT7/baxa-outreach" }],
    },
    {
      id: "convergent-exec",
      year: "2026",
      name: "Texas Convergent",
      what: "Memberships Chair",
      stat: "Board",
      role: "Memberships Chair",
      when: "May 2026 — Now",
      summary: "On the exec board of a 300+ member org. I run recruitment.",
      did: [
        "Set recruitment strategy with the program directors.",
        "Run the application, review, and team-selection process each semester.",
      ],
    },
    {
      id: "slsa",
      year: "2024",
      name: "SLSA",
      what: "Sri Lankan Student Association",
      stat: "Co-founder",
      role: "Co-founder",
      when: "2024 — Now",
      summary: "Co-founded UT’s Sri Lankan Student Association.",
      did: ["Grew it to 30+ active members in its first semester.", "Coordinator and outreach."],
    },
  ] satisfies Entry[],
};
