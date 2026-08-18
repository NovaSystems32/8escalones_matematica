import type { Category, CategoryId } from '../types';

export const CATEGORIES: Record<CategoryId, Category> = {
  1: { id: 1, nombre: 'Numeración', color: '#38bdf8', colorSuave: 'rgba(56, 189, 248, 0.18)' },
  2: { id: 2, nombre: 'Cálculo mental', color: '#22c55e', colorSuave: 'rgba(34, 197, 94, 0.18)' },
  3: { id: 3, nombre: 'Operaciones', color: '#eab308', colorSuave: 'rgba(234, 179, 8, 0.18)' },
  4: { id: 4, nombre: 'Múltiplos y divisores', color: '#f97316', colorSuave: 'rgba(249, 115, 22, 0.18)' },
  5: { id: 5, nombre: 'Fracciones', color: '#ec4899', colorSuave: 'rgba(236, 72, 153, 0.18)' },
  6: { id: 6, nombre: 'Decimales y porcentajes', color: '#a855f7', colorSuave: 'rgba(168, 85, 247, 0.18)' },
  7: { id: 7, nombre: 'Geometría y medida', color: '#3b82f6', colorSuave: 'rgba(59, 130, 246, 0.18)' },
  8: { id: 8, nombre: 'Situaciones problemáticas', color: '#d4af37', colorSuave: 'rgba(212, 175, 55, 0.22)' },
};

export const CATEGORY_LIST: Category[] = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => CATEGORIES[n as CategoryId]);

export const PARTICIPANT_COLORS = [
  '#ff3d9a', // magenta
  '#ffb020', // dorado/naranja
  '#22c55e', // verde
  '#38bdf8', // celeste
  '#a855f7', // violeta
];

export function categoriaDeEscalon(escalon: number): Category {
  const clamped = Math.min(8, Math.max(1, escalon)) as CategoryId;
  return CATEGORIES[clamped];
}
