import { card, OG_SIZE } from "@/lib/og";
import { entry } from "@/lib/entries";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = entry(id);
  return card({ title: e?.name ?? "Devin Thenuwara", sub: e?.what ?? "Software Engineer", stat: e?.stat });
}
