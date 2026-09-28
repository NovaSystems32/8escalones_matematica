import { describe, expect, it } from 'vitest';
import preguntas from './questions.default.json';
import type { Question } from '../types';

const banco = preguntas as Question[];

describe('Banco de preguntas inicial', () => {
  it('tiene exactamente 27 preguntas, todas activas', () => {
    expect(banco.length).toBe(27);
    expect(banco.every((q) => q.activa)).toBe(true);
  });

  it('tiene ids únicos', () => {
    const ids = banco.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada pregunta tiene entre 2 y 4 opciones no vacías y distintas', () => {
    for (const q of banco) {
      expect(q.opciones.length).toBeGreaterThanOrEqual(2);
      expect(q.opciones.length).toBeLessThanOrEqual(4);
      for (const opcion of q.opciones) {
        expect(opcion.trim().length).toBeGreaterThan(0);
      }
      expect(new Set(q.opciones).size).toBe(q.opciones.length);
    }
  });

  it('cada pregunta tiene un índice de respuesta correcta que coincide con una opción existente', () => {
    for (const q of banco) {
      expect(q.respuestaCorrecta).toBeGreaterThanOrEqual(0);
      expect(q.respuestaCorrecta).toBeLessThan(q.opciones.length);
    }
  });

  it('cada pregunta pertenece a un escalón entre 1 y 8', () => {
    for (const q of banco) {
      expect(q.escalon).toBeGreaterThanOrEqual(1);
      expect(q.escalon).toBeLessThanOrEqual(8);
    }
  });

  it('cada pregunta tiene un enunciado no vacío', () => {
    for (const q of banco) {
      expect(q.enunciado.trim().length).toBeGreaterThan(0);
    }
  });
});
