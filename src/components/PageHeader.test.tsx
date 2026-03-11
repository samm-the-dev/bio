import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as h1', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
  });

  it('renders descriptor when provided', () => {
    render(<PageHeader title="Title" descriptor="A descriptor" />);
    expect(screen.getByText('A descriptor')).toBeInTheDocument();
  });

  it('centers title by default', () => {
    render(<PageHeader title="Title" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-center');
  });

  it('supports left alignment', () => {
    render(<PageHeader title="Title" centered={false} />);
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveClass('text-center');
  });
});
