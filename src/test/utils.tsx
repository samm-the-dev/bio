import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

interface RouterOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

/**
 * Renders a component wrapped in a router for testing components that use
 * react-router hooks or Link components.
 *
 * Pass `route` to use MemoryRouter with an initial entry (needed for useParams).
 */
export function renderWithRouter(ui: React.ReactElement, options?: RouterOptions) {
  const { route, ...renderOptions } = options ?? {};
  const wrapper = route
    ? ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      )
    : ({ children }: { children: React.ReactNode }) => <BrowserRouter>{children}</BrowserRouter>;
  return render(ui, { ...renderOptions, wrapper });
}

export { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
