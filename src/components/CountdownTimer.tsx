interface Props {
  segundosRestantes: number;
  segundosTotales: number;
  terminado: boolean;
  tamano?: number;
}

function colorParaTiempo(segundosRestantes: number): string {
  if (segundosRestantes <= 5) return '#ff3b3b';
  if (segundosRestantes <= 10) return '#ff8a3d';
  return '#ffc94a';
}

export function CountdownTimer({ segundosRestantes, segundosTotales, terminado, tamano = 200 }: Props) {
  const radio = 88;
  const circunferencia = 2 * Math.PI * radio;
  const proporcion = segundosTotales > 0 ? segundosRestantes / segundosTotales : 0;
  const offset = circunferencia * (1 - Math.max(0, Math.min(1, proporcion)));
  const color = colorParaTiempo(segundosRestantes);
  const enUltimos5 = segundosRestantes <= 5 && segundosRestantes > 0;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: tamano, height: tamano }}
      role="timer"
      aria-live="polite"
      aria-label={terminado ? 'Tiempo terminado' : `${segundosRestantes} segundos restantes`}
    >
      <svg className="svg-reloj -rotate-90" width={tamano} height={tamano} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radio} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${enUltimos5 ? 'pulso-suave' : ''}`}>
        {terminado ? (
          <span className="text-2xl font-black text-center leading-tight" style={{ color: '#ff3b3b' }}>
            TIEMPO
            <br />
            TERMINADO
          </span>
        ) : (
          <span className="font-black tabular-nums texto-alto-contraste" style={{ fontSize: tamano * 0.34, color }}>
            {segundosRestantes}
          </span>
        )}
      </div>
    </div>
  );
}
