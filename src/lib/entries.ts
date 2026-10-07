import { site } from "@/content/site";

const all = [...site.work, ...site.projects, ...site.leadership];

export const entryIds = () => all.map((e) => e.id);
export const entry = (id: string) => all.find((e) => e.id === id);
