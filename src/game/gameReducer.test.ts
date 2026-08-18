import { describe, expect, it } from 'vitest';
import type { Question, GameState } from '../types';
import { CONFIG_POR_DEFECTO, estadoInicial, gameReducer } from './gameReducer';

function preguntaPara(escalon: number, id = `q-${escalon}-${Math.random()}`): Question {
  return {
    id,
    escalon: escalon as Question['escalon'],
    categoria: 'Test',
    enunciado: `Pregunta escalón ${escalon}`,
    opciones: ['A', 'B', 'C', 'D'],
    respuestaCorrecta: 1,
    dificultad: 'fácil',
    tiempoSugerido: 20,
    activa: true,
  };
}

function iniciarPartida(nombres: string[], tiempoSegundos = 30): GameState {
  return gameReducer(estadoInicial(), {
    type: 'INICIAR_PARTIDA',
    nombres,
    colores: nombres.map(() => '#ff0000'),
    config: { ...CONFIG_POR_DEFECTO, tiempoSegundos: tiempoSegundos as 30 },
  });
}

describe('INICIAR_PARTIDA', () => {
  it('crea participantes en orden y activa la fase jugando', () => {
    const estado = iniciarPartida(['Ana', 'Beto']);
    expect(estado.fase).toBe('jugando');
    expect(estado.participantes).toHaveLength(2);
    expect(estado.ordenTurno).toEqual(estado.participantes.map((p) => p.id));
    expect(estado.participanteActivoId).toBe(estado.ordenTurno[0]);
  });
});

describe('Flujo de un turno', () => {
  it('avanza al participante un escalón si responde correctamente', () => {
    let estado = iniciarPartida(['Ana', 'Beto']);
    const activoId = estado.participanteActivoId!;
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    expect(estado.preguntaActual).not.toBeNull();
    estado = gameReducer(estado, { type: 'INICIAR_TIEMPO' });
    expect(estado.temporizador.corriendo).toBe(true);
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    expect(estado.respuestaSeleccionada).toBe(1);
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 5 });
    expect(estado.respuestaConfirmada).toBe(true);
    expect(estado.resultadoUltimo).toBe('correcta');
    const activo = estado.participantes.find((p) => p.id === activoId)!;
    expect(activo.escalonActual).toBe(1);
  });

  it('mantiene al participante en el mismo escalón si responde mal', () => {
    let estado = iniciarPartida(['Ana', 'Beto']);
    const activoId = estado.participanteActivoId!;
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 0 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 8 });
    expect(estado.resultadoUltimo).toBe('incorrecta');
    const activo = estado.participantes.find((p) => p.id === activoId)!;
    expect(activo.escalonActual).toBe(0);
  });

  it('no permite volver a confirmar una respuesta ya confirmada', () => {
    let estado = iniciarPartida(['Ana']);
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 5 });
    const antes = estado;
    const despues = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 5 });
    expect(despues).toBe(antes);
  });

  it('pasa al siguiente participante en orden circular', () => {
    let estado = iniciarPartida(['Ana', 'Beto', 'Cami']);
    const orden = estado.ordenTurno;
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 3 });
    estado = gameReducer(estado, { type: 'SIGUIENTE_PARTICIPANTE' });
    expect(estado.participanteActivoId).toBe(orden[1]);
    expect(estado.preguntaActual).toBeNull();
  });
});

describe('Temporizador', () => {
  it('TICK descuenta un segundo y termina en cero', () => {
    let estado = iniciarPartida(['Ana'], 15);
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'INICIAR_TIEMPO' });
    for (let i = 0; i < 15; i++) {
      estado = gameReducer(estado, { type: 'TICK' });
    }
    expect(estado.temporizador.segundosRestantes).toBe(0);
    expect(estado.temporizador.terminado).toBe(true);
    expect(estado.temporizador.corriendo).toBe(false);
  });

  it('bloquea la selección de respuesta cuando el tiempo terminó sin excepción manual', () => {
    let estado = iniciarPartida(['Ana'], 15);
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'INICIAR_TIEMPO' });
    for (let i = 0; i < 15; i++) estado = gameReducer(estado, { type: 'TICK' });
    const despues = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    expect(despues.respuestaSeleccionada).toBeNull();
  });
});

describe('Comodines', () => {
  it('50 y 50 oculta exactamente dos opciones incorrectas y consume el comodín', () => {
    let estado = iniciarPartida(['Ana']);
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'APLICAR_COMODIN_5050' });
    expect(estado.opcionesOcultas).toHaveLength(2);
    expect(estado.participantes[0].comodin.disponible).toBe(false);
    expect(estado.participantes[0].comodin.usado).toBe('cincuentaYCincuenta');
  });

  it('no permite usar el comodín dos veces', () => {
    let estado = iniciarPartida(['Ana']);
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'APLICAR_COMODIN_TIEMPO_EXTRA' });
    const totalTrasUno = estado.temporizador.segundosTotales;
    const despues = gameReducer(estado, { type: 'APLICAR_COMODIN_5050' });
    expect(despues.opcionesOcultas).toHaveLength(0);
    expect(despues.temporizador.segundosTotales).toBe(totalTrasUno);
  });

  it('tiempo extra suma 30 segundos', () => {
    let estado = iniciarPartida(['Ana'], 30);
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'APLICAR_COMODIN_TIEMPO_EXTRA' });
    expect(estado.temporizador.segundosRestantes).toBe(60);
  });

  it('cambio de pregunta reemplaza la pregunta actual', () => {
    let estado = iniciarPartida(['Ana']);
    const original = preguntaPara(1, 'original');
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: original });
    const nueva = preguntaPara(1, 'nueva');
    estado = gameReducer(estado, { type: 'APLICAR_COMODIN_CAMBIO_PREGUNTA', nuevaPregunta: nueva });
    expect(estado.preguntaActual?.id).toBe('nueva');
    expect(estado.participantes[0].comodin.usado).toBe('cambioPregunta');
  });
});

describe('Final del juego', () => {
  it('declara ganador único cuando solo un participante llega al escalón 8 en la ronda', () => {
    let estado = iniciarPartida(['Ana', 'Beto']);
    estado = { ...estado, participantes: estado.participantes.map((p, i) => (i === 0 ? { ...p, escalonActual: 7 } : p)) };
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(8) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 4 });
    expect(estado.participantes[0].escalonActual).toBe(8);
    estado = gameReducer(estado, { type: 'SIGUIENTE_PARTICIPANTE' });
    // Beto todavía no jugó su turno de esta ronda: no debe finalizar el juego aún.
    expect(estado.fase).toBe('jugando');
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 0 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 4 });
    estado = gameReducer(estado, { type: 'SIGUIENTE_PARTICIPANTE' });
    expect(estado.fase).toBe('ganador');
    expect(estado.ganadorId).toBe(estado.participantes[0].id);
  });

  it('activa el desempate cuando dos participantes llegan al escalón 8 en la misma ronda', () => {
    let estado = iniciarPartida(['Ana', 'Beto']);
    estado = {
      ...estado,
      participantes: estado.participantes.map((p) => ({ ...p, escalonActual: 7 })),
    };
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(8) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 4 });
    estado = gameReducer(estado, { type: 'SIGUIENTE_PARTICIPANTE' });
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(8) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 4 });
    estado = gameReducer(estado, { type: 'SIGUIENTE_PARTICIPANTE' });
    expect(estado.fase).toBe('desempate');
    expect(estado.desempate.finalistas).toHaveLength(2);
  });

  it('resuelve el desempate declarando un ganador', () => {
    let estado = iniciarPartida(['Ana', 'Beto']);
    estado = {
      ...estado,
      fase: 'desempate',
      desempate: { activo: true, finalistas: estado.participantes.map((p) => p.id), preguntaId: null, ronda: 0, ganadorFinalId: null },
    };
    const ganadorId = estado.participantes[0].id;
    estado = gameReducer(estado, { type: 'RESOLVER_DESEMPATE', ganadorId });
    expect(estado.fase).toBe('ganador');
    expect(estado.ganadorId).toBe(ganadorId);
  });

  it('permite repetir el desempate si continúan igualados', () => {
    let estado = iniciarPartida(['Ana', 'Beto']);
    estado = {
      ...estado,
      fase: 'desempate',
      desempate: { activo: true, finalistas: estado.participantes.map((p) => p.id), preguntaId: null, ronda: 0, ganadorFinalId: null },
    };
    estado = gameReducer(estado, { type: 'RESOLVER_DESEMPATE', ganadorId: null });
    expect(estado.fase).toBe('desempate');
    expect(estado.desempate.activo).toBe(true);
  });
});

describe('Corrección manual', () => {
  it('permite corregir el escalón de un participante', () => {
    let estado = iniciarPartida(['Ana']);
    const id = estado.participantes[0].id;
    estado = gameReducer(estado, { type: 'CORREGIR_ESCALON', participanteId: id, nuevoEscalon: 5 });
    expect(estado.participantes[0].escalonActual).toBe(5);
  });

  it('no permite escalones fuera de rango', () => {
    let estado = iniciarPartida(['Ana']);
    const id = estado.participantes[0].id;
    estado = gameReducer(estado, { type: 'CORREGIR_ESCALON', participanteId: id, nuevoEscalon: 20 });
    expect(estado.participantes[0].escalonActual).toBe(8);
    estado = gameReducer(estado, { type: 'CORREGIR_ESCALON', participanteId: id, nuevoEscalon: -3 });
    expect(estado.participantes[0].escalonActual).toBe(0);
  });
});

describe('REINICIAR_PARTIDA', () => {
  it('reinicia escalones e historial pero conserva a los participantes', () => {
    let estado = iniciarPartida(['Ana', 'Beto']);
    estado = gameReducer(estado, { type: 'MOSTRAR_PREGUNTA', pregunta: preguntaPara(1) });
    estado = gameReducer(estado, { type: 'SELECCIONAR_RESPUESTA', opcion: 1 });
    estado = gameReducer(estado, { type: 'CONFIRMAR_RESPUESTA', tiempoUtilizadoSeg: 4 });
    const nombresAntes = estado.participantes.map((p) => p.nombre);
    estado = gameReducer(estado, { type: 'REINICIAR_PARTIDA' });
    expect(estado.participantes.every((p) => p.escalonActual === 0)).toBe(true);
    expect(estado.historial).toHaveLength(0);
    expect(estado.participantes.map((p) => p.nombre)).toEqual(nombresAntes);
    expect(estado.fase).toBe('jugando');
  });
});
