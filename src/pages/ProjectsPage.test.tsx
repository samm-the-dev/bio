import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { ProjectsPage } from './ProjectsPage';

describe('ProjectsPage', () => {
  it('renders the main heading', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Projects');
  });

  it('renders code projects section', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getByRole('heading', { name: /code projects/i })).toBeInTheDocument();
  });

  it('renders project cards', () => {
    renderWithRouter(<ProjectsPage />);
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('renders Source Code links with unique aria-labels', () => {
    renderWithRouter(<ProjectsPage />);
    const sourceLinks = screen.getAllByText('Source Code');
    expect(sourceLinks.length).toBeGreaterThan(1);
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
});
