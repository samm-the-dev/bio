import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Route, Routes, MemoryRouter, useLocation } from 'react-router-dom';
import { render } from '@testing-library/react';
import { mockGifs } from '@/test/mock-data';
import { GifsPage } from './GifsPage';

vi.mock('@/data/gifs', () => ({ gifs: mockGifs }));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-path">{location.pathname}</div>;
}

function renderGifsRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/projects/gifs" element={<GifsPage key="all" />} />
        <Route path="/projects/gifs/tag/:tagSlug" element={<GifsPage key="tag" />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('GifsPage', () => {
  it('renders the page heading on the base route', () => {
    renderGifsRoute('/projects/gifs');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders on a tag route without crashing', () => {
    renderGifsRoute('/projects/gifs/tag/game-changer');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows tag filter buttons', () => {
    renderGifsRoute('/projects/gifs');
    expect(screen.getByRole('button', { name: 'Game Changer' })).toBeInTheDocument();
  });

  it('updates URL when a tag is selected', () => {
    renderGifsRoute('/projects/gifs');
    fireEvent.click(screen.getByRole('button', { name: 'Game Changer' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/projects/gifs/tag/game-changer',
    );
  });

  it('returns URL to base when tag is deselected', () => {
    renderGifsRoute('/projects/gifs/tag/game-changer');
    // Click the active tag to deselect it
    fireEvent.click(screen.getByRole('button', { name: 'Game Changer' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent('/projects/gifs');
  });
});
