import { useEffect, useRef } from 'react';
import { X, Link } from 'lucide-react';
import { RichText } from './RichText';
import { ProjectLinks } from './ProjectCard';
import type { Project } from '@/lib/queries';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { shareUrl } from '@/lib/share';

interface ProjectDialogProps {
  project: Project;
  onClose: () => void;
}

export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const trapRef = useFocusTrap<HTMLDivElement>();
  const backdropRef = useRef<HTMLDivElement>(null);

  async function handleShare() {
    const url = new URL(window.location.href);
    url.hash = project.slug;
    await shareUrl(url.toString(), project.name);
  }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Close on scroll-wheel over the backdrop (not the panel)
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    function onWheel(e: WheelEvent) {
      if (e.target === backdrop) {
        e.preventDefault();
        onClose();
      }
    }
    backdrop.addEventListener('wheel', onWheel, { passive: false });
    return () => backdrop.removeEventListener('wheel', onWheel);
  }, [onClose]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- keyboard close handled via useEffect keydown listener
    <div
      ref={(el) => {
        trapRef.current = el;
        backdropRef.current = el;
      }}
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{project.name}</h2>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => void handleShare()}
              aria-label="Share link to project"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Link className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-2">
          <ProjectLinks project={project} />
        </div>
        <div className="mt-3 text-sm">
          <RichText html={project.description} />
        </div>
        {project.tech && project.tech.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">{project.tech.join(' \u00B7 ')}</p>
        )}
      </div>
    </div>
  );
}
