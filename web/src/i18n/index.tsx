import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_PREFIX } from '../lib/config';
import { en, nl } from './strings';

export type Lang = 'nl' | 'en';

const DICTS = { nl, en } as const;
const KEY = `${STORAGE_PREFIX}lang`;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Resolve a dotted key, with optional `{var}` interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function detectInitial(): Lang {
  const saved = localStorage.getItem(KEY);
  if (saved === 'nl' || saved === 'en') return saved;
  return navigator.language?.toLowerCase().startsWith('nl') ? 'nl' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(KEY, l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const parts = key.split('.');
      let node: unknown = DICTS[lang];
      for (const p of parts) {
        if (node && typeof node === 'object' && p in (node as object)) {
          node = (node as Record<string, unknown>)[p];
        } else {
          return key;
        }
      }
      if (typeof node !== 'string') return key;
      if (!vars) return node;
      return node.replace(/\{(\w+)\}/g, (_, k) =>
        k in vars ? String(vars[k]) : `{${k}}`
      );
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
