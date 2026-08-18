import { useMemo, useRef, useState } from 'react';
import type { Question } from '../types';
import { useQuestionBank, validarPregunta } from '../store/QuestionBankContext';
import { CATEGORY_LIST } from '../data/categories';
import { descargarArchivo } from '../game/resultados';

interface Props {
  onCerrar: () => void;
}

type FormularioPregunta = Omit<Question, 'id'> & { id?: string };

function preguntaVacia(escalon: number): FormularioPregunta {
  return {
    escalon: escalon as Question['escalon'],
    categoria: CATEGORY_LIST.find((c) => c.id === escalon)?.nombre ?? '',
    enunciado: '',
    opciones: ['', '', '', ''],
    respuestaCorrecta: 0,
    explicacion: '',
    dificultad: 'media',
    tiempoSugerido: 30,
    activa: true,
  };
}

export function QuestionManager({ onCerrar }: Props) {
  const { banco, agregarPregunta, editarPregunta, eliminarPregunta, toggleActiva, importarBanco, exportarBanco, restaurarBancoInicial } =
    useQuestionBank();
  const [filtroEscalon, setFiltroEscalon] = useState<number | 'todas'>('todas');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioPregunta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<string | null>(null);
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const preguntasFiltradas = useMemo(
    () => (filtroEscalon === 'todas' ? banco : banco.filter((q) => q.escalon === filtroEscalon)),
    [banco, filtroEscalon]
  );

  function empezarCreacion() {
    setEditandoId('nueva');
    setFormulario(preguntaVacia(filtroEscalon === 'todas' ? 1 : filtroEscalon));
    setError(null);
  }

  function empezarEdicion(p: Question) {
    setEditandoId(p.id);
    setFormulario({ ...p });
    setError(null);
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormulario(null);
    setError(null);
  }

  function guardar() {
    if (!formulario) return;
    const problema = validarPregunta(formulario);
    if (problema) {
      setError(problema);
      return;
    }
    if (editandoId && editandoId !== 'nueva') {
      editarPregunta(editandoId, formulario);
    } else {
      agregarPregunta(formulario);
    }
    cancelarEdicion();
  }

  function manejarImportar(archivo: File) {
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const datos = JSON.parse(String(lector.result));
        if (!Array.isArray(datos)) throw new Error('El archivo debe contener una lista de preguntas.');
        for (const p of datos) {
          const problema = validarPregunta(p);
          if (problema) throw new Error(`Pregunta inválida (${p.id ?? 'sin id'}): ${problema}`);
        }
        importarBanco(datos as Question[]);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo importar el archivo.');
      }
    };
    lector.readAsText(archivo);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="panel-vidrio rounded-2xl p-4 sm:p-6 max-w-5xl w-full my-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-black titulo-show">Banco de preguntas</h2>
          <button type="button" className="boton-show text-sm" onClick={onCerrar}>
            ✕ Cerrar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select
            value={filtroEscalon}
            onChange={(e) => setFiltroEscalon(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
            className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
            aria-label="Filtrar por escalón"
          >
            <option value="todas">Todos los escalones</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                Escalón {c.id} · {c.nombre}
              </option>
            ))}
          </select>
          <button type="button" className="boton-show text-sm" onClick={empezarCreacion}>
            ➕ Nueva pregunta
          </button>
          <button
            type="button"
            className="boton-show text-sm"
            onClick={() =>
              descargarArchivo(JSON.stringify(exportarBanco(), null, 2), `banco-preguntas-${Date.now()}.json`, 'application/json')
            }
          >
            ⬇ Exportar JSON
          </button>
          <button type="button" className="boton-show text-sm" onClick={() => inputArchivo.current?.click()}>
            ⬆ Importar JSON
          </button>
          <input
            ref={inputArchivo}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) manejarImportar(archivo);
              e.target.value = '';
            }}
          />
          <button type="button" className="boton-show text-sm" onClick={() => setConfirmarRestaurar(true)}>
            ♻ Restaurar banco inicial
          </button>
        </div>

        {error && (
          <p role="alert" className="text-red-300 font-bold mb-3">
            {error}
          </p>
        )}

        {confirmarRestaurar && (
          <div className="panel-vidrio rounded-xl p-4 mb-4 border border-red-400/40">
            <p className="mb-3">¿Restaurar el banco a las 80 preguntas originales? Se perderán los cambios personalizados.</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="boton-show boton-primario text-sm"
                onClick={() => {
                  restaurarBancoInicial();
                  setConfirmarRestaurar(false);
                }}
              >
                Sí, restaurar
              </button>
              <button type="button" className="boton-show text-sm" onClick={() => setConfirmarRestaurar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {formulario && (
          <div className="panel-vidrio rounded-xl p-4 mb-4 border border-white/20">
            <h3 className="font-black mb-3">{editandoId === 'nueva' ? 'Nueva pregunta' : 'Editar pregunta'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <label className="flex flex-col gap-1 text-sm">
                Escalón
                <select
                  value={formulario.escalon}
                  onChange={(e) =>
                    setFormulario((f) => (f ? { ...f, escalon: Number(e.target.value) as Question['escalon'] } : f))
                  }
                  className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                >
                  {CATEGORY_LIST.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Dificultad
                <select
                  value={formulario.dificultad}
                  onChange={(e) => setFormulario((f) => (f ? { ...f, dificultad: e.target.value as Question['dificultad'] } : f))}
                  className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                >
                  <option value="fácil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="difícil">Difícil</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm mb-3">
              Enunciado
              <textarea
                value={formulario.enunciado}
                onChange={(e) => setFormulario((f) => (f ? { ...f, enunciado: e.target.value } : f))}
                className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                rows={2}
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {formulario.opciones.map((op, i) => (
                <label key={i} className="flex flex-col gap-1 text-sm">
                  Opción {['A', 'B', 'C', 'D'][i]}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correcta"
                      checked={formulario.respuestaCorrecta === i}
                      onChange={() => setFormulario((f) => (f ? { ...f, respuestaCorrecta: i as 0 | 1 | 2 | 3 } : f))}
                      aria-label={`Marcar opción ${['A', 'B', 'C', 'D'][i]} como correcta`}
                    />
                    <input
                      type="text"
                      value={op}
                      onChange={(e) =>
                        setFormulario((f) => {
                          if (!f) return f;
                          const opciones = [...f.opciones] as Question['opciones'];
                          opciones[i] = e.target.value;
                          return { ...f, opciones };
                        })
                      }
                      className="flex-1 rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                </label>
              ))}
            </div>
            <label className="flex flex-col gap-1 text-sm mb-3">
              Explicación (opcional)
              <input
                type="text"
                value={formulario.explicacion ?? ''}
                onChange={(e) => setFormulario((f) => (f ? { ...f, explicacion: e.target.value } : f))}
                className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm mb-3 max-w-[200px]">
              Tiempo sugerido (segundos)
              <input
                type="number"
                min={5}
                max={120}
                value={formulario.tiempoSugerido}
                onChange={(e) => setFormulario((f) => (f ? { ...f, tiempoSugerido: Number(e.target.value) } : f))}
                className="rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white"
              />
            </label>
            <div className="flex gap-2">
              <button type="button" className="boton-show boton-primario text-sm" onClick={guardar}>
                💾 Guardar
              </button>
              <button type="button" className="boton-show text-sm" onClick={cancelarEdicion}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20 text-[var(--texto-suave)]">
                <th className="py-2 pr-3">Esc.</th>
                <th className="py-2 pr-3">Enunciado</th>
                <th className="py-2 pr-3">Correcta</th>
                <th className="py-2 pr-3">Activa</th>
                <th className="py-2 pr-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntasFiltradas.map((q) => (
                <tr key={q.id} className="border-b border-white/10 align-top">
                  <td className="py-2 pr-3 font-bold">{q.escalon}</td>
                  <td className="py-2 pr-3 max-w-[360px]">{q.enunciado}</td>
                  <td className="py-2 pr-3 text-emerald-300">{q.opciones[q.respuestaCorrecta]}</td>
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      className="boton-show text-xs"
                      onClick={() => toggleActiva(q.id)}
                      aria-pressed={q.activa}
                    >
                      {q.activa ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      <button type="button" className="boton-show text-xs" onClick={() => empezarEdicion(q)}>
                        Editar
                      </button>
                      {confirmarEliminarId === q.id ? (
                        <>
                          <button
                            type="button"
                            className="boton-show text-xs boton-primario"
                            onClick={() => {
                              eliminarPregunta(q.id);
                              setConfirmarEliminarId(null);
                            }}
                          >
                            Confirmar
                          </button>
                          <button type="button" className="boton-show text-xs" onClick={() => setConfirmarEliminarId(null)}>
                            No
                          </button>
                        </>
                      ) : (
                        <button type="button" className="boton-show text-xs" onClick={() => setConfirmarEliminarId(q.id)}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {preguntasFiltradas.length === 0 && (
            <p className="text-center text-[var(--texto-suave)] py-4">No hay preguntas para este filtro.</p>
          )}
        </div>
      </div>
    </div>
  );
}
