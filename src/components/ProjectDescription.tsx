import type { ReactNode } from 'react';

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderTextWithLinks(text: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = LINK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        {match[1]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function ProjectDescription({ text }: { text: string }) {
  const paragraphs = text.trim().split(/\n\n+/);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={`${i === 0 ? 'mt-1' : 'mt-3'} text-sm text-muted-foreground`}>
          {renderTextWithLinks(p)}
        </p>
      ))}
    </>
  );
}
