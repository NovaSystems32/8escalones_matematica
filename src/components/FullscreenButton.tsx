import { useFullscreen } from '../hooks/useFullscreen';

export function FullscreenButton({ className = '' }: { className?: string }) {
  const { esPantallaCompleta, alternar } = useFullscreen();
  return (
    <button
      type="button"
      onClick={alternar}
      className={`boton-show text-sm sm:text-base ${className}`}
      aria-pressed={esPantallaCompleta}
      title="Atajo: F"
    >
      {esPantallaCompleta ? '⤢ Salir de pantalla completa' : '⛶ Pantalla completa'}
    </button>
  );
}
