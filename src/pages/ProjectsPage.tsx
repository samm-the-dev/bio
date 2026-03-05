import { ExternalLink, Github } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ProjectDescription } from '@/components/ProjectDescription';
import ohmDesc from '@/data/projects/ohm.txt?raw';
import build_a_jamDesc from '@/data/projects/build-a-jam.txt?raw';
import the_enchiridionDesc from '@/data/projects/the-enchiridion.txt?raw';
import adventuretime_transcriptsDesc from '@/data/projects/adventuretime-transcripts.txt?raw';
import toolboxDesc from '@/data/projects/toolbox.txt?raw';

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
                aria-label="Ohm source code on GitHub"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <ProjectDescription text={ohmDesc} />
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
                aria-label="Build-a-Jam source code on GitHub"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <ProjectDescription text={build_a_jamDesc} />
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
                aria-label="The Enchiridion source code on GitHub"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <ProjectDescription text={the_enchiridionDesc} />
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
                aria-label="Adventure Time Transcripts source code on GitHub"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <ProjectDescription text={adventuretime_transcriptsDesc} />
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
                aria-label="Toolbox source code on GitHub"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                Source Code
              </a>
            </div>
            <ProjectDescription text={toolboxDesc} />
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
