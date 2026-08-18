import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { useState } from 'react';
import { GameResults } from './GameResults';

export function ResumeGameDialog({ onCerrar }: { onCerrar: () => void }) {
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const [verResumen, setVerResumen] = useState(false);

  if (verResumen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
        <GameResults onCerrar={() => setVerResumen(false)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="panel-vidrio rounded-2xl p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-black mb-3 titulo-show">Partida sin terminar</h2>
        <p className="mb-5 text-[var(--texto-suave)]">
          Encontramos una partida sin terminar. ¿Querés continuarla?
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="boton-show boton-dorado"
            onClick={() => {
              onCerrar();
              navigate('/control');
            }}
          >
            ▶ Continuar partida
          </button>
          <button type="button" className="boton-show" onClick={() => setVerResumen(true)}>
            📊 Ver resumen
          </button>
          <button
            type="button"
            className="boton-show boton-primario"
            onClick={() => {
              dispatch({ type: 'NUEVA_PARTIDA' });
              onCerrar();
            }}
          >
            🆕 Comenzar una nueva partida
          </button>
        </div>
      </div>
    </div>
  );
}
