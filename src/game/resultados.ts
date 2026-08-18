import type { GameState, HistorialEntry, Participante } from '../types';
import { porcentaje } from './engine';

export interface EstadisticaParticipante {
  participante: Participante;
  correctas: number;
  incorrectas: number;
  totalRespuestas: number;
  porcentajeAciertos: number;
  escalonAlcanzado: number;
  tiempoPromedioSeg: number;
  categoriaConMasErrores: string | null;
}

export function calcularEstadisticas(state: GameState): EstadisticaParticipante[] {
  return state.participantes.map((participante) => {
    const entradas = state.historial.filter((h) => h.participanteId === participante.id);
    const correctas = entradas.filter((h) => h.acierto).length;
    const incorrectas = entradas.length - correctas;
    const tiempoPromedio = entradas.length
      ? Math.round(entradas.reduce((acc, h) => acc + h.tiempoUtilizadoSeg, 0) / entradas.length)
      : 0;

    const erroresPorCategoria = new Map<string, number>();
    for (const h of entradas) {
      if (!h.acierto) erroresPorCategoria.set(h.categoria, (erroresPorCategoria.get(h.categoria) ?? 0) + 1);
    }
    let categoriaConMasErrores: string | null = null;
    let maxErrores = 0;
    for (const [categoria, cantidad] of erroresPorCategoria) {
      if (cantidad > maxErrores) {
        maxErrores = cantidad;
        categoriaConMasErrores = categoria;
      }
    }

    return {
      participante,
      correctas,
      incorrectas,
      totalRespuestas: entradas.length,
      porcentajeAciertos: porcentaje(correctas, entradas.length),
      escalonAlcanzado: participante.escalonActual,
      tiempoPromedioSeg: tiempoPromedio,
      categoriaConMasErrores,
    };
  });
}

export function exportarPartidaJSON(state: GameState): string {
  return JSON.stringify(
    {
      institucion: state.configuracion.institucion,
      docente: state.configuracion.docente,
      fecha: new Date(state.creadoEn).toISOString(),
      participantes: state.participantes,
      historial: state.historial,
      ganadorId: state.ganadorId,
    },
    null,
    2
  );
}

function escaparCSV(valor: string | number): string {
  const texto = String(valor);
  if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function exportarPartidaCSV(historial: HistorialEntry[]): string {
  const encabezados = [
    'participante',
    'categoria',
    'escalon',
    'enunciado',
    'acierto',
    'tiempoUtilizadoSeg',
    'comodinUsado',
  ];
  const filas = historial.map((h) =>
    [
      h.participanteNombre,
      h.categoria,
      h.escalon,
      h.enunciado,
      h.acierto ? 'correcta' : 'incorrecta',
      h.tiempoUtilizadoSeg,
      h.comodinUsado ?? '',
    ]
      .map(escaparCSV)
      .join(',')
  );
  return [encabezados.join(','), ...filas].join('\n');
}

export function descargarArchivo(contenido: string, nombreArchivo: string, tipo: string) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
