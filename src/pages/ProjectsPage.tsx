import { ExternalLink, Github } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { PortableText } from '@/components/PortableText';
import { projects } from '@/data/projects';
import type { Project } from '@/lib/queries';

function hostFromUrl(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const codeProjects = projects.filter((p) => p.category === 'code');
const tabletopProjects = projects.filter((p) => p.category === 'tabletop');

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Projects" />

      {codeProjects.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Code Projects</h2>
          <div className="space-y-6">
            {codeProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {tabletopProjects.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Tabletop Projects</h2>
          <div className="space-y-6">
            {tabletopProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold text-card-foreground">{project.name}</h3>
      <div className="mt-1 flex items-center gap-3 text-xs">
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {hostFromUrl(project.link)}
          </a>
        )}
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} source code on GitHub`}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            Source Code
          </a>
        )}
      </div>
      <div className="mt-1 text-sm">
        <PortableText value={project.description} />
      </div>
      {project.tech && project.tech.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">{project.tech.join(' \u00B7 ')}</p>
      )}
    </article>
  );
}
