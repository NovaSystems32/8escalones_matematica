import { describe, expect, it } from 'vitest';
import preguntas from './questions.default.json';
import type { Question } from '../types';

const banco = preguntas as Question[];

describe('Banco de preguntas inicial', () => {
  it('tiene al menos 80 preguntas', () => {
    expect(banco.length).toBeGreaterThanOrEqual(80);
  });

  it('tiene al menos 10 preguntas activas por cada uno de los 8 escalones', () => {
    for (let escalon = 1; escalon <= 8; escalon++) {
      const delEscalon = banco.filter((q) => q.escalon === escalon && q.activa);
      expect(delEscalon.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('tiene ids únicos', () => {
    const ids = banco.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada pregunta tiene exactamente cuatro opciones no vacías y distintas', () => {
    for (const q of banco) {
      expect(q.opciones).toHaveLength(4);
      for (const opcion of q.opciones) {
        expect(opcion.trim().length).toBeGreaterThan(0);
      }
      expect(new Set(q.opciones).size).toBe(4);
    }
  });

  it('cada pregunta tiene un índice de respuesta correcta válido (0 a 3)', () => {
    for (const q of banco) {
      expect([0, 1, 2, 3]).toContain(q.respuestaCorrecta);
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
