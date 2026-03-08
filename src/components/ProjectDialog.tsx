import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { RichText } from './RichText';
import { ProjectLinks } from './ProjectCard';
import type { Project } from '@/lib/queries';

interface ProjectDialogProps {
  project: Project;
  onClose: () => void;
}

export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={project.name}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{project.name}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
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
