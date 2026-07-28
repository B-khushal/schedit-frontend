import { useRef, useCallback } from 'react';

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeConfig {
  /** Minimum distance in px to trigger swipe (default: 50) */
  threshold?: number;
  /** Maximum time in ms for swipe gesture (default: 300) */
  maxTime?: number;
  /** Callback when swipe is detected */
  onSwipe: (direction: SwipeDirection) => void;
  /** Optional: only listen for specific directions */
  directions?: SwipeDirection[];
}

/**
 * Touch swipe gesture hook.
 * Returns event handlers to spread onto the target element.
 * 
 * Usage:
 * ```tsx
 * const swipeHandlers = useSwipeGesture({
 *   onSwipe: (dir) => { if (dir === 'right') closeDrawer(); },
 *   directions: ['right'],
 * });
 * 
 * <div {...swipeHandlers}>...</div>
 * ```
 */
export function useSwipeGesture({
  threshold = 50,
  maxTime = 300,
  onSwipe,
  directions,
}: SwipeConfig) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;

    touchStart.current = null;

    if (dt > maxTime) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let direction: SwipeDirection | null = null;

    if (absDx > absDy && absDx >= threshold) {
      direction = dx > 0 ? 'right' : 'left';
    } else if (absDy > absDx && absDy >= threshold) {
      direction = dy > 0 ? 'down' : 'up';
    }

    if (direction && (!directions || directions.includes(direction))) {
      onSwipe(direction);
    }
  }, [threshold, maxTime, onSwipe, directions]);

  return {
    onTouchStart,
    onTouchEnd,
  };
}
