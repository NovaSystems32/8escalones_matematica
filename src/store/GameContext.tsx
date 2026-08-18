import { createContext, useContext, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from 'react';
import type { GameState } from '../types';
import { type GameAction, estadoInicial, gameReducer } from '../game/gameReducer';

const STORAGE_KEY = 'ocho-escalones-partida-v1';
const CHANNEL_NAME = 'ocho-escalones-partida';

function cargarEstado(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return estadoInicial();
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || typeof parsed !== 'object' || !parsed.configuracion) return estadoInicial();
    return parsed;
  } catch {
    return estadoInicial();
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, cargarEstado);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipBroadcast = useRef(false);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const canal = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = canal;
    canal.onmessage = (evento: MessageEvent<{ tipo: string; payload: GameState }>) => {
      if (evento.data?.tipo === 'estado') {
        skipBroadcast.current = true;
        dispatch({ type: 'HYDRATE', state: evento.data.payload });
      }
    };
    return () => canal.close();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (skipBroadcast.current) {
      skipBroadcast.current = false;
      return;
    }
    channelRef.current?.postMessage({ tipo: 'estado', payload: state });
  }, [state]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider');
  return ctx;
}

export function hayPartidaGuardada(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as GameState;
    return parsed.fase === 'jugando' || parsed.fase === 'desempate';
  } catch {
    return false;
  }
}
