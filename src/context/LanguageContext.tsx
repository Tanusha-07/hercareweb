import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language } from '@/types';
import { KEYS, storage } from '@/utils/storage';
import { DEFAULT_LANGUAGE, isLanguage, translate, type TFunction, type TranslateVars } from '@/i18n';
import { setLanguage as persistProfileLanguage } from '@/services/auth';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TFunction;
  /** Convenience for localized content objects. */
  tp: (text: Record<Language, string>, vars?: TranslateVars) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function initialLang(): Language {
  const saved = typeof localStorage !== 'undefined' ? storage.get<string>(KEYS.language, '') : '';
  return isLanguage(saved) ? saved : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(initialLang);

  // Keep <html lang> in sync for screen readers and font shaping.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    if (!isLanguage(next)) return;
    setLangState(next);
    storage.set(KEYS.language, next);
    // Persist to the profile too, if a user is signed in.
    persistProfileLanguage(next);
  }, []);

  const t = useCallback<TFunction>((key, vars) => translate(lang, key, vars), [lang]);
  const tp = useCallback(
    (text: Record<Language, string>, vars?: TranslateVars): string => {
      let str = text[lang] ?? text.en;
      if (vars) for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
      return str;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, tp }), [lang, setLang, t, tp]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
