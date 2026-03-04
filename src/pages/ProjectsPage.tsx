import { ExternalLink, Github } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Projects" />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Code Projects</h2>
        <div className="space-y-6">
          <article className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-card-foreground">Ohm</h3>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <a
                href="https://ohm.samm-the.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                ohm.samm-the.dev
              </a>
              <a
                href="https://github.com/samm-the-dev/ohm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              A{' '}
              <a
                href="https://personalkanban.com/learn/personal-kanban/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                personal kanban
              </a>{' '}
              app developed using ADHD research. It features optional Google Drive integration for
              storage/backup, as well as restore points and export/import functionality.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              PWA · React 19 · TypeScript · Vite · Tailwind CSS · Google Drive API · GCP Cloud
              Functions
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-card-foreground">Build-a-Jam</h3>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <a
                href="https://build-a-jam.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                build-a-jam.app
              </a>
              <a
                href="https://github.com/samm-the-dev/build-a-jam"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              A tool for selecting improv warm-ups and exercises based on tags like 'connection',
              'structure', 'heightening', and more.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              It features exercises from multiple sources (credited on the site), a session queue
              with timers, and fields for notes.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              I'm actively improving this; more concise exercise descriptions, better mobile
              scaling, and a feedback form are next.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              PWA · React 19 · TypeScript · Vite · Tailwind CSS
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-card-foreground">The Enchiridion</h3>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <a
                href="https://github.com/samm-the-dev/the-enchiridion"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              An Adventure Time catalog with a multi-theme system (8 character themes).
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              AT is one of my favorite things on the planet, and for a while now I've wanted to
              build a proper episode guide. This project is meant to replace the fandom wiki (which
              is messy and rife with ads), and improve on it with transcript searching and other
              features.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Stay tuned...</p>
            <p className="mt-2 text-xs text-muted-foreground">
              React 19 · TypeScript · Vite · Tailwind CSS · Playwright · axe-core
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-card-foreground">Adventure Time Transcripts</h3>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <a
                href="https://github.com/samm-the-dev/adventuretime-transcripts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              A speaker diarization pipeline which generates voice profiles from audio samples, then
              uses them in conjunction with Claude Vision to validate and generate transcripts.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              This was based on a repository of transcripts that I believe was scraped from the fan
              wiki. I wanted to fill out the catalog of transcripts, get them into a consistent
              format, and use them for The Enchiridion.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              This is easily the most technically complex solo project I've done, and I'm still
              working on it. Once it's done, I plan to make it generic for use with any show.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Python · Claude Vision API · ffmpeg · Docker · CUDA
            </p>
          </article>
          <article className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-card-foreground">Toolbox</h3>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <a
                href="https://github.com/samm-the-dev/toolbox"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              A library of templates and tools for enhancing my AI-assisted project development,
              distributed to my projects via Git submodule.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Claude AI · Google OAuth · GCP Cloud Functions · React · Vite · TypeScript · GitHub
              Actions
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
