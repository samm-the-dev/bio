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

export interface Project {
  name: string;
  slug: string;
  category: 'code' | 'tabletop';
  description: string;
  tech: string[] | null;
  link: string | null;
  repo: string | null;
}

export interface Show {
  title: string;
  venue: string;
  venueUrl: string | null;
  address: string | null;
  datetime: string;
  endDatetime: string | null;
  note: string | null;
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
