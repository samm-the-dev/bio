import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLocation } from 'react-router-dom';
import { renderWithRouter } from '@/test/utils';
import { mockProjects, mockProjectSections, mockGifs } from '@/test/mock-data';
import { ProjectsPage } from './ProjectsPage';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-hash">{location.hash}</div>;
}

vi.mock('@/data/projects', () => ({
  projects: mockProjects,
  projectSections: mockProjectSections,
}));
vi.mock('@/data/gifs', () => ({ gifs: mockGifs }));
vi.mock('@/data/posts', () => ({
  posts: [
    {
      title: 'Test App Blog Post',
      slug: 'test-app-post',
      publishedAt: '2026-01-15T12:00:00.000Z',
      relatedProjects: [{ name: 'Test App', slug: 'test-app' }],
    },
  ],
}));

describe('ProjectsPage', () => {
  it('renders the main heading', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projects');
  });

  it('renders Web Apps section', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getByRole('heading', { name: /web apps/i })).toBeInTheDocument();
  });

  it('renders Other Code Projects section', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getByRole('heading', { name: /other code projects/i })).toBeInTheDocument();
  });

  it('renders TTRPG Projects section', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getByRole('heading', { name: /ttrpg projects/i })).toBeInTheDocument();
  });

  it('renders GIF section', () => {
    renderWithRouter(<ProjectsPage />);
    expect(
      screen.getByRole('heading', { name: /friendly neighborhood gif-maker/i }),
    ).toBeInTheDocument();
  });

  it('renders clickable project cards', () => {
    renderWithRouter(<ProjectsPage />);
    const projectCards = screen.getAllByTestId('project-card');
    expect(projectCards.length).toBe(mockProjects.length);
  });

  it('opens dialog when a project card is clicked', () => {
    renderWithRouter(<ProjectsPage />);
    fireEvent.click(screen.getAllByTestId('project-card')[0]!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens dialog when navigating with a matching hash', () => {
    renderWithRouter(<ProjectsPage />, { route: '/projects#test-app' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Test App');
  });

  it('shows description updated date in dialog when set', () => {
    renderWithRouter(<ProjectsPage />, { route: '/projects#test-app' });
    expect(screen.getByText(/Description updated March 2026/)).toBeInTheDocument();
  });

  it('shows related blog posts in dialog', () => {
    renderWithRouter(<ProjectsPage />, { route: '/projects#test-app' });
    expect(screen.getByText('Test App Blog Post')).toBeInTheDocument();
    expect(screen.getByText(/Related post/)).toBeInTheDocument();
  });

  it('closes dialog and clears hash on close button click', () => {
    renderWithRouter(
      <>
        <ProjectsPage />
        <LocationProbe />
      </>,
      { route: '/projects#test-app' },
    );
    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('location-hash')).toHaveTextContent('');
  });

  it('shows Source Code link in dialog with correct href', () => {
    renderWithRouter(<ProjectsPage />);
    fireEvent.click(screen.getAllByTestId('project-card')[0]!);
    const sourceLink = screen.getByText('Source Code');
    expect(sourceLink).toHaveAttribute('href');
    expect(sourceLink.getAttribute('href')).toMatch(/^https:\/\/github\.com\//);
  });

  it('links to /projects/gifs from View all GIFs button', () => {
    renderWithRouter(<ProjectsPage />);
    const link = screen.getByRole('link', { name: /view all gifs/i });
    expect(link).toHaveAttribute('href', '/projects/gifs');
  });

  it('renders GIF carousel images', () => {
    renderWithRouter(<ProjectsPage />);
    const gifImages = screen.getAllByRole('img');
    const featuredCount = mockGifs.filter((g) => g.featured).length;
    // Carousel duplicates items for seamless looping
    expect(gifImages.length).toBe(featuredCount * 2);
  });

  it('filters projects by search query', () => {
    renderWithRouter(<ProjectsPage />);
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'Test App' } });
    const cards = screen.getAllByTestId('project-card');
    expect(cards).toHaveLength(1);
  });

  it('shows empty message when search yields no results', () => {
    renderWithRouter(<ProjectsPage />);
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    expect(screen.queryAllByTestId('project-card')).toHaveLength(0);
    expect(screen.getByText('No projects match your search.')).toBeInTheDocument();
  });

  it('filters projects by tech tag', () => {
    renderWithRouter(<ProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'React' }));
    const cards = screen.getAllByTestId('project-card');
    expect(cards).toHaveLength(1);
  });

  it('shows Ko-fi link when not filtering', () => {
    renderWithRouter(<ProjectsPage />);
    const link = screen.getByRole('link', { name: /ko-fi/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://ko-fi.com/sammthedev');
  });

  it('hides Ko-fi link when search is active', () => {
    renderWithRouter(<ProjectsPage />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Test App' } });
    expect(screen.queryByRole('link', { name: /ko-fi/i })).not.toBeInTheDocument();
  });

  it('hides Ko-fi link when tech filter is active', () => {
    renderWithRouter(<ProjectsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'React' }));
    expect(screen.queryByRole('link', { name: /ko-fi/i })).not.toBeInTheDocument();
  });
});
