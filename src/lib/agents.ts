export type Agent = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  instructions: string;
  welcome: string;
  starters: string[];
  updatedAt: number;
};

export type AgentDraft = Omit<Agent, "id" | "updatedAt">;

const KEY = "voklao.agents.v1";

export function loadAgents(): Agent[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Agent[]) : [];
    return Array.isArray(list) ? list.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

function persist(list: Agent[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked: the app still works for this visit.
  }
}

export function getAgent(id: string): Agent | undefined {
  return loadAgents().find((a) => a.id === id);
}

export function saveAgent(agent: Agent): void {
  const list = loadAgents().filter((a) => a.id !== agent.id);
  persist([{ ...agent, updatedAt: Date.now() }, ...list]);
}

export function createAgent(draft: AgentDraft): Agent {
  const agent: Agent = { ...draft, id: crypto.randomUUID().slice(0, 8), updatedAt: Date.now() };
  saveAgent(agent);
  return agent;
}

export function deleteAgent(id: string): void {
  persist(loadAgents().filter((a) => a.id !== id));
}

export const blankAgent: AgentDraft = {
  name: "Min AI",
  emoji: "🤖",
  description: "",
  instructions: "",
  welcome: "Hej! Hvad kan jeg hjælpe dig med?",
  starters: [],
};

// Share links carry the whole agent in the URL, so no database is needed.
export function shareUrl(agent: AgentDraft): string {
  const { name, emoji, description, instructions, welcome } = agent;
  const starters = agent.starters.filter((s) => s.trim());
  const bytes = new TextEncoder().encode(JSON.stringify({ name, emoji, description, instructions, welcome, starters }));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const data = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${location.origin}${location.pathname}#/s/${data}`;
}

export function decodeShared(data: string): AgentDraft | null {
  try {
    const bin = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed?.name !== "string" || typeof parsed?.instructions !== "string") return null;
    return {
      ...blankAgent,
      ...parsed,
      starters: Array.isArray(parsed.starters) ? parsed.starters.filter((s: unknown) => typeof s === "string").slice(0, 3) : [],
    };
  } catch {
    return null;
  }
}
