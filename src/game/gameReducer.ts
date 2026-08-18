import type {
  ComodinTipo,
  Configuracion,
  DesempateEstado,
  GameState,
  HistorialEntry,
  Participante,
  Question,
} from '../types';
import { crearId, crearParticipantes, evaluarRespuesta, calcularCampeones, opcionesIncorrectasParaOcultar } from './engine';

export const CONFIG_POR_DEFECTO: Configuracion = {
  institucion: '',
  docente: '',
  tiempoSegundos: 30,
  sonidoActivado: true,
  vozActivada: true,
  animacionesReducidas: false,
};

export function estadoInicial(): GameState {
  return {
    configuracion: CONFIG_POR_DEFECTO,
    participantes: [],
    ordenTurno: [],
    indiceTurnoActual: 0,
    vueltaActual: 1,
    vueltaObjetivoFinal: null,
    fase: 'configuracion',
    participanteActivoId: null,
    preguntaActual: null,
    opcionesOcultas: [],
    respuestaSeleccionada: null,
    respuestaConfirmada: false,
    resultadoUltimo: null,
    temporizador: {
      segundosRestantes: 30,
      segundosTotales: 30,
      corriendo: false,
      terminado: false,
      excepcionManual: false,
    },
    preguntasUsadasPorCategoria: {},
    historial: [],
    desempate: { activo: false, finalistas: [], preguntaId: null, ronda: 0, ganadorFinalId: null },
    ganadorId: null,
    creadoEn: Date.now(),
    actualizadoEn: Date.now(),
  };
}

export type GameAction =
  | { type: 'INICIAR_PARTIDA'; nombres: string[]; colores: string[]; config: Configuracion }
  | { type: 'SELECCIONAR_PARTICIPANTE'; participanteId: string }
  | { type: 'MOSTRAR_PREGUNTA'; pregunta: Question }
  | { type: 'INICIAR_TIEMPO' }
  | { type: 'PAUSAR_TIEMPO' }
  | { type: 'REINICIAR_TIEMPO' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_EXCEPCION_MANUAL' }
  | { type: 'SELECCIONAR_RESPUESTA'; opcion: number }
  | { type: 'CONFIRMAR_RESPUESTA'; tiempoUtilizadoSeg: number }
  | { type: 'APLICAR_COMODIN_5050' }
  | { type: 'APLICAR_COMODIN_CAMBIO_PREGUNTA'; nuevaPregunta: Question }
  | { type: 'APLICAR_COMODIN_TIEMPO_EXTRA' }
  | { type: 'SIGUIENTE_PARTICIPANTE' }
  | { type: 'CORREGIR_ESCALON'; participanteId: string; nuevoEscalon: number }
  | { type: 'ACTUALIZAR_CONFIG'; cambios: Partial<Configuracion> }
  | { type: 'ACTUALIZAR_PARTICIPANTE'; participanteId: string; nombre?: string; color?: string }
  | { type: 'MOSTRAR_PREGUNTA_DESEMPATE'; pregunta: Question }
  | { type: 'RESOLVER_DESEMPATE'; ganadorId: string | null }
  | { type: 'REINICIAR_PARTIDA' }
  | { type: 'NUEVA_PARTIDA' }
  | { type: 'HYDRATE'; state: GameState };

function tocar<T extends GameState>(estado: T): T {
  return { ...estado, actualizadoEn: Date.now() };
}

function actualizarParticipante(
  participantes: Participante[],
  id: string,
  cambios: Partial<Participante>
): Participante[] {
  return participantes.map((p) => (p.id === id ? { ...p, ...cambios } : p));
}

function registrarUsada(mapa: Record<number, string[]>, escalon: number, id: string): Record<number, string[]> {
  const previas = mapa[escalon] ?? [];
  if (previas.includes(id)) return mapa;
  return { ...mapa, [escalon]: [...previas, id] };
}

function finalizarSiCorresponde(state: GameState): GameState {
  const campeones = calcularCampeones(state.participantes);
  if (campeones.length === 1) {
    return { ...state, fase: 'ganador', ganadorId: campeones[0], participanteActivoId: null };
  }
  if (campeones.length >= 2) {
    const desempate: DesempateEstado = {
      activo: true,
      finalistas: campeones,
      preguntaId: null,
      ronda: 0,
      ganadorFinalId: null,
    };
    return { ...state, fase: 'desempate', desempate, participanteActivoId: null };
  }
  return state;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'INICIAR_PARTIDA': {
      const participantes = crearParticipantes(action.nombres, action.colores);
      const orden = participantes.map((p) => p.id);
      return tocar({
        ...estadoInicial(),
        configuracion: action.config,
        participantes,
        ordenTurno: orden,
        indiceTurnoActual: 0,
        participanteActivoId: orden[0] ?? null,
        fase: 'jugando',
        temporizador: {
          segundosRestantes: action.config.tiempoSegundos,
          segundosTotales: action.config.tiempoSegundos,
          corriendo: false,
          terminado: false,
          excepcionManual: false,
        },
      });
    }

    case 'SELECCIONAR_PARTICIPANTE': {
      if (state.fase !== 'jugando') return state;
      return tocar({
        ...state,
        participanteActivoId: action.participanteId,
        preguntaActual: null,
        opcionesOcultas: [],
        respuestaSeleccionada: null,
        respuestaConfirmada: false,
        resultadoUltimo: null,
        temporizador: {
          ...state.temporizador,
          segundosRestantes: state.configuracion.tiempoSegundos,
          segundosTotales: state.configuracion.tiempoSegundos,
          corriendo: false,
          terminado: false,
        },
      });
    }

    case 'MOSTRAR_PREGUNTA': {
      const usadas = registrarUsada(state.preguntasUsadasPorCategoria, action.pregunta.escalon, action.pregunta.id);
      return tocar({
        ...state,
        preguntaActual: action.pregunta,
        preguntasUsadasPorCategoria: usadas,
        opcionesOcultas: [],
        respuestaSeleccionada: null,
        respuestaConfirmada: false,
        resultadoUltimo: null,
        temporizador: {
          ...state.temporizador,
          segundosRestantes: state.configuracion.tiempoSegundos,
          segundosTotales: state.configuracion.tiempoSegundos,
          corriendo: false,
          terminado: false,
        },
      });
    }

    case 'INICIAR_TIEMPO': {
      if (!state.preguntaActual || state.respuestaConfirmada) return state;
      return tocar({ ...state, temporizador: { ...state.temporizador, corriendo: true, terminado: false } });
    }

    case 'PAUSAR_TIEMPO':
      return tocar({ ...state, temporizador: { ...state.temporizador, corriendo: false } });

    case 'REINICIAR_TIEMPO':
      return tocar({
        ...state,
        temporizador: {
          ...state.temporizador,
          segundosRestantes: state.configuracion.tiempoSegundos,
          segundosTotales: state.configuracion.tiempoSegundos,
          corriendo: false,
          terminado: false,
        },
      });

    case 'TICK': {
      if (!state.temporizador.corriendo) return state;
      const restante = state.temporizador.segundosRestantes - 1;
      if (restante <= 0) {
        return tocar({
          ...state,
          temporizador: { ...state.temporizador, segundosRestantes: 0, corriendo: false, terminado: true },
        });
      }
      return tocar({ ...state, temporizador: { ...state.temporizador, segundosRestantes: restante } });
    }

    case 'TOGGLE_EXCEPCION_MANUAL':
      return tocar({
        ...state,
        temporizador: { ...state.temporizador, excepcionManual: !state.temporizador.excepcionManual },
      });

    case 'SELECCIONAR_RESPUESTA': {
      if (state.respuestaConfirmada) return state;
      if (state.temporizador.terminado && !state.temporizador.excepcionManual) return state;
      return tocar({ ...state, respuestaSeleccionada: action.opcion });
    }

    case 'CONFIRMAR_RESPUESTA': {
      if (!state.preguntaActual || state.respuestaConfirmada || !state.participanteActivoId) return state;
      const pregunta = state.preguntaActual;
      const acierto = evaluarRespuesta(pregunta, state.respuestaSeleccionada);
      const participanteActivo = state.participantes.find((p) => p.id === state.participanteActivoId)!;

      const entry: HistorialEntry = {
        id: crearId('h'),
        participanteId: participanteActivo.id,
        participanteNombre: participanteActivo.nombre,
        preguntaId: pregunta.id,
        enunciado: pregunta.enunciado,
        categoria: pregunta.categoria,
        escalon: pregunta.escalon,
        opcionSeleccionada: state.respuestaSeleccionada,
        respuestaCorrecta: pregunta.respuestaCorrecta,
        acierto,
        tiempoUtilizadoSeg: action.tiempoUtilizadoSeg,
        comodinUsado: participanteActivo.comodin.usado,
        timestamp: Date.now(),
      };

      let participantes = state.participantes;
      let vueltaObjetivoFinal = state.vueltaObjetivoFinal;

      if (acierto) {
        const nuevoEscalon = Math.min(8, participanteActivo.escalonActual + 1);
        participantes = actualizarParticipante(participantes, participanteActivo.id, { escalonActual: nuevoEscalon });
        if (nuevoEscalon >= 8 && vueltaObjetivoFinal === null) {
          vueltaObjetivoFinal = state.vueltaActual;
          participantes = actualizarParticipante(participantes, participanteActivo.id, {
            llegoAlFinalEnVuelta: state.vueltaActual,
          });
        }
      }

      return tocar({
        ...state,
        participantes,
        vueltaObjetivoFinal,
        respuestaConfirmada: true,
        resultadoUltimo: acierto ? 'correcta' : 'incorrecta',
        temporizador: { ...state.temporizador, corriendo: false },
        historial: [...state.historial, entry],
      });
    }

    case 'APLICAR_COMODIN_5050': {
      if (!state.preguntaActual || !state.participanteActivoId || state.respuestaConfirmada) return state;
      const participante = state.participantes.find((p) => p.id === state.participanteActivoId);
      if (!participante || !participante.comodin.disponible) return state;
      const ocultas = opcionesIncorrectasParaOcultar(state.preguntaActual);
      return tocar({
        ...state,
        opcionesOcultas: ocultas,
        participantes: actualizarParticipante(state.participantes, participante.id, {
          comodin: { disponible: false, usado: 'cincuentaYCincuenta' },
        }),
      });
    }

    case 'APLICAR_COMODIN_CAMBIO_PREGUNTA': {
      if (!state.preguntaActual || !state.participanteActivoId || state.respuestaConfirmada) return state;
      const participante = state.participantes.find((p) => p.id === state.participanteActivoId);
      if (!participante || !participante.comodin.disponible) return state;
      const usadas = registrarUsada(
        state.preguntasUsadasPorCategoria,
        action.nuevaPregunta.escalon,
        action.nuevaPregunta.id
      );
      return tocar({
        ...state,
        preguntaActual: action.nuevaPregunta,
        preguntasUsadasPorCategoria: usadas,
        opcionesOcultas: [],
        respuestaSeleccionada: null,
        participantes: actualizarParticipante(state.participantes, participante.id, {
          comodin: { disponible: false, usado: 'cambioPregunta' },
        }),
      });
    }

    case 'APLICAR_COMODIN_TIEMPO_EXTRA': {
      if (!state.participanteActivoId || state.respuestaConfirmada) return state;
      const participante = state.participantes.find((p) => p.id === state.participanteActivoId);
      if (!participante || !participante.comodin.disponible) return state;
      return tocar({
        ...state,
        temporizador: {
          ...state.temporizador,
          segundosRestantes: state.temporizador.segundosRestantes + 30,
          segundosTotales: state.temporizador.segundosTotales + 30,
          terminado: false,
        },
        participantes: actualizarParticipante(state.participantes, participante.id, {
          comodin: { disponible: false, usado: 'tiempoExtra' },
        }),
      });
    }

    case 'SIGUIENTE_PARTICIPANTE': {
      if (state.ordenTurno.length === 0) return state;
      const n = state.ordenTurno.length;
      const siguienteIndice = (state.indiceTurnoActual + 1) % n;
      const cierraVuelta = siguienteIndice === 0;
      const rondaQueTermina = state.vueltaActual;

      if (cierraVuelta && state.vueltaObjetivoFinal !== null && state.vueltaObjetivoFinal <= rondaQueTermina) {
        return tocar(finalizarSiCorresponde({ ...state, vueltaActual: rondaQueTermina + 1 }));
      }

      const nuevaVuelta = cierraVuelta ? state.vueltaActual + 1 : state.vueltaActual;
      return tocar({
        ...state,
        indiceTurnoActual: siguienteIndice,
        vueltaActual: nuevaVuelta,
        participanteActivoId: state.ordenTurno[siguienteIndice],
        preguntaActual: null,
        opcionesOcultas: [],
        respuestaSeleccionada: null,
        respuestaConfirmada: false,
        resultadoUltimo: null,
        temporizador: {
          ...state.temporizador,
          segundosRestantes: state.configuracion.tiempoSegundos,
          segundosTotales: state.configuracion.tiempoSegundos,
          corriendo: false,
          terminado: false,
        },
      });
    }

    case 'CORREGIR_ESCALON': {
      const nuevoEscalon = Math.max(0, Math.min(8, action.nuevoEscalon));
      let vueltaObjetivoFinal = state.vueltaObjetivoFinal;
      let participantes = actualizarParticipante(state.participantes, action.participanteId, {
        escalonActual: nuevoEscalon,
      });
      if (nuevoEscalon >= 8 && vueltaObjetivoFinal === null) {
        vueltaObjetivoFinal = state.vueltaActual;
        participantes = actualizarParticipante(participantes, action.participanteId, {
          llegoAlFinalEnVuelta: state.vueltaActual,
        });
      }
      return tocar({ ...state, participantes, vueltaObjetivoFinal });
    }

    case 'ACTUALIZAR_CONFIG':
      return tocar({ ...state, configuracion: { ...state.configuracion, ...action.cambios } });

    case 'ACTUALIZAR_PARTICIPANTE':
      return tocar({
        ...state,
        participantes: actualizarParticipante(state.participantes, action.participanteId, {
          ...(action.nombre !== undefined ? { nombre: action.nombre } : {}),
          ...(action.color !== undefined ? { color: action.color } : {}),
        }),
      });

    case 'MOSTRAR_PREGUNTA_DESEMPATE': {
      const usadas = registrarUsada(state.preguntasUsadasPorCategoria, action.pregunta.escalon, action.pregunta.id);
      return tocar({
        ...state,
        preguntasUsadasPorCategoria: usadas,
        desempate: { ...state.desempate, preguntaId: action.pregunta.id, ronda: state.desempate.ronda + 1 },
        preguntaActual: action.pregunta,
        respuestaSeleccionada: null,
        respuestaConfirmada: false,
        opcionesOcultas: [],
      });
    }

    case 'RESOLVER_DESEMPATE': {
      if (action.ganadorId) {
        return tocar({
          ...state,
          fase: 'ganador',
          ganadorId: action.ganadorId,
          desempate: { ...state.desempate, activo: false, ganadorFinalId: action.ganadorId },
        });
      }
      return tocar({ ...state, preguntaActual: null, respuestaSeleccionada: null, respuestaConfirmada: false });
    }

    case 'REINICIAR_PARTIDA': {
      const participantes = state.participantes.map((p) => ({
        ...p,
        escalonActual: 0,
        comodin: { disponible: true, usado: null } as const,
        llegoAlFinalEnVuelta: null,
      }));
      return tocar({
        ...estadoInicial(),
        configuracion: state.configuracion,
        participantes,
        ordenTurno: state.ordenTurno,
        indiceTurnoActual: 0,
        participanteActivoId: state.ordenTurno[0] ?? null,
        fase: 'jugando',
        temporizador: {
          segundosRestantes: state.configuracion.tiempoSegundos,
          segundosTotales: state.configuracion.tiempoSegundos,
          corriendo: false,
          terminado: false,
          excepcionManual: false,
        },
      });
    }

    case 'NUEVA_PARTIDA':
      return estadoInicial();

    default:
      return state;
  }
}

export function comodinTipoLabel(tipo: ComodinTipo | null): string {
  switch (tipo) {
    case 'cincuentaYCincuenta':
      return '50 y 50';
    case 'cambioPregunta':
      return 'Cambio de pregunta';
    case 'tiempoExtra':
      return 'Tiempo extra';
    default:
      return '';
  }
}
