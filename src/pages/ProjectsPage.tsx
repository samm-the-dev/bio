import { PageHeader } from '@/components/PageHeader';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectDialog } from '@/components/ProjectDialog';
import { GifCarousel } from '@/components/GifCarousel';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useModalState } from '@/hooks/useModalState';
import { projects } from '@/data/projects';
import { gifs } from '@/data/gifs';
import type { Project } from '@/lib/queries';

const webApps = projects.filter((p) => p.category === 'web-app');
const codeProjects = projects.filter((p) => p.category === 'code');
const ttrpgProjects = projects.filter((p) => p.category === 'ttrpg');

export function ProjectsPage() {
  useDocumentTitle('Projects');
  const modal = useModalState<Project>();

  return (
    <div className="mx-auto max-w-2xl overflow-hidden">
      <PageHeader title="Projects" />

      {webApps.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Web Apps</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {webApps.map((project) => (
              <ProjectCard key={project.slug} project={project} onSeeMore={modal.open} />
            ))}
          </div>
        </section>
      )}

      {codeProjects.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Other Code Projects</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {codeProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} onSeeMore={modal.open} />
            ))}
          </div>
        </section>
      )}

      {gifs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Your Friendly Neighborhood GIF-Maker</h2>
          <GifCarousel gifs={gifs} />
        </section>
      )}

      {ttrpgProjects.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">TTRPG Projects</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ttrpgProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} onSeeMore={modal.open} />
            ))}
          </div>
        </section>
      )}

      {modal.item && <ProjectDialog project={modal.item} onClose={modal.close} />}
    </div>
  );
}
