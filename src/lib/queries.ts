export interface SiteSettings {
  name: string;
  descriptor: string;
  githubUrl: string | null;
  repoUrl: string | null;
  tagline: string;
  taglineAttribution: string | null;
  taglineUrl: string | null;
  intro: string;
  projectsTeaser: string;
  aboutTeaser: string;
  blogTeaser: string;
  showsTeaser: string;
  aboutImprov: string;
  aboutMovies: string;
  aboutTtrpgs: string;
  aboutCode: string;
  socialLinks: { label: string; href: string }[];
}

export interface ProjectSection {
  key: string;
  label: string;
  description: string;
}

export interface Project {
  name: string;
  slug: string;
  category: 'web-app' | 'code' | 'ttrpg';
  description: string;
  descUpdated: string | null;
  tech: string[] | null;
  link: string | null;
  repo: string | null;
}

export interface Gif {
  slug: string;
  alt: string;
  src: string;
  srcMp4: string | null;
  srcWebp: string | null;
  width: number;
  height: number;
  tags: string[];
  featured: boolean;
}

export interface Show {
  title: string;
  venue: string;
  venueUrl: string | null;
  address: string | null;
  mapsUrl: string | null;
  datetime: string;
  endDatetime: string | null;
  note: string | null;
  ticketsUrl: string | null;
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  draft: boolean;
  tags: string[] | null;
  authors: ('sam' | 'claude')[];
  replyTo: string | null;
  relatedProjects: { name: string; slug: string }[] | null;
}

export interface LetterboxdEntry {
  title: string;
  link: string;
  publishedAt: string;
  filmTitle: string;
  filmYear: string | null;
  rating: string | null;
  isRewatch: boolean;
  isLiked: boolean;
  posterUrl: string | null;
  reviewHtml: string | null;
}
