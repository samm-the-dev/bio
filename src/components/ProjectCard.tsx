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
  id?: string;
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent ?? '';
}

export function ProjectCard({ project, onSeeMore, id }: ProjectCardProps) {
  return (
    <button
      type="button"
      id={id}
      data-testid="project-card"
      aria-label={project.name}
      onClick={() => onSeeMore(project)}
      className="min-w-0 cursor-pointer rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20"
    >
      <article>
        <h3 className="font-semibold text-card-foreground">{project.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {stripHtml(project.description)}
        </p>
      </article>
    </button>
  );
}
