// Matches both https://... URLs and bare domain links like samm.bio/path
const URL_REGEX = /(https?:\/\/[^\s<)}\]]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<)}\]]*)?)/g;

// Bare domains must have a known TLD-like suffix to avoid false positives on things like "w/timestamp"
const BARE_DOMAIN_REGEX = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/|$)/;

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = text.split(URL_REGEX);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        URL_REGEX.lastIndex = 0;
        if (URL_REGEX.test(part) && (part.startsWith('http') || BARE_DOMAIN_REGEX.test(part))) {
          const href = part.startsWith('http') ? part : `https://${part}`;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
