import { useState } from "react";
import Logo from "./Logo";
import { createAgent, loadAgents, blankAgent } from "../lib/agents";
import { templates } from "../lib/templates";
import { generateAgent } from "../lib/api";
import { go } from "../lib/router";

const ideas = ["En AI der svarer kunder i min frisørsalon", "En madplan-hjælper til travle børnefamilier", "En sparringspartner til mine forretningsidéer"];

export default function Home({ notice }: { notice?: string }) {
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(notice ?? "");
  const agents = loadAgents();

  async function build() {
    setBusy(true);
    setError("");
    try {
      const agent = createAgent(await generateAgent(idea));
      go(`/edit/${agent.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noget gik galt.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <button className="btn-ghost" onClick={() => go(`/edit/${createAgent(blankAgent).id}`)}>
          + Start fra bunden
        </button>
      </header>

      <section className="pt-10 pb-12 text-center sm:pt-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Byg din egen{" "}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">AI</span>
          <br className="hidden sm:block" /> på ét minut
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400 sm:text-lg">
          Beskriv hvad din AI skal kunne. Vi bygger den, du tester den, og du deler den med et link. Ingen kode.
        </p>

        <div className="card mx-auto mt-8 max-w-2xl p-3 text-left">
          <textarea
            className="field min-h-28 resize-none border-0 bg-transparent ring-0 focus:ring-0"
            placeholder="Fx: En AI der hjælper mine kunder med at vælge den rigtige cykel…"
            value={idea}
            maxLength={2000}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && idea.trim().length >= 5) build();
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {ideas.map((i) => (
                <button key={i} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400 hover:text-white" onClick={() => setIdea(i)}>
                  {i}
                </button>
              ))}
            </div>
            <button className="btn-primary w-full sm:w-auto" disabled={busy || idea.trim().length < 5} onClick={build}>
              {busy ? "Bygger din AI…" : "✨ Byg min AI"}
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      </section>

      {agents.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-3 text-lg font-bold">Mine AI'er</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-2xl">{a.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{a.name}</div>
                  <div className="truncate text-sm text-zinc-400">{a.description || "Ingen beskrivelse"}</div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <a className="text-sm font-semibold text-violet-300 hover:text-violet-200" href={`#/chat/${a.id}`}>Chat</a>
                  <a className="text-sm text-zinc-400 hover:text-white" href={`#/edit/${a.id}`}>Rediger</a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">Eller start med en skabelon</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <button
              key={t.name}
              className="card p-4 text-left transition hover:bg-white/[0.07]"
              onClick={() => go(`/edit/${createAgent(t).id}`)}
            >
              <div className="text-3xl">{t.emoji}</div>
              <div className="mt-2 font-semibold">{t.name}</div>
              <div className="mt-1 text-sm text-zinc-400">{t.description}</div>
            </button>
          ))}
        </div>
      </section>

      <footer className="mt-16 text-center text-xs text-zinc-500">
        Dine AI'er gemmes i din browser. Samtaler sendes til Claude (Anthropic) for at blive besvaret.
      </footer>
    </div>
  );
}
