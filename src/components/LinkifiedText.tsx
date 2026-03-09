// Matches both https://... URLs and bare domain links like samm.bio/path
const URL_REGEX = /(https?:\/\/[^\s<)}\]]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<)}\]]*)?)/g;

// Non-global versions for testing individual parts (avoids lastIndex mutation)
const URL_TEST = /^(?:https?:\/\/[^\s<)}\]]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<)}\]]*)?)$/;
const BARE_DOMAIN_TEST = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/|$)/;

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = text.split(URL_REGEX);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (URL_TEST.test(part) && (part.startsWith('http') || BARE_DOMAIN_TEST.test(part))) {
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
