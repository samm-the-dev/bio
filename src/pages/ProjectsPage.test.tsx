import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { mockProjects, mockProjectSections, mockGifs } from '@/test/mock-data';
import { ProjectsPage } from './ProjectsPage';

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
    const cards = screen.getAllByRole('button');
    const projectCards = cards.filter((el) => el.tagName === 'ARTICLE');
    expect(projectCards.length).toBe(mockProjects.length);
  });

  it('opens dialog when a project card is clicked', () => {
    renderWithRouter(<ProjectsPage />);
    const cards = screen.getAllByRole('button');
    const projectCard = cards.find((el) => el.tagName === 'ARTICLE')!;
    fireEvent.click(projectCard);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows Source Code link in dialog with correct href', () => {
    renderWithRouter(<ProjectsPage />);
    const cards = screen.getAllByRole('button');
    const projectCard = cards.find((el) => el.tagName === 'ARTICLE')!;
    fireEvent.click(projectCard);
    const sourceLink = screen.getByText('Source Code');
    expect(sourceLink).toHaveAttribute('href');
    expect(sourceLink.getAttribute('href')).toMatch(/^https:\/\/github\.com\//);
  });

  it('renders GIF images', () => {
    renderWithRouter(<ProjectsPage />);
    const gifImages = screen.getAllByRole('img');
    expect(gifImages.length).toBe(mockGifs.length);
  });
});
