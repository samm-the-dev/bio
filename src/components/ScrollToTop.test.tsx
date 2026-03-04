import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';

function NavHelper({ to }: { to: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>go</button>;
}

describe('ScrollToTop', () => {
  it('scrolls to top on mount', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/about']}>
        <ScrollToTop />
      </MemoryRouter>,
    );
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  it('scrolls to top on route change', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { getByText } = render(
      <MemoryRouter initialEntries={['/about']}>
        <ScrollToTop />
        <NavHelper to="/projects" />
        <Routes>
          <Route path="/about" element={<div>about</div>} />
          <Route path="/projects" element={<div>projects</div>} />
        </Routes>
      </MemoryRouter>,
    );
    scrollTo.mockClear();
    act(() => {
      getByText('go').click();
    });
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  it('renders nothing', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe('');
    vi.restoreAllMocks();
  });
});
