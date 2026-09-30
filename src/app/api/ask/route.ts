import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt } from "@/lib/persona";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TURNS = 10;
const MAX_CHARS = 600;

// Best-effort per-IP limit. In-memory, so it resets per instance; it only has to blunt casual abuse.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 8;
}

type Msg = { role: "user" | "assistant"; content: string };

function parse(body: unknown): Msg[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const msgs = raw.slice(-MAX_TURNS).map((m) => ({
    role: m?.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: typeof m?.content === "string" ? m.content.slice(0, MAX_CHARS) : "",
  }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs.some((m) => !m.content.trim()) || msgs[msgs.length - 1].role !== "user") return null;
  return msgs;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return new Response("offline", { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return new Response("slow down", { status: 429 });

  const messages = parse(await req.json().catch(() => null));
  if (!messages) return new Response("bad request", { status: 400 });

  const client = new Anthropic();
  const stream = client.messages.stream(
    { model: MODEL, max_tokens: 400, system: systemPrompt(), messages },
    { signal: req.signal },
  );

  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const ev of stream) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              controller.enqueue(enc.encode(ev.delta.text));
            }
          }
        } catch {
          controller.enqueue(enc.encode("\n[connection lost]"));
        }
        controller.close();
      },
      cancel() {
        stream.abort();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
