import { useState } from 'react';

const ATAJOS = [
  ['A / B / C / D', 'Seleccionar respuesta'],
  ['Barra espaciadora', 'Iniciar o pausar el reloj'],
  ['Enter', 'Confirmar respuesta'],
  ['N', 'Siguiente participante'],
  ['R', 'Reiniciar temporizador'],
  ['F', 'Pantalla completa'],
  ['Escape', 'Cerrar ventanas / salir de pantalla completa'],
];

export function KeyboardShortcutsHelp() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="boton-show text-sm sm:text-base"
        aria-haspopup="dialog"
      >
        ⌨ Atajos de teclado
      </button>
      {abierto && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Atajos de teclado"
          onClick={() => setAbierto(false)}
        >
          <div className="panel-vidrio rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black mb-4 titulo-show">Atajos de teclado</h2>
            <ul className="space-y-2 mb-4">
              {ATAJOS.map(([tecla, accion]) => (
                <li key={tecla} className="flex items-center justify-between gap-4 text-sm">
                  <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20 font-mono text-xs">{tecla}</kbd>
                  <span className="text-[var(--texto-suave)] text-right">{accion}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setAbierto(false)} className="boton-show boton-primario w-full">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
