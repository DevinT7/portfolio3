/** City for the presence label. Only set behind Vercel (or another edge that adds the header); absent locally. */
export async function GET(req: Request) {
  const raw = req.headers.get("x-vercel-ip-city");
  let city: string | null = null;
  try {
    city = raw ? decodeURIComponent(raw) : null;
  } catch {}
  return Response.json({ city }, { headers: { "Cache-Control": "private, no-store" } });
}
