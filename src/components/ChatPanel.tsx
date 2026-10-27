import { useEffect, useRef, useState } from "react";
import type { AgentDraft } from "../lib/agents";
import { streamChat, type ChatMessage } from "../lib/api";
import Markdown from "./Markdown";

export default function ChatPanel({ agent, compact = false }: { agent: AgentDraft; compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat(agent, history, (chunk) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        }),
        controller.signal,
      );
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Noget gik galt.");
        setMessages(history.slice(0, -1));
        setInput(content);
      }
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setError("");
  }

  const empty = messages.length === 0;
  const starters = agent.starters.filter((s) => s.trim());

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <div className="flex gap-3">
          <Avatar emoji={agent.emoji} />
          <Bubble>{agent.welcome || `Hej, jeg er ${agent.name}.`}</Bubble>
        </div>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-[15px]">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <Avatar emoji={agent.emoji} />
              <Bubble>{m.content ? <Markdown text={m.content} /> : <Typing />}</Bubble>
            </div>
          ),
        )}

        {empty && starters.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${compact ? "" : "pl-12"}`}>
            {starters.map((s) => (
              <button key={s} className="rounded-full bg-white/5 px-3.5 py-1.5 text-sm text-zinc-300 ring-1 ring-white/10 hover:bg-white/10" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {error && <p className="text-center text-sm text-rose-400">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-end gap-2">
          {!empty && (
            <button type="button" title="Ny samtale" className="btn-ghost h-11 w-11 shrink-0 px-0" onClick={reset}>
              ↺
            </button>
          )}
          <textarea
            rows={1}
            className="field max-h-40 min-h-11 resize-none"
            placeholder={`Skriv til ${agent.name}…`}
            value={input}
            maxLength={8000}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <button className="btn-primary h-11 w-11 shrink-0 px-0" disabled={busy || !input.trim()} aria-label="Send">
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}

function Avatar({ emoji }: { emoji: string }) {
  return <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-lg">{emoji}</div>;
}

function Bubble({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-2.5 text-[15px] leading-relaxed ring-1 ring-white/10">{children}</div>;
}

function Typing() {
  return (
    <span className="inline-flex gap-1 py-1.5">
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}
