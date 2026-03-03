import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLinks } from './SocialLinks';

describe('SocialLinks', () => {
  it('renders a nav with social profile links', () => {
    render(<SocialLinks />);
    expect(screen.getByRole('navigation', { name: 'Social profiles' })).toBeInTheDocument();
  });

  it('renders all social links with correct labels', () => {
    render(<SocialLinks />);
    expect(screen.getByLabelText('Letterboxd')).toBeInTheDocument();
    expect(screen.getByLabelText('Bluesky')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
  });

  it('opens links in new tabs', () => {
    render(<SocialLinks />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
