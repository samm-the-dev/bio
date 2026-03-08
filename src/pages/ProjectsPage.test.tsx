import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { mockProjects, mockGifs } from '@/test/mock-data';
import { ProjectsPage } from './ProjectsPage';

vi.mock('@/data/projects', () => ({ projects: mockProjects }));
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

  it('renders project cards', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('renders Source Code links with unique aria-labels', () => {
    renderWithRouter(<ProjectsPage />);
    const sourceLinks = screen.getAllByText('Source Code');
    expect(sourceLinks.length).toBeGreaterThan(0);
    for (const link of sourceLinks) {
      expect(link).toHaveAttribute('aria-label');
      expect(link.getAttribute('aria-label')).toMatch(/source code on GitHub$/i);
    }
    const labels = sourceLinks.map((l) => l.getAttribute('aria-label'));
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('renders Source Code links with correct hrefs', () => {
    renderWithRouter(<ProjectsPage />);
    const sourceLinks = screen.getAllByText('Source Code');
    for (const link of sourceLinks) {
      expect(link).toHaveAttribute('href');
      expect(link.getAttribute('href')).toMatch(/^https:\/\/github\.com\//);
    }
  });

  it('renders GIF images', () => {
    renderWithRouter(<ProjectsPage />);
    const gifImages = screen.getAllByRole('img');
    expect(gifImages.length).toBe(mockGifs.length);
  });

  it('renders see more buttons for each project card', () => {
    renderWithRouter(<ProjectsPage />);
    const seeMoreButtons = screen.getAllByText('see more');
    expect(seeMoreButtons.length).toBe(mockProjects.length);
  });

  it('opens dialog when see more is clicked', () => {
    renderWithRouter(<ProjectsPage />);
    const seeMoreButtons = screen.getAllByText('see more');
    fireEvent.click(seeMoreButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
