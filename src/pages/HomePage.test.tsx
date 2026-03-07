import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { mockSettings } from '@/test/sanity-mock';
import { HomePage } from './HomePage';

vi.mock('@/hooks/useSanityQuery', () => ({
  useSanityQuery: () => ({ data: mockSettings, loading: false, error: null }),
}));

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
