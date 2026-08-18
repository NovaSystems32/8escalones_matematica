import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { useSetVolumen } from '../hooks/useSonido';

export function SoundController({ compacto = false }: { compacto?: boolean }) {
  const { state, dispatch } = useGame();
  const setVolumen = useSetVolumen();
  const [volumen, setVolumenLocal] = useState(50);

  const { sonidoActivado, vozActivada, animacionesReducidas } = state.configuracion;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compacto ? '' : 'panel-vidrio rounded-xl p-3'}`}>
      <button
        type="button"
        onClick={() => dispatch({ type: 'ACTUALIZAR_CONFIG', cambios: { sonidoActivado: !sonidoActivado } })}
        className="boton-show text-sm"
        aria-pressed={sonidoActivado}
      >
        {sonidoActivado ? '🔊 Sonido activado' : '🔇 Sonido silenciado'}
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'ACTUALIZAR_CONFIG', cambios: { vozActivada: !vozActivada } })}
        className="boton-show text-sm"
        aria-pressed={vozActivada}
      >
        {vozActivada ? '🗣 Voz activada' : '🚫 Voz desactivada'}
      </button>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: 'ACTUALIZAR_CONFIG', cambios: { animacionesReducidas: !animacionesReducidas } })
        }
        className="boton-show text-sm"
        aria-pressed={animacionesReducidas}
      >
        {animacionesReducidas ? '🎬 Animaciones reducidas' : '✨ Animaciones completas'}
      </button>
      <label className="flex items-center gap-2 text-sm">
        <span>Volumen</span>
        <input
          type="range"
          min={0}
          max={100}
          value={volumen}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolumenLocal(v);
            setVolumen(v / 100);
          }}
          aria-label="Volumen de los sonidos"
        />
      </label>
    </div>
  );
}
