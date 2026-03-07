import type { PortableTextBlock } from '@portabletext/react';

export interface SiteSettings {
  name: string;
  descriptor: string;
  githubUrl: string;
  repoUrl: string;
  tagline: string;
  taglineAttribution: string;
  taglineUrl: string;
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
  category: string;
  description: PortableTextBlock[];
  tech: string[];
  link: string | null;
  repo: string;
  displayOrder: number;
  status: string;
}

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  name, descriptor, githubUrl, repoUrl,
  tagline, taglineAttribution, taglineUrl,
  intro, projectsTeaser, aboutTeaser,
  aboutImprov, aboutMovies, aboutTtrpgs, aboutCode,
  socialLinks[]{ label, href }
}`;

export const PROJECTS_QUERY = `*[_type == "project"] | order(displayOrder asc){
  name, "slug": slug.current, category,
  description, tech, link, repo, displayOrder, status
}`;
