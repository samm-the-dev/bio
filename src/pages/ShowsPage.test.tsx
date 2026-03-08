import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/utils';
import { ShowsPage } from './ShowsPage';

vi.mock('@/data/shows', () => ({
  shows: [
    {
      title: 'Later Show',
      venue: 'Another Venue',
      venueUrl: null,
      address: null,
      datetime: '2099-12-01T19:00',
      endDatetime: null,
      note: null,
    },
    {
      title: 'Test Show',
      venue: 'Test Venue',
      venueUrl: 'https://example.com',
      address: '123 Main St, Dallas, TX 75001',
      datetime: '2099-06-15T20:00',
      endDatetime: '2099-06-15T22:00',
      note: 'Doors at 7 PM.',
    },
    {
      title: 'Past Show',
      venue: 'Old Venue',
      venueUrl: null,
      address: null,
      datetime: '2020-01-01T20:00',
      endDatetime: null,
      note: null,
    },
  ],
}));

describe('ShowsPage', () => {
  it('renders the main heading', () => {
    renderWithRouter(<ShowsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Upcoming Shows');
  });

  it('filters out past shows', () => {
    renderWithRouter(<ShowsPage />);
    expect(screen.queryByText('Past Show')).not.toBeInTheDocument();
  });

  it('renders upcoming shows', () => {
    renderWithRouter(<ShowsPage />);
    expect(screen.getByText('Test Show')).toBeInTheDocument();
    expect(screen.getByText('Later Show')).toBeInTheDocument();
  });

  it('sorts shows by date ascending', () => {
    renderWithRouter(<ShowsPage />);
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveTextContent('Test Show');
    expect(articles[1]).toHaveTextContent('Later Show');
  });

  it('renders venue as link when venueUrl exists', () => {
    renderWithRouter(<ShowsPage />);
    const venueLink = screen.getByText('Test Venue');
    expect(venueLink.tagName).toBe('A');
    expect(venueLink).toHaveAttribute('href', 'https://example.com');
  });

  it('renders venue as plain text when no venueUrl', () => {
    renderWithRouter(<ShowsPage />);
    const venue = screen.getByText('Another Venue');
    expect(venue.tagName).toBe('SPAN');
  });

  it('renders map link when address exists', () => {
    renderWithRouter(<ShowsPage />);
    const mapLinks = screen.getAllByText('Map');
    expect(mapLinks.length).toBe(1);
    expect(mapLinks[0]).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
  });

  it('renders calendar download links', () => {
    renderWithRouter(<ShowsPage />);
    const calLinks = screen.getAllByText('Add to calendar');
    expect(calLinks.length).toBe(2);
    for (const link of calLinks) {
      expect(link).toHaveAttribute('href', expect.stringContaining('text/calendar'));
      expect(link).toHaveAttribute('download', expect.stringMatching(/\.ics$/));
    }

    // Verify ICS content for the show with endDatetime and address
    const testShowArticle = screen.getByText('Test Show').closest('article');
    const testShowCalLink = testShowArticle?.querySelector('a[download]');
    const href = testShowCalLink?.getAttribute('href') ?? '';
    const ics = decodeURIComponent(href.slice(href.indexOf(',') + 1));

    expect(ics).toContain('TZID=America/Chicago');
    expect(ics).toContain('DTSTART;TZID=America/Chicago:');
    expect(ics).toContain('DTEND;TZID=America/Chicago:');
    expect(ics).toContain('LOCATION:Test Venue, 123 Main St, Dallas, TX 75001');
  });

  it('renders note when present', () => {
    renderWithRouter(<ShowsPage />);
    expect(screen.getByText('Doors at 7 PM.')).toBeInTheDocument();
  });

  it('renders end time when present', () => {
    renderWithRouter(<ShowsPage />);
    const timeText = screen.getByText(/10:00 PM/);
    expect(timeText).toBeInTheDocument();
  });
});
