import { useEffect, useState } from "react";
import Logo from "./Logo";
import ChatPanel from "./ChatPanel";
import ShareButton from "./ShareButton";
import { deleteAgent, saveAgent, type Agent } from "../lib/agents";
import { go } from "../lib/router";

export default function Builder({ initial }: { initial: Agent }) {
  const [agent, setAgent] = useState(initial);
  const [tab, setTab] = useState<"setup" | "test">("setup");
  const [testKey, setTestKey] = useState(0);

  // Autosave shortly after each change.
  useEffect(() => {
    const t = setTimeout(() => saveAgent(agent), 300);
    return () => clearTimeout(t);
  }, [agent]);

  const set = <K extends keyof Agent>(key: K, value: Agent[K]) => setAgent((a) => ({ ...a, [key]: value }));

  function remove() {
    if (confirm(`Slet "${agent.name}"?`)) {
      deleteAgent(agent.id);
      go("/");
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <Logo />
        <div className="flex gap-2">
          <a className="btn-ghost" href={`#/chat/${agent.id}`}>Åbn chat</a>
          <ShareButton agent={agent} />
        </div>
      </header>

      <div className="flex border-b border-white/10 lg:hidden">
        {(["setup", "test"] as const).map((t) => (
          <button
            key={t}
            className={`flex-1 py-2.5 text-sm font-semibold ${tab === t ? "border-b-2 border-violet-400 text-white" : "text-zinc-400"}`}
            onClick={() => setTab(t)}
          >
            {t === "setup" ? "Opsætning" : "Test din AI"}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <section className={`${tab === "setup" ? "block" : "hidden"} w-full overflow-y-auto lg:block lg:w-1/2 lg:border-r lg:border-white/10`}>
          <div className="mx-auto max-w-xl space-y-5 px-4 py-6">
            <div className="flex gap-3">
              <div className="w-20">
                <label className="label">Ikon</label>
                <input className="field text-center text-2xl" value={agent.emoji} maxLength={4} onChange={(e) => set("emoji", e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="label">Navn</label>
                <input className="field" value={agent.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Kort beskrivelse</label>
              <input className="field" value={agent.description} maxLength={200} placeholder="Hvad gør din AI?" onChange={(e) => set("description", e.target.value)} />
            </div>

            <div>
              <label className="label">Instruktioner (AI'ens hjerne)</label>
              <textarea
                className="field min-h-56"
                value={agent.instructions}
                maxLength={8000}
                placeholder="Fortæl AI'en hvem den er, hvad den skal hjælpe med, hvilken tone den skal bruge, og hvad den ikke må."
                onChange={(e) => set("instructions", e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-zinc-500">{agent.instructions.length}/8000</p>
            </div>

            <div>
              <label className="label">Velkomstbesked</label>
              <input className="field" value={agent.welcome} maxLength={300} onChange={(e) => set("welcome", e.target.value)} />
            </div>

            <div>
              <label className="label">Forslag til første besked</label>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    className="field"
                    value={agent.starters[i] ?? ""}
                    maxLength={100}
                    placeholder={`Forslag ${i + 1}`}
                    onChange={(e) => {
                      const starters = [...agent.starters];
                      starters[i] = e.target.value;
                      set("starters", Array.from({ length: 3 }, (_, j) => starters[j] ?? ""));
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button className="btn-primary lg:hidden" onClick={() => { setTab("test"); setTestKey((k) => k + 1); }}>
                Test din AI →
              </button>
              <button className="btn-ghost text-rose-300" onClick={remove}>Slet</button>
            </div>
            <p className="text-xs text-zinc-500">Ændringer gemmes automatisk.</p>
          </div>
        </section>

        <section className={`${tab === "test" ? "flex" : "hidden"} min-h-0 w-full flex-col lg:flex lg:w-1/2`}>
          <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-500">
            <span>Forhåndsvisning</span>
            <button className="hover:text-white" onClick={() => setTestKey((k) => k + 1)}>Genstart</button>
          </div>
          <div className="min-h-0 flex-1">
            <ChatPanel key={testKey} agent={agent} compact />
          </div>
        </section>
      </div>
    </div>
  );
}
