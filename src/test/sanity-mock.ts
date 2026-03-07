import type { SiteSettings, Project } from '@/lib/queries';
import type { PortableTextBlock } from '@portabletext/react';

function textBlock(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 8),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
  };
}

export const mockSettings: SiteSettings = {
  name: 'Test User',
  descriptor: 'Test Descriptor',
  githubUrl: 'https://github.com/test',
  repoUrl: 'https://github.com/test/bio',
  tagline: 'Test tagline',
  taglineAttribution: 'Test Author',
  taglineUrl: 'https://example.com',
  intro: [textBlock('Test intro paragraph.')],
  projectsTeaser: 'Test projects teaser.',
  aboutTeaser: 'Test about teaser.',
  aboutImprov: [textBlock('Test improv content.')],
  aboutMovies: [textBlock('Test movies content.')],
  aboutTtrpgs: [textBlock('Test ttrpgs content.')],
  aboutCode: [textBlock('Test code content.')],
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
    description: [textBlock('A test project.')],
    tech: ['React', 'TypeScript'],
    link: 'https://test.example.com',
    repo: 'https://github.com/test/project',
    displayOrder: 0,
    status: 'active',
  },
  {
    name: 'Another Project',
    slug: 'another-project',
    category: 'code',
    description: [textBlock('Another project.')],
    tech: ['Python'],
    link: null,
    repo: 'https://github.com/test/another',
    displayOrder: 1,
    status: 'active',
  },
];
