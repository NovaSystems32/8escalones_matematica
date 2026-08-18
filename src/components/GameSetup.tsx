import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { ParticipantEditor, type ParticipanteEditable } from './ParticipantEditor';
import { PARTICIPANT_COLORS } from '../data/categories';
import { CONFIG_POR_DEFECTO } from '../game/gameReducer';
import type { Configuracion } from '../types';

const TIEMPOS: Configuracion['tiempoSegundos'][] = [15, 20, 30, 45, 60];

function participantesIniciales(): ParticipanteEditable[] {
  return Array.from({ length: 5 }, (_, i) => ({ nombre: '', color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }));
}

export function GameSetup() {
  const { dispatch } = useGame();
  const navigate = useNavigate();

  const [institucion, setInstitucion] = useState('');
  const [docente, setDocente] = useState('');
  const [participantes, setParticipantes] = useState<ParticipanteEditable[]>(participantesIniciales());
  const [tiempoSegundos, setTiempoSegundos] = useState<Configuracion['tiempoSegundos']>(CONFIG_POR_DEFECTO.tiempoSegundos);
  const [sonidoActivado, setSonidoActivado] = useState(true);
  const [vozActivada, setVozActivada] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function cambiarParticipante(indice: number, cambios: Partial<ParticipanteEditable>) {
    setParticipantes((prev) => prev.map((p, i) => (i === indice ? { ...p, ...cambios } : p)));
  }

  function moverParticipante(indice: number, direccion: -1 | 1) {
    setParticipantes((prev) => {
      const destino = indice + direccion;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  }

  function iniciar() {
    const nombresCompletos = participantes.map((p, i) => p.nombre.trim() || `Participante ${i + 1}`);
    const sinDuplicados = new Set(nombresCompletos.map((n) => n.toLowerCase()));
    if (sinDuplicados.size !== nombresCompletos.length) {
      setError('Los nombres de los participantes deben ser distintos entre sí.');
      return;
    }
    setError(null);
    dispatch({
      type: 'INICIAR_PARTIDA',
      nombres: nombresCompletos,
      colores: participantes.map((p) => p.color),
      config: {
        institucion: institucion.trim(),
        docente: docente.trim(),
        tiempoSegundos,
        sonidoActivado,
        vozActivada,
        animacionesReducidas: false,
      },
    });
    navigate('/control');
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-8 sm:py-12 max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <p className="text-[var(--dorado)] font-black tracking-widest uppercase text-sm">Configuración de la partida</p>
        <h1 className="titulo-show text-3xl sm:text-5xl mt-2">
          LOS <span className="numero-8">8</span> ESCALONES
          <br />
          DE LA MATEMÁTICA
        </h1>
      </header>

      <section className="panel-vidrio rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="font-black text-lg mb-3">Datos generales (opcional)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="institucion" className="text-sm font-bold text-[var(--texto-suave)]">
              Institución
            </label>
            <input
              id="institucion"
              type="text"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
              placeholder="Nombre de la escuela"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="docente" className="text-sm font-bold text-[var(--texto-suave)]">
              Docente
            </label>
            <input
              id="docente"
              type="text"
              value={docente}
              onChange={(e) => setDocente(e.target.value)}
              className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
              placeholder="Nombre de la docente o el docente"
            />
          </div>
        </div>
      </section>

      <section className="panel-vidrio rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="font-black text-lg mb-3">Participantes y orden de participación</h2>
        <ParticipantEditor participantes={participantes} onCambiar={cambiarParticipante} />
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm font-bold text-[var(--texto-suave)]">Orden de turnos</p>
          <ol className="flex flex-col gap-2">
            {participantes.map((p, i) => (
              <li key={i} className="flex items-center gap-2 panel-vidrio rounded-lg px-3 py-2">
                <span className="font-black w-6 text-center">{i + 1}</span>
                <span className="flex-1 font-semibold truncate">{p.nombre || `Participante ${i + 1}`}</span>
                <button
                  type="button"
                  className="boton-show px-3 py-1 text-sm"
                  disabled={i === 0}
                  onClick={() => moverParticipante(i, -1)}
                  aria-label={`Mover a ${p.nombre || 'participante ' + (i + 1)} hacia arriba`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="boton-show px-3 py-1 text-sm"
                  disabled={i === participantes.length - 1}
                  onClick={() => moverParticipante(i, 1)}
                  aria-label={`Mover a ${p.nombre || 'participante ' + (i + 1)} hacia abajo`}
                >
                  ↓
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="panel-vidrio rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="font-black text-lg mb-3">Tiempo, sonido y voz</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-[var(--texto-suave)]">Tiempo para responder</span>
            <div className="flex gap-2 flex-wrap">
              {TIEMPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`boton-show text-sm ${tiempoSegundos === t ? 'boton-primario' : ''}`}
                  aria-pressed={tiempoSegundos === t}
                  onClick={() => setTiempoSegundos(t)}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="boton-show text-sm"
            aria-pressed={sonidoActivado}
            onClick={() => setSonidoActivado((v) => !v)}
          >
            {sonidoActivado ? '🔊 Sonido activado' : '🔇 Sonido desactivado'}
          </button>
          <button
            type="button"
            className="boton-show text-sm"
            aria-pressed={vozActivada}
            onClick={() => setVozActivada((v) => !v)}
          >
            {vozActivada ? '🗣 Voz activada' : '🚫 Voz desactivada'}
          </button>
        </div>
      </section>

      {error && (
        <p role="alert" className="text-red-300 font-bold text-center mb-4">
          {error}
        </p>
      )}

      <div className="flex justify-center">
        <button type="button" onClick={iniciar} className="boton-show boton-dorado text-lg px-8 py-4">
          🚀 Comenzar partida
        </button>
      </div>
    </div>
  );
}
