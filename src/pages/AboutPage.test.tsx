import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('renders the main heading', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Me');
  });

  it('renders all bio sections', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /improv/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /movies/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ttrpgs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^code$/i })).toBeInTheDocument();
  });
});
