import Anthropic from "@anthropic-ai/sdk";
import type { AnthropicBeta } from "@anthropic-ai/sdk/resources/beta/beta";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

// Server-side fallback re-runs a declined request on another model. Haiku has no fallback.
const supportsFallback = !MODEL.includes("haiku");
export const fallbackParams = supportsFallback
  ? { betas: ["server-side-fallback-2026-07-01"] as AnthropicBeta[], fallbacks: "default" as const }
  : {};

export const LIMITS = {
  instructions: 8000,
  message: 8000,
  messages: 40,
  description: 2000,
};

let client: Anthropic | null = null;
export function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new HttpError(500, "ANTHROPIC_API_KEY mangler på serveren.");
  }
  client ??= new Anthropic();
  return client;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function jsonError(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return Response.json({ error: "Der er travlt lige nu. Prøv igen om lidt." }, { status: 429 });
  }
  if (err instanceof Anthropic.APIError) {
    console.error("Claude API error", err.status, err.message);
    return Response.json({ error: "AI-tjenesten svarede med en fejl. Prøv igen." }, { status: 502 });
  }
  console.error(err);
  return Response.json({ error: "Uventet fejl på serveren." }, { status: 500 });
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (body && typeof body === "object") return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new HttpError(400, "Ugyldig forespørgsel.");
}

export function text(value: unknown, max: number, field: string): string {
  if (typeof value !== "string") throw new HttpError(400, `${field} mangler.`);
  if (value.length > max) throw new HttpError(400, `${field} er for lang (max ${max} tegn).`);
  return value;
}
