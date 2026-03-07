import { PageHeader } from '@/components/PageHeader';
import { PortableText } from '@/components/PortableText';
import { useSanityQuery } from '@/hooks/useSanityQuery';
import { SITE_SETTINGS_QUERY, type SiteSettings } from '@/lib/queries';

export function AboutPage() {
  const { data: settings, loading, error } = useSanityQuery<SiteSettings>(SITE_SETTINGS_QUERY);

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (error || !settings)
    return <p className="text-sm text-destructive">Failed to load content.</p>;

  const sections = [
    { title: 'Improv', content: settings.aboutImprov },
    { title: 'Movies', content: settings.aboutMovies },
    { title: 'TTRPGs', content: settings.aboutTtrpgs },
    { title: 'Code', content: settings.aboutCode },
  ];

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
