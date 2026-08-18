import type { Participante } from '../types';
import { comodinTipoLabel } from '../game/gameReducer';

interface Props {
  participantes: Participante[];
  participanteActivoId: string | null;
  onSeleccionar?: (id: string) => void;
  seleccionable?: boolean;
}

export function PlayerProgress({ participantes, participanteActivoId, onSeleccionar, seleccionable = false }: Props) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3" aria-label="Progreso de los participantes">
      {participantes.map((p) => {
        const activo = p.id === participanteActivoId;
        const Tag = seleccionable ? 'button' : 'div';
        return (
          <li key={p.id} className="list-none">
            <Tag
              type={seleccionable ? 'button' : undefined}
              onClick={seleccionable ? () => onSeleccionar?.(p.id) : undefined}
              className={`w-full text-left panel-vidrio rounded-xl p-3 flex items-center gap-3 ${
                activo ? 'ring-2 ring-[var(--dorado)]' : ''
              } ${seleccionable ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
              style={{ borderLeft: `6px solid ${p.color}` }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black flex-none"
                style={{ background: p.color, color: '#1a1030' }}
              >
                {p.escalonActual}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate texto-alto-contraste">{p.nombre}</p>
                <p className="text-xs text-[var(--texto-suave)]">
                  {p.escalonActual >= 8 ? '¡Llegó a la meta!' : `Escalón ${p.escalonActual} de 8`}
                </p>
              </div>
              <div className="text-right flex-none">
                {p.comodin.usado ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/10 text-white/70">
                    {comodinTipoLabel(p.comodin.usado)} usado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                    Comodín disponible
                  </span>
                )}
              </div>
            </Tag>
          </li>
        );
      })}
    </ul>
  );
}
