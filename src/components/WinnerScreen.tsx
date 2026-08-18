import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { useSonido } from '../hooks/useSonido';

const COLORES_CONFETI = ['#ffc94a', '#ff2d95', '#a855f7', '#38bdf8', '#22c55e', '#ff8a3d'];

function generarConfeti(cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: i,
    izquierda: Math.random() * 100,
    color: COLORES_CONFETI[i % COLORES_CONFETI.length],
    duracion: 3 + Math.random() * 3,
    retraso: Math.random() * 3,
    giro: Math.random() > 0.5 ? '20%' : '50%',
  }));
}

interface Props {
  onRevisarResultados?: () => void;
}

export function WinnerScreen({ onRevisarResultados }: Props) {
  const { state, dispatch } = useGame();
  const sonido = useSonido();
  const navigate = useNavigate();
  const confeti = useMemo(() => generarConfeti(60), []);
  const yaSono = useRef(false);

  const ganador = state.participantes.find((p) => p.id === state.ganadorId);

  useEffect(() => {
    if (!yaSono.current && ganador) {
      yaSono.current = true;
      sonido.ganador();
      sonido.hablar(`¡Felicitaciones ${ganador.nombre}! Sos el campeón de los 8 escalones de la matemática.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganador?.id]);

  if (!ganador) return null;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-10 text-center">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {confeti.map((c) => (
          <span
            key={c.id}
            className="pieza-confeti"
            style={{
              left: `${c.izquierda}%`,
              background: c.color,
              animationDuration: `${c.duracion}s`,
              animationDelay: `${c.retraso}s`,
              borderRadius: c.giro,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255,201,74,0.35), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
        <div
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-5xl sm:text-6xl font-black pulso-suave"
          style={{ background: ganador.color, color: '#1a1030', boxShadow: '0 0 60px rgba(255,201,74,0.6)' }}
        >
          8
        </div>
        <p className="text-lg sm:text-2xl font-bold text-[var(--dorado)] tracking-widest uppercase texto-alto-contraste">
          Campeón/a de
        </p>
        <h1 className="titulo-show text-3xl sm:text-6xl">
          LOS <span className="numero-8">8</span> ESCALONES
          <br />
          DE LA MATEMÁTICA
        </h1>
        <p className="text-3xl sm:text-5xl font-black texto-alto-contraste" style={{ color: ganador.color }}>
          {ganador.nombre}
        </p>

        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <button type="button" className="boton-show boton-dorado" onClick={onRevisarResultados}>
            📊 Revisar resultados
          </button>
          <button
            type="button"
            className="boton-show boton-primario"
            onClick={() => dispatch({ type: 'REINICIAR_PARTIDA' })}
          >
            🔁 Nueva partida (mismos participantes)
          </button>
          <button
            type="button"
            className="boton-show"
            onClick={() => {
              dispatch({ type: 'NUEVA_PARTIDA' });
              navigate('/');
            }}
          >
            🏠 Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
