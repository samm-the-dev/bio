import { Code, User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { SocialLinks } from '@/components/SocialLinks';

export function HomePage() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <PageHeader title="Sam Marsh" descriptor="Improv, Movies, TTRPGs, Code" />

      <blockquote className="mb-8 text-sm italic text-muted-foreground">
        "If we want the rewards of being loved, we have to submit to the mortifying ordeal of being
        known."
        <footer className="mt-1 text-xs text-muted-foreground/70">
          &mdash;{' '}
          <a
            href="https://archive.nytimes.com/opinionator.blogs.nytimes.com/2013/06/15/i-know-what-you-think-of-me/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Tim Kreider
          </a>
        </footer>
      </blockquote>

      <h2 className="mb-4 text-xl font-semibold">Welcome!</h2>
      <div className="mb-8 space-y-3">
        <p className="text-muted-foreground">
          I enjoy creative pursuits and my ADHD likes being involved.
        </p>
        <p className="text-muted-foreground">
          I love finding the story in everything and engaging in play wherever I can, especially
          when it connects me to others.
        </p>
        <p className="text-muted-foreground">
          This is where I share what I'm working on and what I care about.
        </p>
      </div>

      <SocialLinks />

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard
            to="/about"
            icon={User}
            title="About Me"
            description="My improv journey, movie obsession, TTRPG experience, and how I code."
          />
          <SectionCard
            to="/projects"
            icon={Code}
            title="Projects"
            description="Web apps, TTRPG systems and tools, and more on the way."
          />
        </div>
      </section>
    </div>
  );
}
