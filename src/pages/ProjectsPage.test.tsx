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
});
