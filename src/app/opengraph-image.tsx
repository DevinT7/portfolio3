import { card, OG_SIZE } from "@/lib/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return card({ title: site.name, sub: `${site.role} · ${site.base}` });
}
