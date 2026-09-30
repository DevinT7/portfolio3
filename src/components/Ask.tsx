"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = ["What did you build at IBM?", "Tell me about Forge", "Are you available?"];

/**
 * Chat grounded in site.ts (see lib/persona.ts), answered in first person by /api/ask.
 * Not modal: the page stays usable behind it.
 */
export function Ask() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("ask:open", show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ask:open", show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) input.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [msgs]);

  const send = async (q: string) => {
    q = q.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setText("");
    setBusy(true);

    const fill = (content: string) =>
      setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content }]);

    abort.current = new AbortController();
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        fill(res.status === 429 ? "Give me a minute, then ask again." : "I'm offline right now. Email works.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        fill(acc);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") fill("I'm offline right now. Email works.");
    } finally {
      setBusy(false);
      input.current?.focus({ preventScroll: true });
    }
  };

  return (
    <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Ask me anything"
      aria-hidden={open}
      tabIndex={open ? -1 : 0}
      className={`group fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-fg text-bg shadow-lg transition-[opacity,scale,background-color] duration-300 ease-[var(--ease-out)] hover:bg-accent hover:scale-105 sm:right-6 sm:bottom-6 ${open ? "pointer-events-none scale-90 opacity-0" : ""}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" />
      </svg>
      <span className="label pointer-events-none absolute right-full mr-3 rounded-full bg-fg px-3 py-1.5 whitespace-nowrap !text-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        Ask me
      </span>
    </button>
    <div
      role="dialog"
      aria-label="Ask Devin"
      aria-hidden={!open}
      inert={!open}
      className={`fixed right-0 bottom-0 z-40 flex h-[min(34rem,80dvh)] w-full flex-col border border-line bg-bg shadow-2xl transition-[translate,opacity] duration-500 ease-[var(--ease-out)] sm:right-6 sm:bottom-6 sm:w-[24rem] sm:rounded-[20px] ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
        <span className="label">Ask me</span>
        <button type="button" onClick={() => setOpen(false)} className="label -mr-3 h-11 px-3 text-fg hover:text-accent">
          Close
        </button>
      </div>

      <div ref={log} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {msgs.length === 0 && (
          <div className="flex flex-col items-start gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-line px-3 py-1.5 text-left text-sm transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <p
            key={i}
            className={m.role === "user" ? "ml-10 rounded-2xl bg-fg px-3.5 py-2 text-sm text-bg" : "mr-6 text-[0.95rem] leading-relaxed whitespace-pre-wrap"}
          >
            {m.content || <span className="label">…</span>}
          </p>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="flex shrink-0 items-center gap-2 border-t border-line px-4"
      >
        <input
          ref={input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={600}
          placeholder="Ask anything"
          aria-label="Your question"
          className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button type="submit" disabled={busy || !text.trim()} className="label h-11 px-2 text-fg hover:text-accent disabled:opacity-30">
          Send
        </button>
      </form>
    </div>
    </>
  );
}
