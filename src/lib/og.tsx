import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Share card: paper background, big name, small mono-style meta row. Used by the home page and each /p/[id]. */
export function card({ title, sub, stat }: { title: string; sub: string; stat?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f3ef",
          color: "#111111",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "#6a6a64", letterSpacing: 2, textTransform: "uppercase" }}>
          <div style={{ width: 18, height: 18, background: "#1d4ed8" }} />
          Devin Thenuwara
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: title.length > 14 ? 128 : 168, fontWeight: 700, letterSpacing: -6, lineHeight: 0.95 }}>{title}</div>
          <div style={{ fontSize: 40, color: "#6a6a64" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid rgba(17,17,17,0.15)", paddingTop: 28, fontSize: 32 }}>
          <span style={{ color: "#6a6a64" }}>{stat ? "" : "UT Austin ’28"}</span>
          <span style={{ fontWeight: 700 }}>{stat ?? "Software Engineer"}</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
