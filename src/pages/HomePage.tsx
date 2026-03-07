import { Code, User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { SocialLinks } from '@/components/SocialLinks';
import { PortableText } from '@/components/PortableText';
import { useSanityQuery } from '@/hooks/useSanityQuery';
import { SITE_SETTINGS_QUERY, type SiteSettings } from '@/lib/queries';

export function HomePage() {
  const { data: settings, loading, error } = useSanityQuery<SiteSettings>(SITE_SETTINGS_QUERY);

  if (loading) return <p className="text-center text-sm text-muted-foreground">Loading...</p>;
  if (error || !settings)
    return <p className="text-center text-sm text-destructive">Failed to load content.</p>;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <PageHeader title={settings.name} descriptor={settings.descriptor} />

      <blockquote className="mb-8 text-sm italic text-muted-foreground">
        {settings.tagline}
        {settings.taglineAttribution && (
          <footer className="mt-1 text-xs text-muted-foreground/70">
            &mdash;{' '}
            {settings.taglineUrl ? (
              <a
                href={settings.taglineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {settings.taglineAttribution}
              </a>
            ) : (
              settings.taglineAttribution
            )}
          </footer>
        )}
      </blockquote>

      <h2 className="mb-4 text-xl font-semibold">Welcome!</h2>
      <div className="mb-8 space-y-3">
        <PortableText value={settings.intro} />
      </div>

      <SocialLinks links={settings.socialLinks} />

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard
            to="/about"
            icon={User}
            title="About Me"
            description={settings.aboutTeaser}
          />
          <SectionCard
            to="/projects"
            icon={Code}
            title="Projects"
            description={settings.projectsTeaser}
          />
        </div>
      </section>
    </div>
  );
}
