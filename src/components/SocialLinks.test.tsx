import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLinks } from './SocialLinks';

const testLinks = [
  { label: 'Letterboxd', href: 'https://letterboxd.com/test/' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/test' },
  { label: 'GitHub', href: 'https://github.com/test' },
  { label: 'Discord', href: 'https://discord.com/users/123' },
];

describe('SocialLinks', () => {
  it('renders a nav with social profile links', () => {
    render(<SocialLinks links={testLinks} />);
    expect(screen.getByRole('navigation', { name: 'Social profiles' })).toBeInTheDocument();
  });

  it('renders all social links with correct labels', () => {
    render(<SocialLinks links={testLinks} />);
    expect(screen.getByLabelText('Letterboxd')).toBeInTheDocument();
    expect(screen.getByLabelText('Bluesky')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Discord')).toBeInTheDocument();
  });

  it('renders an icon for each social link', () => {
    render(<SocialLinks links={testLinks} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link.querySelector('svg')).toBeInTheDocument();
    }
  });

  it('opens links in new tabs', () => {
    render(<SocialLinks links={testLinks} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
