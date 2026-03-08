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

  it('shows Source Code link in dialog with correct href', () => {
    renderWithRouter(<ProjectsPage />);
    const seeMoreButtons = screen.getAllByText('see more');
    fireEvent.click(seeMoreButtons[0]!);
    const sourceLink = screen.getByText('Source Code');
    expect(sourceLink).toHaveAttribute('href');
    expect(sourceLink.getAttribute('href')).toMatch(/^https:\/\/github\.com\//);
    expect(sourceLink).toHaveAttribute('aria-label');
    expect(sourceLink.getAttribute('aria-label')).toMatch(/source code on GitHub$/i);
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
    fireEvent.click(seeMoreButtons[0]!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
