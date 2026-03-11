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
      address: '456 Oak Ave, Plano, TX 75024',
      mapsUrl: null,
      datetime: '2099-12-01T19:00',
      endDatetime: null,
      note: null,
    },
    {
      title: 'Test Show',
      venue: 'Test Venue',
      venueUrl: 'https://example.com',
      address: '123 Main St, Dallas, TX 75001',
      mapsUrl: 'https://maps.app.goo.gl/abc123',
      datetime: '2099-06-15T20:00',
      endDatetime: '2099-06-15T22:00',
      note: 'Doors at 7 PM.',
    },
    {
      title: 'Past Show',
      venue: 'Old Venue',
      venueUrl: null,
      address: null,
      mapsUrl: null,
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

  it('renders venue name as map link and venueUrl as separate Venue Website link', () => {
    renderWithRouter(<ShowsPage />);
    const venueLink = screen.getByText('Test Venue');
    expect(venueLink.tagName).toBe('A');
    expect(venueLink).toHaveAttribute('href', 'https://maps.app.goo.gl/abc123');
    const venueWebsiteLink = screen.getByText('Venue Website');
    expect(venueWebsiteLink).toHaveAttribute('href', 'https://example.com');
  });

  it('renders venue as map link when address exists but no mapsUrl', () => {
    renderWithRouter(<ShowsPage />);
    const venue = screen.getByText('Another Venue');
    expect(venue.tagName).toBe('A');
  });

  it('renders map link using cached mapsUrl when available', () => {
    renderWithRouter(<ShowsPage />);
    const testShowArticle = screen.getByText('Test Show').closest('article');
    const mapLink = testShowArticle?.querySelector('a[href*="maps"]');
    expect(mapLink).toHaveAttribute('href', 'https://maps.app.goo.gl/abc123');
  });

  it('renders map link with search fallback when no mapsUrl', () => {
    renderWithRouter(<ShowsPage />);
    const laterShowArticle = screen.getByText('Later Show').closest('article');
    const mapLink = laterShowArticle?.querySelector('a[href*="maps"]');
    const href = mapLink?.getAttribute('href') ?? '';
    expect(href).toContain('google.com/maps/search');
    expect(href).toContain(encodeURIComponent('Another Venue, 456 Oak Ave'));
  });

  it('renders ICS calendar links on non-Android', () => {
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

  it('renders Google Calendar links on Android', () => {
    const original = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
      configurable: true,
    });

    try {
      renderWithRouter(<ShowsPage />);
      const calLinks = screen.getAllByText('Add to calendar');
      expect(calLinks.length).toBe(2);
      for (const link of calLinks) {
        expect(link).toHaveAttribute(
          'href',
          expect.stringContaining('calendar.google.com/calendar/render'),
        );
        expect(link).not.toHaveAttribute('download');
      }

      // Verify location is included in Google Calendar URL
      const testShowArticle = screen.getByText('Test Show').closest('article');
      const testShowCalLink = testShowArticle?.querySelector('a[href*="calendar.google.com"]');
      const href = testShowCalLink?.getAttribute('href') ?? '';
      expect(href).toContain('location=');
      expect(href).toContain('details=');
    } finally {
      Object.defineProperty(navigator, 'userAgent', {
        value: original,
        configurable: true,
      });
    }
  });

  it('renders note when present', () => {
    renderWithRouter(<ShowsPage />);
    expect(screen.getByText('Doors at 7 PM.')).toBeInTheDocument();
  });

  it('renders end time when present', () => {
    renderWithRouter(<ShowsPage />);
    const testShowArticle = screen.getByText('Test Show').closest('article');
    // The end time renders as " - HH:MM AM/PM TZ" after the start time
    expect(testShowArticle?.textContent).toMatch(/ - \d+:\d{2}\s*[AP]M/);
  });
});
