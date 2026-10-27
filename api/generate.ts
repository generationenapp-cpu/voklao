import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { HttpError, LIMITS, MODEL, fallbackParams, getClient, jsonError, readJson, text } from "../server/claude.ts";

const AgentSchema = z.object({
  name: z.string().describe("Kort, fængende navn, 1-3 ord"),
  emoji: z.string().describe("Én enkelt emoji der passer til AI'en"),
  description: z.string().describe("Én sætning der forklarer hvad AI'en gør"),
  instructions: z.string().describe("Grundige instruktioner til AI'en i du-form: rolle, mål, tone, hvad den skal og ikke skal, og hvordan den stiller opfølgende spørgsmål"),
  welcome: z.string().describe("Kort velkomstbesked AI'en starter samtalen med"),
  starters: z.array(z.string()).describe("Præcis 3 korte eksempler på hvad en bruger kunne skrive"),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await readJson(request);
    const idea = text(body.idea, LIMITS.description, "Beskrivelse").trim();
    if (idea.length < 5) throw new HttpError(400, "Skriv lidt mere om din AI.");

    const response = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(AgentSchema) },
      ...fallbackParams,
      system:
        "Du designer AI-assistenter for brugere uden teknisk baggrund. Ud fra brugerens idé laver du en komplet, gennemtænkt opsætning. Skriv på samme sprog som idéen (typisk dansk).",
      messages: [{ role: "user", content: `Min idé til en AI:\n${idea}` }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      throw new HttpError(422, "Kunne ikke bygge den AI. Prøv at beskrive den anderledes.");
    }
    const agent = response.parsed_output;
    return Response.json({ ...agent, starters: agent.starters.slice(0, 3) });
  } catch (err) {
    return jsonError(err);
  }
}
