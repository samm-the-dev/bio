import { ExternalLink, Github } from 'lucide-react';
import type { Project } from '@/lib/queries';

function hostFromUrl(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-3 text-xs">
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
  );
}

interface ProjectCardProps {
  project: Project;
  onSeeMore: (project: Project) => void;
}

export function ProjectCard({ project, onSeeMore }: ProjectCardProps) {
  return (
    <article className="min-w-0 rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold text-card-foreground">{project.name}</h3>
      <div className="mt-1">
        <ProjectLinks project={project} />
      </div>
      <div
        className="mt-1 line-clamp-2 text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: project.description }}
      />
      <button
        onClick={() => onSeeMore(project)}
        className="mt-1 text-xs text-primary hover:text-primary-hover"
      >
        see more
      </button>
      {project.tech && project.tech.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">{project.tech.join(' \u00B7 ')}</p>
      )}
    </article>
  );
}
