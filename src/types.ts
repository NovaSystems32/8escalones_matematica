// Tipos centrales de "Los 8 escalones de la matemática"

export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Dificultad = 'fácil' | 'media' | 'difícil';

export interface Category {
  id: CategoryId;
  nombre: string;
  color: string;
  colorSuave: string;
}

export interface Question {
  id: string;
  escalon: CategoryId;
  categoria: string;
  enunciado: string;
  opciones: [string, string, string, string];
  respuestaCorrecta: 0 | 1 | 2 | 3;
  explicacion?: string;
  dificultad: Dificultad;
  tiempoSugerido: number;
  activa: boolean;
}

export type ComodinTipo = 'cincuentaYCincuenta' | 'cambioPregunta' | 'tiempoExtra';

export interface ComodinEstado {
  disponible: boolean;
  usado: ComodinTipo | null;
}

export interface Participante {
  id: string;
  nombre: string;
  color: string;
  escalonActual: number; // 0 = salida, 8 = meta
  comodin: ComodinEstado;
  llegoAlFinalEnVuelta: number | null;
}

export interface HistorialEntry {
  id: string;
  participanteId: string;
  participanteNombre: string;
  preguntaId: string;
  enunciado: string;
  categoria: string;
  escalon: number;
  opcionSeleccionada: number | null;
  respuestaCorrecta: number;
  acierto: boolean;
  tiempoUtilizadoSeg: number;
  comodinUsado: ComodinTipo | null;
  timestamp: number;
}

export interface Configuracion {
  institucion: string;
  docente: string;
  tiempoSegundos: 15 | 20 | 30 | 45 | 60;
  sonidoActivado: boolean;
  vozActivada: boolean;
  animacionesReducidas: boolean;
}

export type Fase = 'configuracion' | 'jugando' | 'desempate' | 'ganador';

export interface TemporizadorEstado {
  segundosRestantes: number;
  segundosTotales: number;
  corriendo: boolean;
  terminado: boolean;
  excepcionManual: boolean;
}

export interface DesempateEstado {
  activo: boolean;
  finalistas: string[];
  preguntaId: string | null;
  ronda: number;
  ganadorFinalId: string | null;
}

export interface GameState {
  configuracion: Configuracion;
  participantes: Participante[];
  ordenTurno: string[];
  indiceTurnoActual: number;
  vueltaActual: number;
  vueltaObjetivoFinal: number | null;
  fase: Fase;
  participanteActivoId: string | null;
  preguntaActual: Question | null;
  opcionesOcultas: number[]; // para 50/50
  respuestaSeleccionada: number | null;
  respuestaConfirmada: boolean;
  resultadoUltimo: 'correcta' | 'incorrecta' | null;
  temporizador: TemporizadorEstado;
  preguntasUsadasPorCategoria: Record<number, string[]>;
  historial: HistorialEntry[];
  desempate: DesempateEstado;
  ganadorId: string | null;
  creadoEn: number;
  actualizadoEn: number;
}

export interface BancoPreguntasState {
  preguntas: Question[];
}

export type MensajeSync =
  | { tipo: 'estado'; payload: GameState }
  | { tipo: 'banco'; payload: Question[] }
  | { tipo: 'ping' };
