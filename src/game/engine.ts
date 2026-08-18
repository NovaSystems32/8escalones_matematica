import type { CategoryId, Participante, Question } from '../types';
import { PARTICIPANT_COLORS } from '../data/categories';

export function crearId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function crearParticipantes(nombres: string[], colores?: string[]): Participante[] {
  return nombres.map((nombre, i) => ({
    id: crearId('p'),
    nombre: nombre.trim() || `Participante ${i + 1}`,
    color: colores?.[i] ?? PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
    escalonActual: 0,
    comodin: { disponible: true, usado: null },
    llegoAlFinalEnVuelta: null,
  }));
}

/** Elige una pregunta activa al azar de un escalón, evitando repetir las ya usadas hasta agotarlas. */
export function elegirPregunta(
  banco: Question[],
  escalon: number,
  usadas: string[],
  excluirId?: string
): Question | null {
  const activasDelEscalon = banco.filter((q) => q.escalon === escalon && q.activa);
  if (activasDelEscalon.length === 0) return null;

  let disponibles = activasDelEscalon.filter((q) => !usadas.includes(q.id) && q.id !== excluirId);

  if (disponibles.length === 0) {
    // Se agotaron: reiniciamos el pool de esa categoría (salvo la que se quiere excluir explícitamente)
    disponibles = activasDelEscalon.filter((q) => q.id !== excluirId);
  }
  if (disponibles.length === 0) {
    // Sólo queda la excluida (banco de 1 pregunta activa): la devolvemos igual
    disponibles = activasDelEscalon;
  }

  const idx = Math.floor(Math.random() * disponibles.length);
  return disponibles[idx];
}

export function proximoEscalon(participante: Participante): number {
  return Math.min(8, participante.escalonActual + 1);
}

export function evaluarRespuesta(pregunta: Question, opcionSeleccionada: number | null): boolean {
  return opcionSeleccionada !== null && opcionSeleccionada === pregunta.respuestaCorrecta;
}

export function calcularCampeones(participantes: Participante[]): string[] {
  return participantes.filter((p) => p.escalonActual >= 8).map((p) => p.id);
}

export function opcionesIncorrectasParaOcultar(pregunta: Question): number[] {
  const incorrectas = [0, 1, 2, 3].filter((i) => i !== pregunta.respuestaCorrecta);
  const barajadas = [...incorrectas].sort(() => Math.random() - 0.5);
  return barajadas.slice(0, 2).sort((a, b) => a - b);
}

export function categoriaIdValida(n: number): n is CategoryId {
  return n >= 1 && n <= 8;
}

export function porcentaje(aciertos: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((aciertos / total) * 100);
}
