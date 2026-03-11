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
    <div className="mb-8">
      <div className={cn('mb-2', centered && backTo && 'flex items-center justify-between')}>
        {backTo && (
          <Link
            to={backTo.path}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backTo.label}
          </Link>
        )}
        <h1 className={cn('text-3xl font-bold', centered && 'text-center')}>{title}</h1>
        {centered && backTo && <div className="w-[72px]" />}
      </div>
      {descriptor && (
        <p className={cn('text-lg text-muted-foreground', centered && 'text-center')}>
          {descriptor}
        </p>
      )}
      <hr className={cn('mt-4 border-border', centered ? 'mx-auto max-w-xs' : 'max-w-xs')} />
    </div>
  );
}
