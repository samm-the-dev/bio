import {
  PortableText as SanityPortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from '@portabletext/react';

const components: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href = value?.href ?? '';
      const isExternal = href.startsWith('http');
      return (
        <a
          href={href}
          className="underline hover:text-foreground"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
  block: {
    normal: ({ children }) => <p className="mt-3 text-muted-foreground first:mt-0">{children}</p>,
  },
};

export function PortableText({ value }: { value: PortableTextBlock[] | undefined }) {
  if (!value) return null;
  return <SanityPortableText value={value} components={components} />;
}
