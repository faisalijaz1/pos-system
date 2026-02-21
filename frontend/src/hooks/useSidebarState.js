import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pos-sidebar-expanded';

export function useSidebarState() {
  const [expanded, setExpandedState] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v !== 'false';
    } catch {
      return true;
    }
  });

  const [hoverExpanded, setHoverExpanded] = useState(false);

  const setExpanded = useCallback((value) => {
    setExpandedState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch (_) {}
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(expanded));
    } catch (_) {}
  }, [expanded]);

  return {
    expanded,
    setExpanded,
    isSlim: !expanded,
    hoverExpanded,
    setHoverExpanded,
    toggle: useCallback(() => setExpandedState((p) => !p), []),
  };
}
