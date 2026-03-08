import type { PortableTextBlock } from '@portabletext/react';

export interface SiteSettings {
  name: string;
  descriptor: string;
  githubUrl: string | null;
  repoUrl: string | null;
  tagline: string;
  taglineAttribution: string | null;
  taglineUrl: string | null;
  intro: PortableTextBlock[];
  projectsTeaser: string;
  aboutTeaser: string;
  blogTeaser: string;
  aboutImprov: PortableTextBlock[];
  aboutMovies: PortableTextBlock[];
  aboutTtrpgs: PortableTextBlock[];
  aboutCode: PortableTextBlock[];
  socialLinks: { label: string; href: string }[];
}

export interface Project {
  name: string;
  slug: string;
  category: 'code' | 'tabletop';
  description: PortableTextBlock[];
  tech: string[] | null;
  link: string | null;
  repo: string | null;
  displayOrder: number;
  status: 'active' | 'paused' | 'concept' | 'complete';
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  tags: string[] | null;
  relatedProjects: { name: string; slug: string }[] | null;
}
