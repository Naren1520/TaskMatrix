import { useEffect } from 'react';

export const usePreventNavigation = ({ active, onViolation } = {}) => {
  useEffect(() => {
    if (!active) return;

    // beforeunload warning
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Study Mode active';
      if (typeof onViolation === 'function') onViolation('beforeunload');
      return 'Study Mode active';
    };

    // prevent back using pushState loop
    const pushLoop = () => {
      try {
        history.pushState(null, document.title, location.href);
      } catch {
        // ignore
      }
    };

    pushLoop();
    const popHandler = () => {
      pushLoop();
      if (typeof onViolation === 'function') onViolation('back');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', popHandler);

    // keydown blocker for common combos (best-effort)
    const keyHandler = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      // Block Escape, F11, Backspace (when not in input), Ctrl+W, Ctrl+R, F5
      if (e.key === 'Escape' || e.key === 'F11' || e.key === 'F5') {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onViolation === 'function') onViolation('key');
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W' || e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onViolation === 'function') onViolation('key');
      }
      if (e.key === 'Backspace' && !isInput) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onViolation === 'function') onViolation('key');
      }
    };

    window.addEventListener('keydown', keyHandler, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', popHandler);
      window.removeEventListener('keydown', keyHandler, true);
    };
  }, [active, onViolation]);
};
