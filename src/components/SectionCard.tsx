import { Link } from 'react-router-dom';

interface SectionCardProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function SectionCard({ to, icon: Icon, title, description }: SectionCardProps) {
  return (
    <Link to={to} className="group rounded-lg border border-border bg-card p-6">
      <h2 className="flex items-center justify-center gap-2 text-xl font-semibold text-card-foreground transition-colors group-hover:text-primary">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
