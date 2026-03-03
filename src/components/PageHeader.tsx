import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  descriptor?: string;
  centered?: boolean;
}

export function PageHeader({ title, descriptor, centered = true }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', centered && 'text-center')}>
      <h1 className="mb-2 text-3xl font-bold">{title}</h1>
      {descriptor && <p className="text-lg text-muted-foreground">{descriptor}</p>}
      <hr className={cn('mt-4 border-border', centered ? 'mx-auto max-w-xs' : 'max-w-xs')} />
    </div>
  );
}
