import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SESSION, type SessionConfig } from '../lib/session';
import { STORAGE_PREFIX } from '../lib/config';

const KEY = `${STORAGE_PREFIX}session`;

interface SessionValue {
  config: SessionConfig;
  setConfig: (next: SessionConfig) => void;
  update: (patch: Partial<SessionConfig>) => void;
  /** Chicken-outs used in the current outing (resets when a new session starts). */
  skipsUsed: number;
  recordSkip: () => void;
  resetSkips: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

function load(): SessionConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SESSION, ...JSON.parse(raw) };
  } catch {
    /* ignore malformed storage */
  }
  return DEFAULT_SESSION;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SessionConfig>(load);
  // Skip budget is intentionally in-memory: a fresh outing (page load or new
  // session) hands you back your chicken-outs.
  const [skipsUsed, setSkipsUsed] = useState(0);

  const recordSkip = useCallback(() => setSkipsUsed((n) => n + 1), []);
  const resetSkips = useCallback(() => setSkipsUsed(0), []);

  const persist = (next: SessionConfig) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  const setConfig = useCallback((next: SessionConfig) => {
    setConfigState(next);
    persist(next);
  }, []);

  const update = useCallback(
    (patch: Partial<SessionConfig>) =>
      setConfigState((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      }),
    []
  );

  const value = useMemo(
    () => ({ config, setConfig, update, skipsUsed, recordSkip, resetSkips }),
    [config, setConfig, update, skipsUsed, recordSkip, resetSkips]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
