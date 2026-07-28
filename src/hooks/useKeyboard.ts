import { useEffect, useCallback } from 'react';

type KeyCombo = string; // e.g., 'ctrl+k', 'meta+k', 'escape'

export function useKeyboard(combo: KeyCombo, callback: () => void, enabled: boolean = true) {
  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    const parts = combo.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    const needsCtrl = parts.includes('ctrl');
    const needsMeta = parts.includes('meta');
    const needsShift = parts.includes('shift');
    const needsAlt = parts.includes('alt');

    const isCtrl = needsCtrl ? (e.ctrlKey || e.metaKey) : true;
    const isMeta = needsMeta ? e.metaKey : true;
    const isShift = needsShift ? e.shiftKey : true;
    const isAlt = needsAlt ? e.altKey : true;

    if (
      e.key.toLowerCase() === key &&
      isCtrl && isMeta && isShift && isAlt
    ) {
      e.preventDefault();
      callback();
    }
  }, [combo, callback, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handler]);
}
