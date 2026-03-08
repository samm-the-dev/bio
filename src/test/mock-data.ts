import type { SiteSettings, Project } from '@/lib/queries';

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
    name: 'Test Project',
    slug: 'test-project',
    category: 'code',
    description: '<p>A test project.</p>',
    tech: ['React', 'TypeScript'],
    link: 'https://test.example.com',
    repo: 'https://github.com/test/project',
  },
  {
    name: 'Another Project',
    slug: 'another-project',
    category: 'code',
    description: '<p>Another project.</p>',
    tech: ['Python'],
    link: null,
    repo: 'https://github.com/test/another',
  },
];
