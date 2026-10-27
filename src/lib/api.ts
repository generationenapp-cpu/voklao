import type { AgentDraft } from "./agents";

export type ChatMessage = { role: "user" | "assistant"; content: string };

async function errorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // ignore
  }
  return `Noget gik galt (${res.status}).`;
}

export async function generateAgent(idea: string): Promise<AgentDraft> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function streamChat(
  agent: Pick<AgentDraft, "name" | "instructions">,
  messages: ChatMessage[],
  onText: (chunk: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: agent.name, instructions: agent.instructions, messages }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(await errorMessage(res));
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onText(decoder.decode(value, { stream: true }));
  }
}
