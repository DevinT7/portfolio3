import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { entry, entryIds } from "@/lib/entries";
import { OpenPanel } from "./OpenPanel";

export const dynamicParams = false;
export const generateStaticParams = () => entryIds().map((id) => ({ id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const e = entry((await params).id);
  if (!e) return {};
  const title = `${e.name} — Devin Thenuwara`;
  return { title, description: e.summary, openGraph: { title, description: e.summary, type: "article" } };
}

/**
 * Shareable link for a project (the panel itself is driven by the URL hash, which crawlers never see).
 * Link previews read this page's metadata and card; visitors are sent on to the panel.
 */
export default async function Project({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!entry(id)) notFound();
  return <OpenPanel id={id} />;
}
