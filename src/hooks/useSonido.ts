import { useCallback, useMemo } from 'react';
import { useGame } from '../store/GameContext';
import * as sonidos from '../audio/sounds';
import { hablar as hablarBase } from '../audio/speech';

export function useSonido() {
  const { state } = useGame();
  const activo = state.configuracion.sonidoActivado;
  const vozActiva = state.configuracion.vozActivada;

  return useMemo(
    () => ({
      inicioReloj: () => sonidos.sonidoInicioReloj(activo),
      tic: () => sonidos.sonidoTic(activo),
      correcta: () => sonidos.sonidoCorrecta(activo),
      incorrecta: () => sonidos.sonidoIncorrecta(activo),
      avanceEscalon: () => sonidos.sonidoAvanceEscalon(activo),
      ganador: () => sonidos.sonidoGanador(activo),
      comodin: () => sonidos.sonidoComodin(activo),
      hablar: (texto: string) => hablarBase(texto, vozActiva),
    }),
    [activo, vozActiva]
  );
}

export function usePrefiereMovimientoReducido(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
}

export function useSetVolumen() {
  return useCallback((v: number) => sonidos.setVolumen(v), []);
}
