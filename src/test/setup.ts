import '@testing-library/jest-dom';

// ResizeObserver is not implemented in jsdom
(globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  class implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

// matchMedia is not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});
