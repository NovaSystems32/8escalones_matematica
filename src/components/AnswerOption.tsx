const LETRAS = ['A', 'B', 'C', 'D'] as const;

interface Props {
  indice: 0 | 1 | 2 | 3;
  texto: string;
  seleccionada: boolean;
  oculta: boolean;
  revelar: boolean;
  esLaCorrecta: boolean;
  bloqueada: boolean;
  onSeleccionar?: (indice: 0 | 1 | 2 | 3) => void;
  interactiva: boolean;
}

export function AnswerOption({
  indice,
  texto,
  seleccionada,
  oculta,
  revelar,
  esLaCorrecta,
  bloqueada,
  onSeleccionar,
  interactiva,
}: Props) {
  if (oculta) {
    return (
      <div className="tarjeta-respuesta panel-vidrio rounded-2xl p-4 sm:p-6 opacity-25 flex items-center gap-3 min-h-[88px]">
        <span className="text-2xl font-black text-white/40">{LETRAS[indice]}</span>
        <span className="text-white/30 italic">Opción descartada</span>
      </div>
    );
  }

  const marcada = !revelar && seleccionada;

  let estilo = 'panel-vidrio';
  let anillo = '';
  if (revelar) {
    if (esLaCorrecta) {
      estilo = 'bg-green-600/80 border-2 border-green-300';
    } else if (seleccionada) {
      estilo = 'bg-red-600/80 border-2 border-red-300';
    } else {
      estilo = 'panel-vidrio opacity-50';
    }
  } else if (marcada) {
    anillo = 'scale-[1.02]';
  } else if (bloqueada) {
    estilo = 'panel-vidrio opacity-50';
  }

  const Etiqueta = interactiva ? 'button' : 'div';

  return (
    <Etiqueta
      type={interactiva ? 'button' : undefined}
      disabled={interactiva ? bloqueada || revelar : undefined}
      onClick={interactiva ? () => onSeleccionar?.(indice) : undefined}
      aria-pressed={interactiva ? seleccionada : undefined}
      className={`tarjeta-respuesta relative rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 min-h-[88px] text-left w-full border-4 ${estilo} ${anillo} ${
        interactiva ? 'cursor-pointer' : ''
      } ${revelar && esLaCorrecta ? 'destello-resultado' : ''}`}
      style={
        marcada
          ? {
              borderColor: 'var(--dorado)',
              background: 'rgba(255, 201, 74, 0.22)',
              boxShadow: '0 0 0 2px rgba(255, 201, 74, 0.35), 0 8px 24px rgba(255, 201, 74, 0.3)',
            }
          : { borderColor: 'transparent' }
      }
    >
      {marcada && (
        <span
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-lg shadow-lg"
          style={{ background: 'var(--dorado)', color: '#241a00' }}
          aria-hidden="true"
        >
          ✓
        </span>
      )}
      <span
        className="flex-none w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl"
        style={{ background: marcada ? 'var(--dorado)' : 'rgba(255,255,255,0.12)', color: marcada ? '#241a00' : undefined }}
      >
        {LETRAS[indice]}
      </span>
      <span className="font-bold text-lg sm:text-2xl leading-snug texto-alto-contraste">{texto}</span>
      {marcada && (
        <span
          className="ml-auto flex-none text-xs sm:text-sm font-black px-3 py-1 rounded-full"
          style={{ background: 'var(--dorado)', color: '#241a00' }}
        >
          ✓ Seleccionada
        </span>
      )}
    </Etiqueta>
  );
}
