// Sonidos generados con Web Audio API (sin archivos externos)

let ctx: AudioContext | null = null;
let volumenGlobal = 0.5;

function contexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setVolumen(v: number) {
  volumenGlobal = Math.max(0, Math.min(1, v));
}

interface Tono {
  frecuencia: number;
  duracion: number;
  tipo?: OscillatorType;
  retraso?: number;
  volumen?: number;
}

function reproducirTono({ frecuencia, duracion, tipo = 'sine', retraso = 0, volumen = 1 }: Tono) {
  const audio = contexto();
  if (!audio) return;
  const inicio = audio.currentTime + retraso;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia, inicio);
  const vol = volumenGlobal * volumen;
  gain.gain.setValueAtTime(0, inicio);
  gain.gain.linearRampToValueAtTime(vol, inicio + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(inicio);
  osc.stop(inicio + duracion + 0.05);
}

export function sonidoInicioReloj(activo: boolean) {
  if (!activo) return;
  reproducirTono({ frecuencia: 660, duracion: 0.12, tipo: 'triangle' });
}

export function sonidoTic(activo: boolean) {
  if (!activo) return;
  reproducirTono({ frecuencia: 880, duracion: 0.08, tipo: 'square', volumen: 0.5 });
}

export function sonidoCorrecta(activo: boolean) {
  if (!activo) return;
  reproducirTono({ frecuencia: 523.25, duracion: 0.15, tipo: 'sine' });
  reproducirTono({ frecuencia: 659.25, duracion: 0.15, tipo: 'sine', retraso: 0.12 });
  reproducirTono({ frecuencia: 783.99, duracion: 0.25, tipo: 'sine', retraso: 0.24 });
}

export function sonidoIncorrecta(activo: boolean) {
  if (!activo) return;
  reproducirTono({ frecuencia: 311, duracion: 0.2, tipo: 'sawtooth', volumen: 0.6 });
  reproducirTono({ frecuencia: 220, duracion: 0.35, tipo: 'sawtooth', retraso: 0.15, volumen: 0.6 });
}

export function sonidoAvanceEscalon(activo: boolean) {
  if (!activo) return;
  [523.25, 587.33, 659.25, 698.46].forEach((f, i) =>
    reproducirTono({ frecuencia: f, duracion: 0.18, tipo: 'triangle', retraso: i * 0.08, volumen: 0.7 })
  );
}

export function sonidoGanador(activo: boolean) {
  if (!activo) return;
  const notas = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  notas.forEach((f, i) => reproducirTono({ frecuencia: f, duracion: 0.3, tipo: 'triangle', retraso: i * 0.16 }));
}

export function sonidoComodin(activo: boolean) {
  if (!activo) return;
  reproducirTono({ frecuencia: 440, duracion: 0.1, tipo: 'square', volumen: 0.5 });
  reproducirTono({ frecuencia: 660, duracion: 0.15, tipo: 'square', retraso: 0.1, volumen: 0.5 });
}
