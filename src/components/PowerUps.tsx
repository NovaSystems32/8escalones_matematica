import type { Participante } from '../types';

interface Props {
  participante: Participante | null;
  puedeUsar: boolean;
  onCincuentaYCincuenta: () => void;
  onCambioPregunta: () => void;
  onTiempoExtra: () => void;
}

export function PowerUps({ participante, puedeUsar, onCincuentaYCincuenta, onCambioPregunta, onTiempoExtra }: Props) {
  const disponible = puedeUsar && !!participante?.comodin.disponible;

  return (
    <div className="panel-vidrio rounded-xl p-4">
      <h3 className="font-black mb-1 titulo-show text-lg">Comodines</h3>
      <p className="text-xs text-[var(--texto-suave)] mb-3">
        {participante
          ? participante.comodin.usado
            ? `${participante.nombre} ya usó su comodín (${participante.comodin.usado === 'cincuentaYCincuenta' ? '50 y 50' : participante.comodin.usado === 'cambioPregunta' ? 'cambio de pregunta' : 'tiempo extra'}).`
            : `${participante.nombre} tiene un comodín disponible para usar en este turno.`
          : 'Seleccioná un participante para ver sus comodines.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button type="button" className="boton-show text-sm" disabled={!disponible} onClick={onCincuentaYCincuenta}>
          50 y 50
        </button>
        <button type="button" className="boton-show text-sm" disabled={!disponible} onClick={onCambioPregunta}>
          Cambiar pregunta
        </button>
        <button type="button" className="boton-show text-sm" disabled={!disponible} onClick={onTiempoExtra}>
          +30s tiempo extra
        </button>
      </div>
    </div>
  );
}
