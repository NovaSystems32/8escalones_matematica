import type { Participante, Question } from '../types';
import { QuestionCard } from './QuestionCard';

interface Props {
  finalistas: Participante[];
  pregunta: Question | null;
  ronda: number;
  modo: 'presentacion' | 'control';
  onMostrarPregunta?: () => void;
  onElegirGanador?: (id: string) => void;
  onSeguimosEmpatados?: () => void;
}

export function TieBreaker({ finalistas, pregunta, ronda, modo, onMostrarPregunta, onElegirGanador, onSeguimosEmpatados }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 items-center text-center">
      <div>
        <p className="text-[var(--dorado)] font-black tracking-widest uppercase texto-alto-contraste">¡Desempate!</p>
        <h2 className="titulo-show text-2xl sm:text-4xl">Ronda de desempate {ronda > 0 ? ronda : ''}</h2>
        <div className="flex flex-wrap gap-3 justify-center mt-3">
          {finalistas.map((f) => (
            <span
              key={f.id}
              className="px-4 py-2 rounded-full font-bold texto-alto-contraste"
              style={{ background: `${f.color}33`, border: `2px solid ${f.color}`, color: f.color }}
            >
              {f.nombre}
            </span>
          ))}
        </div>
      </div>

      {pregunta ? (
        <div className="w-full panel-vidrio rounded-2xl p-4 sm:p-8">
          <QuestionCard
            pregunta={pregunta}
            opcionesOcultas={[]}
            respuestaSeleccionada={null}
            respuestaConfirmada={false}
            bloqueada
            interactiva={false}
          />
        </div>
      ) : modo === 'control' ? (
        <p className="text-[var(--texto-suave)]">Mostrá una nueva situación problemática para el desempate.</p>
      ) : null}

      {modo === 'control' && (
        <div className="flex flex-col gap-3 w-full panel-vidrio rounded-xl p-4">
          {!pregunta && (
            <button type="button" className="boton-show boton-primario" onClick={onMostrarPregunta}>
              Mostrar situación problemática de desempate
            </button>
          )}
          {pregunta && (
            <>
              <p className="text-sm text-[var(--texto-suave)]">
                Marcá quién respondió correctamente o quién respondió primero:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {finalistas.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="boton-show text-sm"
                    style={{ borderColor: f.color }}
                    onClick={() => onElegirGanador?.(f.id)}
                  >
                    {f.nombre} respondió bien
                  </button>
                ))}
              </div>
              <button type="button" className="boton-show text-sm" onClick={onSeguimosEmpatados}>
                Siguen empatados: nueva pregunta
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
