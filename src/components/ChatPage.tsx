import { useEffect } from "react";
import ChatPanel from "./ChatPanel";
import ShareButton from "./ShareButton";
import { createAgent, type AgentDraft } from "../lib/agents";
import { go } from "../lib/router";

export default function ChatPage({ agent, ownerId, shared = false }: { agent: AgentDraft; ownerId?: string; shared?: boolean }) {
  useEffect(() => {
    document.title = `${agent.name} – Voklao`;
    return () => {
      document.title = "Voklao – byg din egen AI";
    };
  }, [agent.name]);

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <a href="#/" className="text-zinc-400 hover:text-white" aria-label="Til forsiden">←</a>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-xl">{agent.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{agent.name}</div>
          {agent.description && <div className="truncate text-xs text-zinc-400">{agent.description}</div>}
        </div>
        {ownerId && <a className="btn-ghost" href={`#/edit/${ownerId}`}>Rediger</a>}
        {ownerId && <ShareButton agent={agent} />}
        {shared && (
          <button className="btn-ghost" onClick={() => go(`/edit/${createAgent({ ...agent, name: `${agent.name} (kopi)` }).id}`)}>
            Lav din egen
          </button>
        )}
      </header>
      <div className="min-h-0 flex-1">
        <ChatPanel agent={agent} />
      </div>
      {shared && (
        <a href="#/" className="py-2 text-center text-xs text-zinc-500 hover:text-zinc-300">
          Lavet med Voklao · Byg din egen AI gratis
        </a>
      )}
    </div>
  );
}
