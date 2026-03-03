import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/utils';
import { SectionCard } from './SectionCard';
import { Code } from 'lucide-react';

describe('SectionCard', () => {
  it('renders as a link to the given route', () => {
    renderWithRouter(
      <SectionCard to="/projects" icon={Code} title="Projects" description="My projects" />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects');
  });

  it('renders title and description', () => {
    renderWithRouter(
      <SectionCard to="/test" icon={Code} title="Test Title" description="Test description" />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
});
