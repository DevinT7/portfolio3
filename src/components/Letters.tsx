/** Splits text into per-letter spans so the intro can raise them one by one. */
export function Letters({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {[...text].map((c, i) => (
        <span key={i} className="ch" style={{ "--c": start + i } as React.CSSProperties}>
          {c}
        </span>
      ))}
    </>
  );
}
