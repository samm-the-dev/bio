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
});
