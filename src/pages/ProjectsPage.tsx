import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectDialog } from '@/components/ProjectDialog';
import { GifCarousel } from '@/components/GifCarousel';
import { RichText } from '@/components/RichText';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useModalState } from '@/hooks/useModalState';
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
  const modal = useModalState<Project>();

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
              <div className="mt-3 text-right">
                <Link
                  to="/gifs"
                  className="text-sm text-muted-foreground underline hover:text-foreground"
                >
                  View all GIFs
                </Link>
              </div>
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
                <ProjectCard key={project.slug} project={project} onSeeMore={modal.open} />
              ))}
            </div>
          </section>
        );
      })}

      {modal.item && <ProjectDialog project={modal.item} onClose={modal.close} />}
    </div>
  );
}
