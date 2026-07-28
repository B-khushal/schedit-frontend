import { useState, useEffect, useCallback } from 'react';

/**
 * Responsive breakpoint hook for SchedIt.
 * Provides boolean flags for mobile/tablet/desktop and touch detection.
 * Uses matchMedia for performance (no resize listeners).
 */

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

function getMatch(query: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMatch(query));

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Set initial value
    setMatches(mql.matches);
    
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Convenience hook returning all responsive flags at once.
 * - isMobile: ≤ 768px (phone)
 * - isTablet: 769px–1024px (tablet)
 * - isDesktop: ≥ 1025px (laptop/desktop)
 * - isMobileNav: ≤ 1024px (controls sidebar vs bottom nav)
 * - isTouch: pointer: coarse (touch device)
 * - isCompact: ≤ 640px (smallest phones like 320px)
 */
export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isMobileNav = useMediaQuery('(max-width: 1024px)');
  const isTouch = useMediaQuery('(pointer: coarse)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1536px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileNav,
    isTouch,
    isCompact,
    isLargeDesktop,
    prefersReducedMotion,
  };
}
