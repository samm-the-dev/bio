import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { mockSettings } from '@/test/mock-data';
import { renderWithRouter } from '@/test/utils';
import { AboutPage } from './AboutPage';

vi.mock('@/data/settings', () => ({ settings: mockSettings }));

describe('AboutPage', () => {
  it('renders the main heading', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Me');
  });

  it('renders all bio sections', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByRole('heading', { name: /improv/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /movies/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ttrpgs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^code$/i })).toBeInTheDocument();
  });
});
