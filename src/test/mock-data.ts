import type { SiteSettings, Project, Gif } from '@/lib/queries';

export const mockSettings: SiteSettings = {
  name: 'Test User',
  descriptor: 'Test Descriptor',
  githubUrl: 'https://github.com/test',
  repoUrl: 'https://github.com/test/bio',
  tagline: 'Test tagline',
  taglineAttribution: 'Test Author',
  taglineUrl: 'https://example.com',
  intro: '<p>Test intro paragraph.</p>',
  projectsTeaser: 'Test projects teaser.',
  aboutTeaser: 'Test about teaser.',
  blogTeaser: 'Test blog teaser.',
  showsTeaser: 'Test shows teaser.',
  aboutImprov: '<p>Test improv content.</p>',
  aboutMovies: '<p>Test movies content.</p>',
  aboutTtrpgs: '<p>Test ttrpgs content.</p>',
  aboutCode: '<p>Test code content.</p>',
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/test' },
    { label: 'Bluesky', href: 'https://bsky.app/profile/test' },
  ],
};

export const mockProjects: Project[] = [
  {
    name: 'Test App',
    slug: 'test-app',
    category: 'web-app',
    description: '<p>A test web app.</p>',
    tech: ['React', 'TypeScript'],
    link: 'https://test.example.com',
    repo: 'https://github.com/test/app',
  },
  {
    name: 'Test Tool',
    slug: 'test-tool',
    category: 'code',
    description: '<p>A test tool.</p>',
    tech: ['Python'],
    link: null,
    repo: 'https://github.com/test/tool',
  },
  {
    name: 'Test RPG',
    slug: 'test-rpg',
    category: 'ttrpg',
    description: '<p>A test TTRPG project.</p>',
    tech: null,
    link: null,
    repo: null,
  },
];

export const mockGifs: Gif[] = [
  {
    slug: 'test-gif-1',
    alt: 'Test GIF 1',
    src: '/gifs/test-1.gif',
    tenor: 'https://tenor.com/test1.gif',
  },
  {
    slug: 'test-gif-2',
    alt: 'Test GIF 2',
    src: '/gifs/test-2.gif',
    tenor: 'https://tenor.com/test2.gif',
  },
];
