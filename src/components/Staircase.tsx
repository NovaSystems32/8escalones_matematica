import type { Participante } from '../types';
import { categoriaDeEscalon } from '../data/categories';

interface Props {
  participantes: Participante[];
  participanteActivoId: string | null;
  compacta?: boolean;
}

const ESCALONES = [1, 2, 3, 4, 5, 6, 7, 8];

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Staircase({ participantes, participanteActivoId, compacta = false }: Props) {
  const alturaBase = compacta ? 14 : 22;
  const alturaPaso = compacta ? 7 : 12;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-1 sm:gap-2 min-w-[640px] px-2" aria-label="Escalera de los 8 escalones">
        {/* Salida */}
        <div className="flex flex-col items-center justify-end flex-1" style={{ height: alturaBase }}>
          <div className="relative w-full h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-white/70">Salida</span>
          </div>
          <AvatarsEnEscalon
            participantes={participantes.filter((p) => p.escalonActual === 0)}
            participanteActivoId={participanteActivoId}
            compacta={compacta}
          />
        </div>

        {ESCALONES.map((n) => {
          const categoria = categoriaDeEscalon(n);
          const enEsteEscalon = participantes.filter((p) => p.escalonActual === n);
          return (
            <div
              key={n}
              className="flex flex-col items-center justify-end flex-1"
              style={{ height: alturaBase + n * alturaPaso }}
            >
              <div
                className="escalon-madera relative w-full rounded-t-md flex flex-col items-center justify-start pt-1"
                style={{ height: alturaBase + n * alturaPaso }}
              >
                <span className="font-black text-white text-sm sm:text-lg texto-alto-contraste">{n}</span>
                <span
                  className="hidden sm:block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                  style={{ background: categoria.colorSuave, color: categoria.color }}
                >
                  {categoria.nombre}
                </span>
              </div>
              <AvatarsEnEscalon
                participantes={enEsteEscalon}
                participanteActivoId={participanteActivoId}
                compacta={compacta}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvatarsEnEscalon({
  participantes,
  participanteActivoId,
  compacta,
}: {
  participantes: Participante[];
  participanteActivoId: string | null;
  compacta: boolean;
}) {
  if (participantes.length === 0) return <div className="h-0" />;
  const tam = compacta ? 'w-6 h-6 text-[9px]' : 'w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm';
  return (
    <div className="flex -mb-2 sm:-mb-3 z-10 flex-wrap justify-center gap-0.5 py-1">
      {participantes.map((p) => (
        <div
          key={p.id}
          title={p.nombre}
          className={`animar-subida ${tam} rounded-full flex items-center justify-center font-black border-2 shadow-lg ${
            p.id === participanteActivoId ? 'pulso-suave' : ''
          }`}
          style={{
            background: p.color,
            borderColor: p.id === participanteActivoId ? '#ffe066' : 'rgba(255,255,255,0.6)',
            color: '#1a1030',
          }}
        >
          {iniciales(p.nombre)}
        </div>
      ))}
    </div>
  );
}
