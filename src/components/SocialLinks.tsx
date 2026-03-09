import type { JSX } from 'react';
import { Film, Instagram, Github, type LucideIcon } from 'lucide-react';
import { BlueskyIcon, LinkedInIcon, DiscordIcon } from '@/components/icons';

type IconComponent = LucideIcon | ((props: { className?: string }) => JSX.Element);

const iconMap: Record<string, IconComponent> = {
  Letterboxd: Film,
  Bluesky: BlueskyIcon,
  Instagram: Instagram,
  GitHub: Github,
  LinkedIn: LinkedInIcon,
  Discord: DiscordIcon,
};

interface SocialLinksProps {
  links: { label: string; href: string }[];
}

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <nav aria-label="Social profiles" className="flex flex-wrap items-center justify-center gap-4">
      {links.map(({ href, label }) => {
        const Icon = iconMap[label];
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={label}
          >
            {Icon && <Icon className="h-5 w-5 shrink-0" />}
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
