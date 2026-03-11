import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { TagFilter } from '@/components/TagFilter';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectDialog } from '@/components/ProjectDialog';
import { GifCarousel } from '@/components/GifCarousel';
import { RichText } from '@/components/RichText';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { projects, projectSections } from '@/data/projects';
import { gifs } from '@/data/gifs';
import { collectTags, filterTagged } from '@/lib/tagged';
import type { Project } from '@/lib/queries';

const projectsByCategory = new Map<string, Project[]>();
for (const p of projects) {
  const list = projectsByCategory.get(p.category) ?? [];
  list.push(p);
  projectsByCategory.set(p.category, list);
}

const getProjectTags = (p: Project) => p.tech;
const techTags = collectTags(projects, getProjectTags);

export function ProjectsPage() {
  useDocumentTitle('Projects');
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTech, setActiveTech] = useState<string | null>(null);

  const isFiltering = !!(search.trim() || activeTech);

  const filtered = useMemo(
    () => filterTagged(projects, activeTech, search, (p) => p.name, getProjectTags),
    [activeTech, search, projects, getProjectTags],
  );

  const activeProject = projects.find((p) => p.slug === location.hash.slice(1)) ?? null;

  useEffect(() => {
    const slug = location.hash.slice(1);
    if (!slug) return;
    document.getElementById(slug)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [location.hash]);

  function openProject(project: Project) {
    navigate({ hash: project.slug }, { replace: true });
  }

  function closeProject() {
    navigate({ hash: '' }, { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Projects" backTo={{ label: 'Home', path: '/' }} />

      <div className="mb-6 space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects..." />
        <TagFilter tags={techTags} activeTag={activeTech} onTagChange={setActiveTech} />
      </div>

      {isFiltering ? (
        filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((project) => (
              <ProjectCard
                key={project.slug}
                id={project.slug}
                project={project}
                onSeeMore={openProject}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            No projects match your search.
          </p>
        )
      ) : (
        projectSections.map((section, i) => {
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
                  <ProjectCard
                    key={project.slug}
                    id={project.slug}
                    project={project}
                    onSeeMore={openProject}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      {activeProject && <ProjectDialog project={activeProject} onClose={closeProject} />}
    </div>
  );
}
