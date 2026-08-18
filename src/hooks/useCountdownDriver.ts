import { useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { useSonido } from './useSonido';

/**
 * Hace avanzar el temporizador un segundo por vez. Debe montarse SOLO en el panel
 * que actúa como operador (control) para evitar que dos ventanas descuenten el reloj dos veces.
 */
export function useCountdownDriver() {
  const { state, dispatch } = useGame();
  const sonido = useSonido();
  const { corriendo, segundosRestantes } = state.temporizador;
  const previoRef = useRef(segundosRestantes);

  useEffect(() => {
    if (!corriendo) return;
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => window.clearInterval(id);
  }, [corriendo, dispatch]);

  useEffect(() => {
    if (segundosRestantes < previoRef.current && segundosRestantes <= 5 && segundosRestantes > 0) {
      sonido.tic();
    }
    previoRef.current = segundosRestantes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundosRestantes]);
}
