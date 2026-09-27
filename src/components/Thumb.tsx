import type { Found } from "@/lib/media";

export const BLOCKS = ["var(--accent)", "var(--fg)", "#d8d5cb"];

/** A project's image/video, or a solid color block with its name until one is added. */
export function Thumb({
  found,
  name,
  i,
  size = "text-3xl",
  lazy,
  position,
  alt = "",
}: {
  found: Found;
  name: string;
  i: number;
  size?: string;
  lazy?: boolean;
  /** object-position, for framing photos. */
  position?: string;
  alt?: string;
}) {
  if (found?.video) {
    return <video src={found.url} muted loop autoPlay playsInline className="h-full w-full object-cover" style={{ objectPosition: position }} />;
  }
  if (found) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={found.url} alt={alt} loading={lazy ? "lazy" : undefined} className="h-full w-full object-cover" style={{ objectPosition: position }} />;
  }
  const dark = i % BLOCKS.length === 1;
  return (
    <div className="grid h-full w-full place-items-center" style={{ background: BLOCKS[i % BLOCKS.length] }}>
      <span className={`display ${size} ${dark ? "text-bg" : "text-fg"}`}>{name}</span>
    </div>
  );
}
