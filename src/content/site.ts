// All copy on the site. Keep it short.
//
// Hover previews: drop a file at /public/<media>.(mp4|webm|webp|jpg|png) and it's used
// automatically. Until then the preview is a solid color block.

export type Work = {
  year: string;
  name: string;
  what: string;
  stat: string;
  media?: string;
  href?: string;
};

export const site = {
  name: "Devin Thenuwara",
  role: "Software Engineer",
  school: "UT Austin ’28",
  status: "Available Summer 2027",
  email: "devinethenuwara@gmail.com",
  resume: "/resume.pdf",
  links: [
    { label: "GitHub", href: "https://github.com/DevinT7" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/devint7" },
  ],

  work: [
    { year: "2026", name: "IBM", what: "watsonx voice runtime", stat: "2.23s latency", media: "work/ibm" },
    { year: "2026", name: "Convergent", what: "Member platform", stat: "300+ members", media: "work/convergent" },
    { year: "2025", name: "City of Austin", what: "Safety routing", stat: "Best App", media: "work/ctm" },
    { year: "2026", name: "REFIND", what: "Event analytics", stat: "80 events", media: "work/refind" },
    { year: "2026", name: "Forge", what: "Multimodal retrieval", stat: "Tech lead", media: "work/forge" },
    { year: "2026", name: "StudyMon", what: "Study tracker", stat: "AI + maps", media: "work/studymon" },
  ] satisfies Work[],
};
