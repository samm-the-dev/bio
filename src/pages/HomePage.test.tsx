import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the main heading', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders social links', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole('navigation', { name: 'Social profiles' })).toBeInTheDocument();
  });

  it('renders section preview cards', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
  });
});
