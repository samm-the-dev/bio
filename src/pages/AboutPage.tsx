import { PageHeader } from '@/components/PageHeader';
import { PortableText } from '@/components/PortableText';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { settings } from '@/data/settings';

const sections = [
  { title: 'Improv', content: settings.aboutImprov },
  { title: 'Movies', content: settings.aboutMovies },
  { title: 'TTRPGs', content: settings.aboutTtrpgs },
  { title: 'Code', content: settings.aboutCode },
];

export function AboutPage() {
  useDocumentTitle('About Me');

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="About Me" />

      <div className="space-y-10">
        {sections.map(({ title, content }) => (
          <section key={title}>
            <h2 className="mb-3 text-xl font-semibold">{title}</h2>
            <PortableText value={content} />
          </section>
        ))}
      </div>
    </div>
  );
}
