import { PARTICIPANT_COLORS } from '../data/categories';

export interface ParticipanteEditable {
  id?: string;
  nombre: string;
  color: string;
}

interface Props {
  participantes: ParticipanteEditable[];
  onCambiar: (indice: number, cambios: Partial<ParticipanteEditable>) => void;
}

export function ParticipantEditor({ participantes, onCambiar }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {participantes.map((p, i) => (
        <div key={p.id ?? i} className="panel-vidrio rounded-xl p-4 flex flex-col gap-2">
          <label className="text-sm font-bold text-[var(--texto-suave)]" htmlFor={`participante-${i}`}>
            Participante {i + 1}
          </label>
          <input
            id={`participante-${i}`}
            type="text"
            value={p.nombre}
            maxLength={30}
            onChange={(e) => onCambiar(i, { nombre: e.target.value })}
            className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white font-semibold focus:outline-none"
            placeholder={`Nombre del participante ${i + 1}`}
          />
          <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label={`Color de ${p.nombre || 'participante'}`}>
            {PARTICIPANT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={p.color === color}
                title={color}
                onClick={() => onCambiar(i, { color })}
                className="w-8 h-8 rounded-full border-2"
                style={{
                  background: color,
                  borderColor: p.color === color ? '#ffffff' : 'transparent',
                  boxShadow: p.color === color ? '0 0 0 2px var(--dorado)' : 'none',
                }}
              />
            ))}
            <input
              type="color"
              value={p.color}
              onChange={(e) => onCambiar(i, { color: e.target.value })}
              className="w-8 h-8 rounded-full border-2 border-white/30 bg-transparent cursor-pointer"
              aria-label={`Color personalizado para ${p.nombre || 'participante ' + (i + 1)}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
