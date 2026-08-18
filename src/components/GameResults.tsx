import { useGame } from '../store/GameContext';
import { calcularEstadisticas } from '../game/resultados';
import { exportarPartidaJSON, exportarPartidaCSV, descargarArchivo } from '../game/resultados';

interface Props {
  onCerrar?: () => void;
}

export function GameResults({ onCerrar }: Props) {
  const { state } = useGame();
  const estadisticas = calcularEstadisticas(state);

  function exportarJSON() {
    descargarArchivo(exportarPartidaJSON(state), `8-escalones-partida-${Date.now()}.json`, 'application/json');
  }

  function exportarCSV() {
    descargarArchivo(exportarPartidaCSV(state.historial), `8-escalones-partida-${Date.now()}.csv`, 'text/csv');
  }

  return (
    <div className="panel-vidrio rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-black titulo-show">Resultados de la partida</h2>
        <div className="flex gap-2">
          <button type="button" className="boton-show text-sm" onClick={exportarJSON}>
            ⬇ Exportar JSON
          </button>
          <button type="button" className="boton-show text-sm" onClick={exportarCSV}>
            ⬇ Exportar CSV
          </button>
          {onCerrar && (
            <button type="button" className="boton-show text-sm" onClick={onCerrar}>
              ✕ Cerrar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-white/20 text-[var(--texto-suave)]">
              <th className="py-2 pr-3">Participante</th>
              <th className="py-2 pr-3">Escalón alcanzado</th>
              <th className="py-2 pr-3">Correctas</th>
              <th className="py-2 pr-3">Incorrectas</th>
              <th className="py-2 pr-3">% Aciertos</th>
              <th className="py-2 pr-3">Tiempo prom. (s)</th>
              <th className="py-2 pr-3">Categoría más difícil</th>
            </tr>
          </thead>
          <tbody>
            {estadisticas.map((e) => (
              <tr key={e.participante.id} className="border-b border-white/10">
                <td className="py-2 pr-3 font-bold" style={{ color: e.participante.color }}>
                  {e.participante.nombre}
                </td>
                <td className="py-2 pr-3">{e.escalonAlcanzado} / 8</td>
                <td className="py-2 pr-3 text-emerald-300">{e.correctas}</td>
                <td className="py-2 pr-3 text-red-300">{e.incorrectas}</td>
                <td className="py-2 pr-3">{e.porcentajeAciertos}%</td>
                <td className="py-2 pr-3">{e.tiempoPromedioSeg}</td>
                <td className="py-2 pr-3">{e.categoriaConMasErrores ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.historial.length === 0 && (
        <p className="text-center text-[var(--texto-suave)] mt-4">Todavía no hay respuestas registradas.</p>
      )}
    </div>
  );
}
