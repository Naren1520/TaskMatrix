import { useEffect, useState, useCallback } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);

  const onChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enter = useCallback(async (element) => {
    try {
      if (element && element.requestFullscreen) {
        await element.requestFullscreen({ navigationUI: 'hide' });
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn('Failed to enter fullscreen', err);
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Failed to exit fullscreen', err);
    }
  }, []);

  return { isFullscreen, enter, exit };
};
