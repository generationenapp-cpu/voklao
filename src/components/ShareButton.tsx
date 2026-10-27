import { useState } from "react";
import { shareUrl, type AgentDraft } from "../lib/agents";

export default function ShareButton({ agent, className = "btn-primary" }: { agent: AgentDraft; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = shareUrl(agent);
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({ title: agent.name, text: agent.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopiér linket:", url);
    }
  }

  return (
    <button className={className} onClick={share}>
      {copied ? "✓ Link kopieret" : "Del"}
    </button>
  );
}
