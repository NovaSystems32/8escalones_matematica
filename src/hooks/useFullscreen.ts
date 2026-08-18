import { useCallback, useEffect, useState } from 'react';

export function useFullscreen() {
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setEsPantallaCompleta(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const alternar = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  return { esPantallaCompleta, alternar };
}
