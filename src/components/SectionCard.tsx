import { Link } from 'react-router-dom';
import { RichText } from './RichText';

interface SectionCardProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function SectionCard({ to, icon: Icon, title, description }: SectionCardProps) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-6"
    >
      <Icon
        aria-hidden
        className="absolute left-1/4 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/15"
      />
      <div className="relative">
        <h2 className="text-xl font-semibold text-card-foreground transition-colors group-hover:text-primary">
          {title}
        </h2>
        <div className="mt-1 text-sm text-muted-foreground">
          <RichText html={description} />
        </div>
      </div>
    </Link>
  );
}
