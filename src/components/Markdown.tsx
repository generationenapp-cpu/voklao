import type { ReactNode } from "react";

// Small, safe formatter for chat replies: paragraphs, bullet lists, **bold**, _italic_ and `code`.
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_\s][^_]*_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="rounded bg-black/40 px-1 py-0.5 text-[13px]">{part.slice(1, -1)}</code>;
    if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) return <em key={i} className="text-zinc-400">{part.slice(1, -1)}</em>;
    return part;
  });
}

export default function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
          const ordered = /^\s*\d+\./.test(lines[0]);
          const items = lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>);
          return ordered ? <ol key={i} className="list-decimal space-y-1 pl-5">{items}</ol> : <ul key={i} className="list-disc space-y-1 pl-5">{items}</ul>;
        }
        const heading = block.match(/^#{1,4}\s+(.*)$/);
        if (heading && lines.length === 1) return <p key={i} className="font-semibold text-white">{inline(heading[1])}</p>;
        return (
          <p key={i} className="whitespace-pre-wrap">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}
