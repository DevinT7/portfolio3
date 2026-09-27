import fs from "node:fs";
import path from "node:path";

const VIDEO = [".mp4", ".webm"];
const IMAGE = [".webp", ".avif", ".jpg", ".jpeg", ".png"];

export type Found = { url: string; video: boolean } | null;

/** Looks for /public/<base>.<ext> at build time. */
export function findMedia(base?: string): Found {
  if (!base) return null;
  for (const ext of [...VIDEO, ...IMAGE]) {
    if (fs.existsSync(path.join(process.cwd(), "public", base + ext))) {
      return { url: `/${base}${ext}`, video: VIDEO.includes(ext) };
    }
  }
  return null;
}
