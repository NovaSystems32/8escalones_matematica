// Utilidad opcional de voz en español usando SpeechSynthesis (puede no estar disponible en todos los navegadores)

export function vozDisponible(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let vozEsPreferida: SpeechSynthesisVoice | null = null;
let vocesListas = false;

function cargarVoces() {
  if (!vozDisponible()) return;
  const voces = window.speechSynthesis.getVoices();
  if (voces.length === 0) return;
  vocesListas = true;
  vozEsPreferida =
    voces.find((v) => v.lang?.toLowerCase().startsWith('es-ar')) ??
    voces.find((v) => v.lang?.toLowerCase().startsWith('es')) ??
    null;
}

if (vozDisponible()) {
  cargarVoces();
  window.speechSynthesis.onvoiceschanged = cargarVoces;
}

export function hablar(texto: string, activo: boolean) {
  if (!activo || !vozDisponible()) return;
  try {
    if (!vocesListas) cargarVoces();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-AR';
    if (vozEsPreferida) utterance.voice = vozEsPreferida;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // La síntesis de voz es opcional: si falla, simplemente no se escucha nada.
  }
}
