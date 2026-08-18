import { describe, expect, it } from 'vitest';
import type { Question } from '../types';
import {
  calcularCampeones,
  crearParticipantes,
  elegirPregunta,
  evaluarRespuesta,
  opcionesIncorrectasParaOcultar,
  porcentaje,
  proximoEscalon,
} from './engine';

const preguntaBase: Question = {
  id: 'q1',
  escalon: 1,
  categoria: 'Numeración',
  enunciado: '¿Cuánto es 2 + 2?',
  opciones: ['3', '4', '5', '6'],
  respuestaCorrecta: 1,
  dificultad: 'fácil',
  tiempoSugerido: 20,
  activa: true,
};

function crearBanco(escalon: number, cantidad: number): Question[] {
  return Array.from({ length: cantidad }, (_, i) => ({
    ...preguntaBase,
    id: `esc${escalon}-${i}`,
    escalon: escalon as Question['escalon'],
    activa: true,
  }));
}

describe('crearParticipantes', () => {
  it('crea participantes en el escalón 0 con comodín disponible', () => {
    const participantes = crearParticipantes(['Ana', 'Beto', 'Cami', 'Dani', 'Eli']);
    expect(participantes).toHaveLength(5);
    for (const p of participantes) {
      expect(p.escalonActual).toBe(0);
      expect(p.comodin.disponible).toBe(true);
      expect(p.comodin.usado).toBeNull();
    }
  });

  it('asigna nombres por defecto si vienen vacíos', () => {
    const [p] = crearParticipantes(['   ']);
    expect(p.nombre).toBe('Participante 1');
  });
});

describe('elegirPregunta', () => {
  it('devuelve null si no hay preguntas activas para el escalón', () => {
    expect(elegirPregunta([], 3, [])).toBeNull();
  });

  it('no repite preguntas ya usadas mientras haya disponibles', () => {
    const banco = crearBanco(2, 3);
    const usadas = [banco[0].id, banco[1].id];
    const elegida = elegirPregunta(banco, 2, usadas);
    expect(elegida?.id).toBe(banco[2].id);
  });

  it('reinicia el pool cuando se agotan todas las preguntas de la categoría', () => {
    const banco = crearBanco(4, 2);
    const usadas = banco.map((q) => q.id);
    const elegida = elegirPregunta(banco, 4, usadas);
    expect(elegida).not.toBeNull();
    expect(banco.map((q) => q.id)).toContain(elegida!.id);
  });

  it('ignora preguntas inactivas', () => {
    const banco = crearBanco(5, 2).map((q, i) => ({ ...q, activa: i === 0 }));
    const elegida = elegirPregunta(banco, 5, []);
    expect(elegida?.id).toBe(banco[0].id);
  });
});

describe('proximoEscalon', () => {
  it('devuelve escalonActual + 1', () => {
    expect(proximoEscalon({ ...crearParticipantes(['x'])[0], escalonActual: 3 })).toBe(4);
  });

  it('nunca supera el escalón 8', () => {
    expect(proximoEscalon({ ...crearParticipantes(['x'])[0], escalonActual: 8 })).toBe(8);
  });
});

describe('evaluarRespuesta', () => {
  it('es correcta cuando coincide con respuestaCorrecta', () => {
    expect(evaluarRespuesta(preguntaBase, 1)).toBe(true);
  });
  it('es incorrecta cuando no coincide', () => {
    expect(evaluarRespuesta(preguntaBase, 0)).toBe(false);
  });
  it('es incorrecta cuando no se seleccionó nada', () => {
    expect(evaluarRespuesta(preguntaBase, null)).toBe(false);
  });
});

describe('calcularCampeones', () => {
  it('detecta participantes que llegaron al escalón 8', () => {
    const participantes = crearParticipantes(['a', 'b', 'c']).map((p, i) => ({
      ...p,
      escalonActual: i === 1 ? 8 : 3,
    }));
    expect(calcularCampeones(participantes)).toEqual([participantes[1].id]);
  });
});

describe('opcionesIncorrectasParaOcultar', () => {
  it('devuelve dos índices incorrectos distintos de la respuesta correcta', () => {
    const ocultas = opcionesIncorrectasParaOcultar(preguntaBase);
    expect(ocultas).toHaveLength(2);
    expect(ocultas).not.toContain(preguntaBase.respuestaCorrecta);
    expect(new Set(ocultas).size).toBe(2);
  });
});

describe('porcentaje', () => {
  it('calcula el redondeo correcto', () => {
    expect(porcentaje(1, 3)).toBe(33);
    expect(porcentaje(0, 0)).toBe(0);
    expect(porcentaje(4, 4)).toBe(100);
  });
});
