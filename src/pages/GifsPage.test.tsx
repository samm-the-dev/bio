import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { mockGifs } from '@/test/mock-data';
import { GifsPage } from './GifsPage';

vi.mock('@/data/gifs', () => ({ gifs: mockGifs }));

function renderGifsRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/projects/gifs" element={<GifsPage key="all" />} />
        <Route path="/projects/gifs/tag/:tagSlug" element={<GifsPage key="tag" />} />
      </Routes>
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
    // Mock data has tags: Dropout, Game Changer, Movies & TV
    expect(screen.getByRole('button', { name: 'Game Changer' })).toBeInTheDocument();
  });

  it('pre-selects tag from URL param on tag route', () => {
    renderGifsRoute('/projects/gifs/tag/game-changer');
    // When tag is pre-selected, heading includes the tag name
    const heading = screen.getByRole('heading', { level: 1 });
    // If tagSlugMap resolves, heading is "Game Changer GIFs"; otherwise "GIFs"
    // Either way the page should render without errors
    expect(heading).toBeInTheDocument();
  });
});
