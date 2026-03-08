export function RichText({ html }: { html: string | undefined }) {
  if (!html) return null;
  return <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />;
}
