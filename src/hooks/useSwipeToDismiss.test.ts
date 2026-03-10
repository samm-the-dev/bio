import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSwipeToDismiss } from './useSwipeToDismiss';

function makePanel(): HTMLDivElement {
  const el = document.createElement('div');
  Object.defineProperties(el, {
    scrollTop: { value: 0, writable: true },
    clientHeight: { value: 500, writable: true },
    scrollHeight: { value: 500, writable: true },
  });
  return el;
}

function touch(y: number): React.TouchEvent {
  return { touches: [{ clientY: y }] } as unknown as React.TouchEvent;
}

describe('useSwipeToDismiss', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let panel: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    onClose = vi.fn();
    panel = makePanel();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onClose after swipe exceeding threshold', () => {
    const ref = { current: panel };
    const { result } = renderHook(() => useSwipeToDismiss(ref, onClose));

    act(() => result.current.onTouchStart(touch(100)));
    act(() => result.current.onTouchMove(touch(200))); // dy = 100 > 80 threshold
    act(() => result.current.onTouchEnd());

    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('resets panel when swipe is below threshold', () => {
    const ref = { current: panel };
    const { result } = renderHook(() => useSwipeToDismiss(ref, onClose));

    act(() => result.current.onTouchStart(touch(100)));
    // Advance time so velocity stays low (30px / 500ms = 0.06 < 0.5)
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.onTouchMove(touch(130))); // dy = 30 < 80
    act(() => result.current.onTouchEnd());

    act(() => vi.advanceTimersByTime(200));
    expect(onClose).not.toHaveBeenCalled();
    expect(panel.style.transform).toBe('');
    expect(panel.style.opacity).toBe('');
  });

  it('onTouchCancel resets the panel', () => {
    const ref = { current: panel };
    const { result } = renderHook(() => useSwipeToDismiss(ref, onClose));

    act(() => result.current.onTouchStart(touch(100)));
    act(() => result.current.onTouchMove(touch(200)));
    act(() => result.current.onTouchCancel());

    expect(panel.style.transform).toBe('');
    expect(panel.style.opacity).toBe('');
  });

  it('blocks swipe when not at scroll limit (checkScrollLimits)', () => {
    // Panel is scrolled to the middle — not at top or bottom
    Object.defineProperties(panel, {
      scrollTop: { value: 100, writable: true },
      scrollHeight: { value: 1000, writable: true },
    });
    const ref = { current: panel };
    const { result } = renderHook(() =>
      useSwipeToDismiss(ref, onClose, { checkScrollLimits: true }),
    );

    act(() => result.current.onTouchStart(touch(100)));
    act(() => result.current.onTouchMove(touch(250))); // swipe down, but not at top
    act(() => result.current.onTouchEnd());

    act(() => vi.advanceTimersByTime(200));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('allows swipe down when at scroll top (checkScrollLimits)', () => {
    Object.defineProperties(panel, {
      scrollTop: { value: 0, writable: true },
      scrollHeight: { value: 1000, writable: true },
    });
    const ref = { current: panel };
    const { result } = renderHook(() =>
      useSwipeToDismiss(ref, onClose, { checkScrollLimits: true }),
    );

    act(() => result.current.onTouchStart(touch(100)));
    act(() => result.current.onTouchMove(touch(250))); // swipe down, at top
    act(() => result.current.onTouchEnd());

    act(() => vi.advanceTimersByTime(200));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('allows swipe up when at scroll bottom (checkScrollLimits)', () => {
    Object.defineProperties(panel, {
      scrollTop: { value: 500, writable: true },
      clientHeight: { value: 500, writable: true },
      scrollHeight: { value: 1000, writable: true },
    });
    const ref = { current: panel };
    const { result } = renderHook(() =>
      useSwipeToDismiss(ref, onClose, { checkScrollLimits: true }),
    );

    act(() => result.current.onTouchStart(touch(200)));
    act(() => result.current.onTouchMove(touch(50))); // swipe up, at bottom
    act(() => result.current.onTouchEnd());

    act(() => vi.advanceTimersByTime(200));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('applies translateY and opacity during swipe', () => {
    const ref = { current: panel };
    const { result } = renderHook(() => useSwipeToDismiss(ref, onClose));

    act(() => result.current.onTouchStart(touch(100)));
    act(() => result.current.onTouchMove(touch(150)));

    expect(panel.style.transform).toBe('translateY(50px)');
    expect(parseFloat(panel.style.opacity)).toBeGreaterThan(0);
    expect(parseFloat(panel.style.opacity)).toBeLessThanOrEqual(1);
  });
});
