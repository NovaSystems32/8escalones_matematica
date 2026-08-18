import { useEffect } from 'react';

export interface AtajosTeclado {
  onSeleccionarOpcion?: (indice: 0 | 1 | 2 | 3) => void;
  onIniciarPausar?: () => void;
  onConfirmar?: () => void;
  onSiguiente?: () => void;
  onReiniciarTiempo?: () => void;
  onPantallaCompleta?: () => void;
  onEscape?: () => void;
}

const TECLA_A_OPCION: Record<string, 0 | 1 | 2 | 3> = { a: 0, b: 1, c: 2, d: 3 };

export function useKeyboardShortcuts(atajos: AtajosTeclado, activo = true) {
  useEffect(() => {
    if (!activo) return;

    function onKeyDown(e: KeyboardEvent) {
      const objetivo = e.target as HTMLElement | null;
      if (objetivo && ['INPUT', 'TEXTAREA', 'SELECT'].includes(objetivo.tagName)) return;

      const tecla = e.key.toLowerCase();

      if (tecla in TECLA_A_OPCION) {
        atajos.onSeleccionarOpcion?.(TECLA_A_OPCION[tecla]);
        return;
      }
      switch (e.key) {
        case ' ':
          e.preventDefault();
          atajos.onIniciarPausar?.();
          break;
        case 'Enter':
          atajos.onConfirmar?.();
          break;
        case 'n':
        case 'N':
          atajos.onSiguiente?.();
          break;
        case 'r':
        case 'R':
          atajos.onReiniciarTiempo?.();
          break;
        case 'f':
        case 'F':
          atajos.onPantallaCompleta?.();
          break;
        case 'Escape':
          atajos.onEscape?.();
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [atajos, activo]);
}
