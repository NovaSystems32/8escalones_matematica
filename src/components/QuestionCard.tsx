import type { Question } from '../types';
import { AnswerOption } from './AnswerOption';
import { categoriaDeEscalon } from '../data/categories';

interface Props {
  pregunta: Question;
  opcionesOcultas: number[];
  respuestaSeleccionada: number | null;
  respuestaConfirmada: boolean;
  bloqueada: boolean;
  interactiva: boolean;
  onSeleccionar?: (indice: 0 | 1 | 2 | 3) => void;
}

export function QuestionCard({
  pregunta,
  opcionesOcultas,
  respuestaSeleccionada,
  respuestaConfirmada,
  bloqueada,
  interactiva,
  onSeleccionar,
}: Props) {
  const categoria = categoriaDeEscalon(pregunta.escalon);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span
          className="px-4 py-1.5 rounded-full font-extrabold text-sm sm:text-base texto-alto-contraste"
          style={{ background: categoria.colorSuave, color: categoria.color, border: `2px solid ${categoria.color}` }}
        >
          Escalón {pregunta.escalon} · {categoria.nombre}
        </span>
      </div>
      <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-6 texto-alto-contraste">{pregunta.enunciado}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {pregunta.opciones.map((texto, i) => {
          const indice = i as 0 | 1 | 2 | 3;
          return (
            <AnswerOption
              key={i}
              indice={indice}
              texto={texto}
              seleccionada={respuestaSeleccionada === indice}
              oculta={opcionesOcultas.includes(indice)}
              revelar={respuestaConfirmada}
              esLaCorrecta={pregunta.respuestaCorrecta === indice}
              bloqueada={bloqueada}
              interactiva={interactiva}
              onSeleccionar={onSeleccionar}
            />
          );
        })}
      </div>
    </div>
  );
}
