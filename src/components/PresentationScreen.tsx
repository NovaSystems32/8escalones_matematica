import { useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { useSonido } from '../hooks/useSonido';
import { Staircase } from './Staircase';
import { QuestionCard } from './QuestionCard';
import { CountdownTimer } from './CountdownTimer';
import { PlayerProgress } from './PlayerProgress';
import { WinnerScreen } from './WinnerScreen';
import { TieBreaker } from './TieBreaker';
import { FullscreenButton } from './FullscreenButton';
import { categoriaDeEscalon } from '../data/categories';

export function PresentationScreen() {
  const { state } = useGame();
  const sonido = useSonido();
  const resultadoAnteriorRef = useRef<typeof state.resultadoUltimo>(null);

  useEffect(() => {
    if (state.resultadoUltimo && state.resultadoUltimo !== resultadoAnteriorRef.current) {
      if (state.resultadoUltimo === 'correcta') {
        sonido.correcta();
        sonido.hablar('Respuesta correcta');
        window.setTimeout(() => sonido.avanceEscalon(), 500);
      } else {
        sonido.incorrecta();
        sonido.hablar('Respuesta incorrecta');
      }
    }
    resultadoAnteriorRef.current = state.resultadoUltimo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resultadoUltimo]);

  if (state.fase === 'ganador') {
    return <WinnerScreen />;
  }

  const participanteActivo = state.participantes.find((p) => p.id === state.participanteActivoId) ?? null;
  const escalonObjetivo = participanteActivo ? Math.min(8, participanteActivo.escalonActual + 1) : null;
  const categoria = escalonObjetivo ? categoriaDeEscalon(escalonObjetivo) : null;

  return (
    <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-8 py-4 sm:py-6 gap-4 sm:gap-6">
      <FullscreenButton className="absolute top-3 right-3 z-20 opacity-40 hover:opacity-100 !py-2 !px-3 text-xs" />

      <header className="text-center">
        <h1 className="titulo-show text-2xl sm:text-4xl">
          LOS <span className="numero-8">8</span> ESCALONES DE LA MATEMÁTICA
        </h1>
      </header>

      {state.fase === 'desempate' ? (
        <div className="flex-1 flex items-center justify-center">
          <TieBreaker
            finalistas={state.participantes.filter((p) => state.desempate.finalistas.includes(p.id))}
            pregunta={state.preguntaActual}
            ronda={state.desempate.ronda}
            modo="presentacion"
          />
        </div>
      ) : state.fase !== 'jugando' ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl sm:text-2xl text-[var(--texto-suave)] font-bold">
            Preparando la partida… configurá los participantes desde el panel de control.
          </p>
        </div>
      ) : (
        <>
          {participanteActivo && (
            <div className="text-center panel-vidrio rounded-2xl py-3 px-4 mx-auto">
              <p className="text-sm sm:text-base text-[var(--texto-suave)]">
                Participante actual: <strong style={{ color: participanteActivo.color }}>{participanteActivo.nombre}</strong>
                {' · '}
                Intentando alcanzar el escalón: <strong>{escalonObjetivo}</strong>
                {categoria && (
                  <>
                    {' · '}
                    Categoría: <strong style={{ color: categoria.color }}>{categoria.nombre}</strong>
                  </>
                )}
              </p>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
            <div className="panel-vidrio rounded-2xl p-4 sm:p-8 flex items-center justify-center min-h-[280px]">
              {state.preguntaActual ? (
                <QuestionCard
                  pregunta={state.preguntaActual}
                  opcionesOcultas={state.opcionesOcultas}
                  respuestaSeleccionada={state.respuestaSeleccionada}
                  respuestaConfirmada={state.respuestaConfirmada}
                  bloqueada
                  interactiva={false}
                />
              ) : (
                <p className="text-xl sm:text-2xl text-[var(--texto-suave)] font-bold text-center">
                  Esperando la próxima pregunta…
                </p>
              )}
            </div>
            <div className="flex flex-col items-center gap-3">
              <CountdownTimer
                segundosRestantes={state.temporizador.segundosRestantes}
                segundosTotales={state.temporizador.segundosTotales}
                terminado={state.temporizador.terminado}
              />
              {state.respuestaConfirmada && state.resultadoUltimo && (
                <div
                  className={`destello-resultado rounded-xl px-4 py-2 font-black text-lg sm:text-xl text-center ${
                    state.resultadoUltimo === 'correcta' ? 'bg-green-600/80' : 'bg-red-600/80'
                  }`}
                  role="status"
                >
                  {state.resultadoUltimo === 'correcta' ? '✔ RESPUESTA CORRECTA' : '✘ RESPUESTA INCORRECTA'}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <section className="mt-auto">
        <h2 className="text-center font-black text-[var(--texto-suave)] mb-2 text-sm uppercase tracking-widest">
          Progreso de los participantes
        </h2>
        <Staircase participantes={state.participantes} participanteActivoId={state.participanteActivoId} />
        <div className="mt-3">
          <PlayerProgress participantes={state.participantes} participanteActivoId={state.participanteActivoId} />
        </div>
      </section>
    </div>
  );
}
