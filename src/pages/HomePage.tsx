import { Code, PenLine, Ticket, User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { SocialLinks } from '@/components/SocialLinks';
import { RichText } from '@/components/RichText';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { settings } from '@/data/settings';

export function HomePage() {
  useDocumentTitle();
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
        <RichText html={settings.intro} />
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
          <SectionCard to="/blog" icon={PenLine} title="Blog" description={settings.blogTeaser} />
          <SectionCard to="/shows" icon={Ticket} title="Shows" description={settings.showsTeaser} />
        </div>
      </section>
    </div>
  );
}
