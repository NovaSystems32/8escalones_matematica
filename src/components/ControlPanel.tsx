import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { useQuestionBank } from '../store/QuestionBankContext';
import { useSonido } from '../hooks/useSonido';
import { useFullscreen } from '../hooks/useFullscreen';
import { useCountdownDriver } from '../hooks/useCountdownDriver';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { elegirPregunta, proximoEscalon } from '../game/engine';
import { categoriaDeEscalon } from '../data/categories';
import { QuestionCard } from './QuestionCard';
import { CountdownTimer } from './CountdownTimer';
import { PlayerProgress } from './PlayerProgress';
import { PowerUps } from './PowerUps';
import { Staircase } from './Staircase';
import { TieBreaker } from './TieBreaker';
import { WinnerScreen } from './WinnerScreen';
import { GameResults } from './GameResults';
import { QuestionManager } from './QuestionManager';
import { ParticipantEditor } from './ParticipantEditor';
import { SoundController } from './SoundController';
import { FullscreenButton } from './FullscreenButton';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

interface Props {
  incrustado?: boolean;
}

export function ControlPanel({ incrustado = false }: Props) {
  const { state, dispatch } = useGame();
  const { banco } = useQuestionBank();
  const sonido = useSonido();
  const { alternar: alternarFullscreen } = useFullscreen();
  const navigate = useNavigate();

  const [mostrarBanco, setMostrarBanco] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mostrarReiniciarConfirm, setMostrarReiniciarConfirm] = useState(false);
  const [mostrarEditorParticipantes, setMostrarEditorParticipantes] = useState(false);
  const [correccionParticipanteId, setCorreccionParticipanteId] = useState<string>('');
  const [correccionEscalon, setCorreccionEscalon] = useState(0);
  const [avisoSinPreguntas, setAvisoSinPreguntas] = useState<string | null>(null);

  useCountdownDriver();

  const participanteActivo = useMemo(
    () => state.participantes.find((p) => p.id === state.participanteActivoId) ?? null,
    [state.participantes, state.participanteActivoId]
  );
  const escalonObjetivo = participanteActivo ? proximoEscalon(participanteActivo) : null;
  const categoriaObjetivo = escalonObjetivo ? categoriaDeEscalon(escalonObjetivo) : null;

  function manejarMostrarPregunta() {
    if (!participanteActivo || escalonObjetivo === null) return;
    const usadas = state.preguntasUsadasPorCategoria[escalonObjetivo] ?? [];
    const pregunta = elegirPregunta(banco, escalonObjetivo, usadas);
    if (!pregunta) {
      setAvisoSinPreguntas(`No hay preguntas activas en el banco para el escalón ${escalonObjetivo}.`);
      return;
    }
    setAvisoSinPreguntas(null);
    dispatch({ type: 'MOSTRAR_PREGUNTA', pregunta });
    sonido.inicioReloj();
  }

  function manejarConfirmar() {
    if (!state.preguntaActual || state.respuestaConfirmada) return;
    const tiempoUtilizado = Math.max(
      0,
      state.temporizador.segundosTotales - state.temporizador.segundosRestantes
    );
    dispatch({ type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: tiempoUtilizado });
  }

  function manejarCambioPreguntaComodin() {
    if (!state.preguntaActual || escalonObjetivo === null) return;
    const usadas = state.preguntasUsadasPorCategoria[escalonObjetivo] ?? [];
    const nueva = elegirPregunta(banco, escalonObjetivo, usadas, state.preguntaActual.id);
    if (!nueva) return;
    dispatch({ type: 'APLICAR_COMODIN_CAMBIO_PREGUNTA', nuevaPregunta: nueva });
    sonido.comodin();
  }

  function manejarMostrarPreguntaDesempate() {
    const usadas = state.preguntasUsadasPorCategoria[8] ?? [];
    const excluir = state.preguntaActual?.id;
    const pregunta = elegirPregunta(banco, 8, usadas, excluir);
    if (!pregunta) return;
    dispatch({ type: 'MOSTRAR_PREGUNTA_DESEMPATE', pregunta });
  }

  useKeyboardShortcuts(
    {
      onSeleccionarOpcion: (i) => {
        if (state.fase === 'jugando' && state.preguntaActual && !state.respuestaConfirmada) {
          dispatch({ type: 'SELECCIONAR_RESPUESTA', opcion: i });
        }
      },
      onIniciarPausar: () => {
        if (!state.preguntaActual || state.respuestaConfirmada) return;
        if (state.temporizador.corriendo) {
          dispatch({ type: 'PAUSAR_TIEMPO' });
        } else {
          dispatch({ type: 'INICIAR_TIEMPO' });
          sonido.inicioReloj();
        }
      },
      onConfirmar: manejarConfirmar,
      onSiguiente: () => {
        if (state.respuestaConfirmada) dispatch({ type: 'SIGUIENTE_PARTICIPANTE' });
      },
      onReiniciarTiempo: () => dispatch({ type: 'REINICIAR_TIEMPO' }),
      onPantallaCompleta: alternarFullscreen,
      onEscape: () => {
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      },
    },
    state.fase === 'jugando'
  );

  if (state.fase === 'configuracion') {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-xl font-bold mb-4">Todavía no hay una partida en curso.</p>
          <Link to="/" className="boton-show boton-primario">
            Ir a la configuración inicial
          </Link>
        </div>
      </div>
    );
  }

  if (state.fase === 'ganador') {
    return (
      <div className="relative z-10">
        {mostrarResultados ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <GameResults onCerrar={() => setMostrarResultados(false)} />
          </div>
        ) : (
          <WinnerScreen onRevisarResultados={() => setMostrarResultados(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="titulo-show text-xl sm:text-2xl">
          Panel de control · LOS <span className="numero-8">8</span> ESCALONES
        </h1>
        <div className="flex flex-wrap gap-2 items-center">
          <SoundController compacto />
          <FullscreenButton />
          <KeyboardShortcutsHelp />
          {!incrustado && (
            <a href="/presentacion" target="_blank" rel="noreferrer" className="boton-show text-sm">
              📺 Abrir presentación
            </a>
          )}
          <button type="button" className="boton-show text-sm" onClick={() => setMostrarBanco(true)}>
            📚 Banco de preguntas
          </button>
          <button type="button" className="boton-show text-sm" onClick={() => setMostrarResultados(true)}>
            📊 Resultados
          </button>
          <button type="button" className="boton-show text-sm" onClick={() => setMostrarEditorParticipantes((v) => !v)}>
            ✏ Editar participantes
          </button>
          <button type="button" className="boton-show text-sm" onClick={() => setMostrarReiniciarConfirm(true)}>
            ↺ Reiniciar partida
          </button>
        </div>
      </header>

      {mostrarReiniciarConfirm && (
        <div className="panel-vidrio rounded-xl p-4 border border-red-400/40">
          <p className="mb-3 font-bold">¿Reiniciar la partida? Todos los participantes volverán a la salida.</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="boton-show boton-primario text-sm"
              onClick={() => {
                dispatch({ type: 'REINICIAR_PARTIDA' });
                setMostrarReiniciarConfirm(false);
              }}
            >
              Sí, reiniciar
            </button>
            <button type="button" className="boton-show text-sm" onClick={() => setMostrarReiniciarConfirm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mostrarEditorParticipantes && (
        <div className="panel-vidrio rounded-xl p-4">
          <h2 className="font-black mb-3">Editar nombres y colores</h2>
          <ParticipantEditor
            participantes={state.participantes}
            onCambiar={(indice, cambios) => {
              const participante = state.participantes[indice];
              if (!participante) return;
              dispatch({ type: 'ACTUALIZAR_PARTICIPANTE', participanteId: participante.id, ...cambios });
            }}
          />
        </div>
      )}

      {state.fase === 'desempate' ? (
        <TieBreaker
          finalistas={state.participantes.filter((p) => state.desempate.finalistas.includes(p.id))}
          pregunta={state.preguntaActual}
          ronda={state.desempate.ronda}
          modo="control"
          onMostrarPregunta={manejarMostrarPreguntaDesempate}
          onElegirGanador={(id) => dispatch({ type: 'RESOLVER_DESEMPATE', ganadorId: id })}
          onSeguimosEmpatados={() => dispatch({ type: 'RESOLVER_DESEMPATE', ganadorId: null })}
        />
      ) : (
        <>
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--texto-suave)] mb-2">
              1. Elegir participante
            </h2>
            <PlayerProgress
              participantes={state.participantes}
              participanteActivoId={state.participanteActivoId}
              seleccionable
              onSeleccionar={(id) => dispatch({ type: 'SELECCIONAR_PARTICIPANTE', participanteId: id })}
            />
          </section>

          {participanteActivo && (
            <section className="panel-vidrio rounded-2xl p-4 sm:p-6">
              <p className="mb-3 font-bold">
                Participante actual: <span style={{ color: participanteActivo.color }}>{participanteActivo.nombre}</span> ·
                Intentando alcanzar el escalón: <strong>{escalonObjetivo}</strong> · Categoría:{' '}
                <span style={{ color: categoriaObjetivo?.color }}>{categoriaObjetivo?.nombre}</span>
              </p>

              {!state.preguntaActual ? (
                <div>
                  <button type="button" className="boton-show boton-primario" onClick={manejarMostrarPregunta}>
                    2. Mostrar siguiente pregunta
                  </button>
                  {avisoSinPreguntas && <p className="text-red-300 font-bold mt-2">{avisoSinPreguntas}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
                  <div>
                    <QuestionCard
                      pregunta={state.preguntaActual}
                      opcionesOcultas={state.opcionesOcultas}
                      respuestaSeleccionada={state.respuestaSeleccionada}
                      respuestaConfirmada={state.respuestaConfirmada}
                      bloqueada={
                        state.respuestaConfirmada ||
                        (state.temporizador.terminado && !state.temporizador.excepcionManual)
                      }
                      interactiva={!state.respuestaConfirmada}
                      onSeleccionar={(i) => dispatch({ type: 'SELECCIONAR_RESPUESTA', opcion: i })}
                    />

                    {state.respuestaConfirmada && (
                      <div
                        className={`mt-4 rounded-xl px-4 py-3 font-black text-lg text-center ${
                          state.resultadoUltimo === 'correcta' ? 'bg-green-600/80' : 'bg-red-600/80'
                        }`}
                      >
                        {state.resultadoUltimo === 'correcta' ? '✔ RESPUESTA CORRECTA' : '✘ RESPUESTA INCORRECTA'}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        type="button"
                        className="boton-show text-sm"
                        disabled={!state.preguntaActual || state.respuestaConfirmada || state.temporizador.corriendo}
                        onClick={() => {
                          dispatch({ type: 'INICIAR_TIEMPO' });
                          sonido.inicioReloj();
                        }}
                      >
                        ▶ Iniciar tiempo
                      </button>
                      <button
                        type="button"
                        className="boton-show text-sm"
                        disabled={!state.temporizador.corriendo}
                        onClick={() => dispatch({ type: 'PAUSAR_TIEMPO' })}
                      >
                        ⏸ Pausar
                      </button>
                      <button
                        type="button"
                        className="boton-show text-sm"
                        onClick={() => dispatch({ type: 'REINICIAR_TIEMPO' })}
                      >
                        ⟲ Reiniciar tiempo
                      </button>
                      <button
                        type="button"
                        className="boton-show text-sm"
                        aria-pressed={state.temporizador.excepcionManual}
                        onClick={() => dispatch({ type: 'TOGGLE_EXCEPCION_MANUAL' })}
                      >
                        {state.temporizador.excepcionManual ? '🔓 Excepción manual activa' : '🔒 Habilitar excepción manual'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        type="button"
                        className="boton-show boton-dorado"
                        disabled={!state.preguntaActual || state.respuestaConfirmada}
                        onClick={manejarConfirmar}
                      >
                        3. Confirmar respuesta
                      </button>
                      <button
                        type="button"
                        className="boton-show boton-primario"
                        disabled={!state.respuestaConfirmada}
                        onClick={() => dispatch({ type: 'SIGUIENTE_PARTICIPANTE' })}
                      >
                        4. Siguiente participante ➜
                      </button>
                      <button
                        type="button"
                        className="boton-show text-sm"
                        disabled={state.respuestaConfirmada}
                        onClick={manejarMostrarPregunta}
                      >
                        🔄 Cambiar pregunta (sin comodín)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <CountdownTimer
                      segundosRestantes={state.temporizador.segundosRestantes}
                      segundosTotales={state.temporizador.segundosTotales}
                      terminado={state.temporizador.terminado}
                      tamano={160}
                    />
                    <PowerUps
                      participante={participanteActivo}
                      puedeUsar={!state.respuestaConfirmada}
                      onCincuentaYCincuenta={() => {
                        dispatch({ type: 'APLICAR_COMODIN_5050' });
                        sonido.comodin();
                      }}
                      onCambioPregunta={manejarCambioPreguntaComodin}
                      onTiempoExtra={() => {
                        dispatch({ type: 'APLICAR_COMODIN_TIEMPO_EXTRA' });
                        sonido.comodin();
                      }}
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="panel-vidrio rounded-2xl p-4 sm:p-6">
            <h2 className="font-black mb-3">Progreso general</h2>
            <Staircase participantes={state.participantes} participanteActivoId={state.participanteActivoId} compacta />
          </section>

          <section className="panel-vidrio rounded-2xl p-4 sm:p-6">
            <h2 className="font-black mb-3">Corrección manual de posición</h2>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Participante
                <select
                  value={correccionParticipanteId}
                  onChange={(e) => {
                    setCorreccionParticipanteId(e.target.value);
                    const p = state.participantes.find((pp) => pp.id === e.target.value);
                    setCorreccionEscalon(p?.escalonActual ?? 0);
                  }}
                  className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                >
                  <option value="">Seleccionar…</option>
                  {state.participantes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Nuevo escalón (0 a 8)
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={correccionEscalon}
                  onChange={(e) => setCorreccionEscalon(Number(e.target.value))}
                  className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white w-24"
                />
              </label>
              <button
                type="button"
                className="boton-show text-sm"
                disabled={!correccionParticipanteId}
                onClick={() =>
                  dispatch({
                    type: 'CORREGIR_ESCALON',
                    participanteId: correccionParticipanteId,
                    nuevoEscalon: correccionEscalon,
                  })
                }
              >
                Aplicar corrección
              </button>
            </div>
          </section>
        </>
      )}

      <footer className="flex justify-center pt-2">
        <button
          type="button"
          className="boton-show text-sm"
          onClick={() => {
            dispatch({ type: 'NUEVA_PARTIDA' });
            navigate('/');
          }}
        >
          🏠 Terminar y volver al inicio
        </button>
      </footer>

      {mostrarBanco && <QuestionManager onCerrar={() => setMostrarBanco(false)} />}
      {mostrarResultados && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <GameResults onCerrar={() => setMostrarResultados(false)} />
        </div>
      )}
    </div>
  );
}
