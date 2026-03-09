import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectDialog } from '@/components/ProjectDialog';
import { GifCarousel } from '@/components/GifCarousel';
import { RichText } from '@/components/RichText';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { projects, projectSections } from '@/data/projects';
import { gifs } from '@/data/gifs';
import type { Project } from '@/lib/queries';

const projectsByCategory = new Map<string, Project[]>();
for (const p of projects) {
  const list = projectsByCategory.get(p.category) ?? [];
  list.push(p);
  projectsByCategory.set(p.category, list);
}

export function ProjectsPage() {
  useDocumentTitle('Projects');
  const location = useLocation();
  const navigate = useNavigate();

  const activeProject = projects.find((p) => p.slug === location.hash.slice(1)) ?? null;

  function openProject(project: Project) {
    navigate({ hash: project.slug }, { replace: true });
  }

  function closeProject() {
    navigate({ hash: '' }, { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Projects" />

      {projectSections.map((section, i) => {
        if (section.key === 'gifs') {
          if (gifs.length === 0) return null;
          return (
            <section key={section.key} className={i > 0 ? 'mt-10' : undefined}>
              <h2 className="mb-1 text-xl font-semibold">{section.label}</h2>
              {section.description && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <RichText html={section.description} />
                </div>
              )}
              <GifCarousel gifs={gifs.filter((g) => g.featured)} />
              <Link
                to="/projects/gifs"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LayoutGrid className="h-4 w-4" />
                View all GIFs
              </Link>
            </section>
          );
        }

        const items = projectsByCategory.get(section.key) ?? [];
        if (items.length === 0) return null;

        return (
          <section key={section.key} className={i > 0 ? 'mt-10' : undefined}>
            <h2 className="mb-1 text-xl font-semibold">{section.label}</h2>
            {section.description && (
              <div className="mb-4 text-sm text-muted-foreground">
                <RichText html={section.description} />
              </div>
            )}
            {!section.description && <div className="mb-3" />}
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((project) => (
                <ProjectCard key={project.slug} project={project} onSeeMore={openProject} />
              ))}
            </div>
          </section>
        );
      })}

      {activeProject && <ProjectDialog project={activeProject} onClose={closeProject} />}
    </div>
  );
}
