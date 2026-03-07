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

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  name, descriptor, githubUrl, repoUrl,
  tagline, taglineAttribution, taglineUrl,
  intro, projectsTeaser, aboutTeaser,
  aboutImprov, aboutMovies, aboutTtrpgs, aboutCode,
  "socialLinks": coalesce(socialLinks[]{ label, href }, [])
}`;

export const PROJECTS_QUERY = `*[_type == "project"] | order(displayOrder asc){
  name, "slug": slug.current, category,
  description, tech, link, repo, displayOrder, status
}`;
