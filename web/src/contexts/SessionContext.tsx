import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_SESSION,
  DEFAULT_RANGES,
  clampRange,
  type RangePrefs,
  type SessionConfig,
  type Transport,
  type TransportRange,
} from '../lib/session';
import { STORAGE_PREFIX } from '../lib/config';

const KEY = `${STORAGE_PREFIX}session`;
const RANGE_KEY = `${STORAGE_PREFIX}ranges`;

interface SessionValue {
  config: SessionConfig;
  setConfig: (next: SessionConfig) => void;
  update: (patch: Partial<SessionConfig>) => void;
  /** How far the wheel may send you, per transport mode — the user's to set. */
  ranges: RangePrefs;
  setRange: (transport: Transport, range: TransportRange) => void;
  resetRanges: () => void;
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

function loadRanges(): RangePrefs {
  try {
    const raw = localStorage.getItem(RANGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Partial<RangePrefs>;
      const merged = { ...DEFAULT_RANGES, ...stored };
      // Stored values predate the current limits, so re-clamp on the way in.
      return {
        walk: clampRange('walk', merged.walk),
        bike: clampRange('bike', merged.bike),
        car: clampRange('car', merged.car),
      };
    }
  } catch {
    /* ignore malformed storage */
  }
  return DEFAULT_RANGES;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SessionConfig>(load);
  const [ranges, setRangesState] = useState<RangePrefs>(loadRanges);
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

  const persistRanges = (next: RangePrefs) => {
    try {
      localStorage.setItem(RANGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  const setRange = useCallback((transport: Transport, range: TransportRange) => {
    setRangesState((prev) => {
      const next = { ...prev, [transport]: clampRange(transport, range) };
      persistRanges(next);
      return next;
    });
  }, []);

  const resetRanges = useCallback(() => {
    setRangesState(DEFAULT_RANGES);
    persistRanges(DEFAULT_RANGES);
  }, []);

  const value = useMemo(
    () => ({
      config,
      setConfig,
      update,
      ranges,
      setRange,
      resetRanges,
      skipsUsed,
      recordSkip,
      resetSkips,
    }),
    [config, setConfig, update, ranges, setRange, resetRanges, skipsUsed, recordSkip, resetSkips]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
