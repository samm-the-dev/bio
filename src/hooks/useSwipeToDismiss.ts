import { useRef, useCallback, type RefObject } from 'react';

const SWIPE_THRESHOLD = 80;
const TRANSITION_MS = 200;
/**
 * Dead zone (px) before the swipe gesture visually engages on scrollable panels.
 * Prevents casual touches from moving the dialog when there's content to scroll.
 */
const DEAD_ZONE = 30;

interface UseSwipeToDismissOptions {
  /** Only dismiss when at a scroll limit in the swipe direction. */
  checkScrollLimits?: boolean;
  /**
   * The element to check scroll limits on. Defaults to panelRef when omitted.
   * Use this when the scrollable element is a child of the panel (e.g. an inner overflow-auto div).
   */
  scrollRef?: RefObject<HTMLDivElement | null>;
}

function isScrollable(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 1;
}

export function useSwipeToDismiss(
  panelRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
  options: UseSwipeToDismissOptions = {},
) {
  const { checkScrollLimits = false, scrollRef } = options;
  const touchStart = useRef<{ y: number; time: number } | null>(null);
  const translateY = useRef(0);

  const resetPanel = useCallback(() => {
    touchStart.current = null;
    const panel = panelRef.current;
    if (panel) {
      panel.style.transition = `transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out`;
      panel.style.transform = '';
      panel.style.opacity = '';
    }
  }, [panelRef]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStart.current = { y: e.touches[0]!.clientY, time: Date.now() };
      translateY.current = 0;
      const panel = panelRef.current;
      if (panel) panel.style.transition = 'none';
    },
    [panelRef],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const panel = panelRef.current;
      const dy = e.touches[0]!.clientY - touchStart.current.y;

      if (checkScrollLimits) {
        const scroller = (scrollRef ?? panelRef).current;
        if (scroller) {
          const atTop = scroller.scrollTop === 0;
          const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
          if (!((dy > 0 && atTop) || (dy < 0 && atBottom))) return;
        }
      }

      // Apply dead zone on scrollable panels to avoid accidental dismiss
      const scroller = (scrollRef ?? panelRef).current;
      const useDeadZone = checkScrollLimits && scroller && isScrollable(scroller);
      const absDy = Math.abs(dy);
      if (useDeadZone && absDy < DEAD_ZONE) {
        translateY.current = 0;
        return;
      }
      // Offset by dead zone so the panel doesn't jump when engaging
      const effectiveDy = useDeadZone ? dy - Math.sign(dy) * DEAD_ZONE : dy;

      translateY.current = effectiveDy;
      if (panel) {
        panel.style.transform = `translateY(${effectiveDy}px)`;
        panel.style.opacity = `${Math.max(0.2, 1 - Math.abs(effectiveDy) / 400)}`;
      }
    },
    [panelRef, scrollRef, checkScrollLimits],
  );

  const onTouchEnd = useCallback(() => {
    const panel = panelRef.current;
    const dy = translateY.current;
    const absDy = Math.abs(dy);
    const elapsed = touchStart.current ? Date.now() - touchStart.current.time : 1000;
    const velocity = absDy / Math.max(elapsed, 1);
    touchStart.current = null;

    if (absDy > SWIPE_THRESHOLD || velocity > 0.5) {
      const direction = dy > 0 ? '100vh' : '-100vh';
      if (panel) {
        panel.style.transition = `transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out`;
        panel.style.transform = `translateY(${direction})`;
        panel.style.opacity = '0';
      }
      setTimeout(onClose, TRANSITION_MS);
    } else {
      resetPanel();
    }
  }, [panelRef, onClose, resetPanel]);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: resetPanel };
}
