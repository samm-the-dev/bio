import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  descriptor?: string;
  centered?: boolean;
  backTo?: { label: string; path: string };
}

export function PageHeader({ title, descriptor, centered = true, backTo }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', centered && 'text-center')}>
      {backTo && (
        <div className={cn('mb-2', centered && 'flex items-center justify-between')}>
          <Link
            to={backTo.path}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backTo.label}
          </Link>
          {centered && <div className="w-[72px]" />}
        </div>
      )}
      <h1 className="mb-2 text-3xl font-bold">{title}</h1>
      {descriptor && <p className="text-lg text-muted-foreground">{descriptor}</p>}
      <hr className={cn('mt-4 border-border', centered ? 'mx-auto max-w-xs' : 'max-w-xs')} />
    </div>
  );
}
