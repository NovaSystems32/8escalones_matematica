import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Question } from '../types';
import preguntasPorDefecto from '../data/questions.default.json';

const STORAGE_KEY = 'ocho-escalones-banco-v1';
const CHANNEL_NAME = 'ocho-escalones-banco';

const BANCO_INICIAL = preguntasPorDefecto as Question[];

function cargarDesdeStorage(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BANCO_INICIAL;
    const parsed = JSON.parse(raw) as Question[];
    if (!Array.isArray(parsed) || parsed.length === 0) return BANCO_INICIAL;
    return parsed;
  } catch {
    return BANCO_INICIAL;
  }
}

interface QuestionBankContextValue {
  banco: Question[];
  agregarPregunta: (p: Omit<Question, 'id'>) => void;
  editarPregunta: (id: string, cambios: Partial<Question>) => void;
  eliminarPregunta: (id: string) => void;
  toggleActiva: (id: string) => void;
  importarBanco: (preguntas: Question[]) => void;
  exportarBanco: () => Question[];
  restaurarBancoInicial: () => void;
}

const QuestionBankContext = createContext<QuestionBankContextValue | null>(null);

export function validarPregunta(p: Partial<Question>): string | null {
  if (!p.enunciado || !p.enunciado.trim()) return 'La pregunta necesita un enunciado.';
  if (!p.opciones || p.opciones.length !== 4 || p.opciones.some((o) => !o || !o.trim())) {
    return 'La pregunta debe tener exactamente cuatro opciones completas.';
  }
  if (p.respuestaCorrecta === undefined || p.respuestaCorrecta === null || ![0, 1, 2, 3].includes(p.respuestaCorrecta)) {
    return 'Debés indicar cuál opción es la respuesta correcta.';
  }
  if (!p.escalon || p.escalon < 1 || p.escalon > 8) return 'El escalón debe estar entre 1 y 8.';
  return null;
}

export function QuestionBankProvider({ children }: { children: ReactNode }) {
  const [banco, setBanco] = useState<Question[]>(() => cargarDesdeStorage());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipBroadcast = useRef(false);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const canal = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = canal;
    canal.onmessage = (evento: MessageEvent<{ tipo: string; payload: Question[] }>) => {
      if (evento.data?.tipo === 'banco') {
        skipBroadcast.current = true;
        setBanco(evento.data.payload);
      }
    };
    return () => canal.close();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banco));
    if (skipBroadcast.current) {
      skipBroadcast.current = false;
      return;
    }
    channelRef.current?.postMessage({ tipo: 'banco', payload: banco });
  }, [banco]);

  const agregarPregunta = useCallback((p: Omit<Question, 'id'>) => {
    const nueva: Question = { ...p, id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` };
    setBanco((prev) => [...prev, nueva]);
  }, []);

  const editarPregunta = useCallback((id: string, cambios: Partial<Question>) => {
    setBanco((prev) => prev.map((q) => (q.id === id ? { ...q, ...cambios } : q)));
  }, []);

  const eliminarPregunta = useCallback((id: string) => {
    setBanco((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const toggleActiva = useCallback((id: string) => {
    setBanco((prev) => prev.map((q) => (q.id === id ? { ...q, activa: !q.activa } : q)));
  }, []);

  const importarBanco = useCallback((preguntas: Question[]) => {
    setBanco(preguntas);
  }, []);

  const exportarBanco = useCallback(() => banco, [banco]);

  const restaurarBancoInicial = useCallback(() => {
    setBanco(BANCO_INICIAL);
  }, []);

  const value = useMemo(
    () => ({
      banco,
      agregarPregunta,
      editarPregunta,
      eliminarPregunta,
      toggleActiva,
      importarBanco,
      exportarBanco,
      restaurarBancoInicial,
    }),
    [banco, agregarPregunta, editarPregunta, eliminarPregunta, toggleActiva, importarBanco, exportarBanco, restaurarBancoInicial]
  );

  return <QuestionBankContext.Provider value={value}>{children}</QuestionBankContext.Provider>;
}

export function useQuestionBank(): QuestionBankContextValue {
  const ctx = useContext(QuestionBankContext);
  if (!ctx) throw new Error('useQuestionBank debe usarse dentro de QuestionBankProvider');
  return ctx;
}
