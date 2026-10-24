import type { Language } from '@/types';
import en, { type Dictionary } from './dictionaries/en';
import hi from './dictionaries/hi';
import kn from './dictionaries/kn';

export const LANGUAGES: { code: Language; native: string; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', native: 'English', label: 'English', dir: 'ltr' },
  { code: 'hi', native: 'हिन्दी', label: 'Hindi', dir: 'ltr' },
  { code: 'kn', native: 'ಕನ್ನಡ', label: 'Kannada', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

const dictionaries: Record<Language, Dictionary> = { en, hi, kn };

export function isLanguage(value: string | undefined | null): value is Language {
  return value === 'en' || value === 'hi' || value === 'kn';
}

/** Resolve a dot path like "home.blocks.about.title" against a dictionary. */
function lookup(obj: unknown, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : undefined;
}

export type TranslateVars = Record<string, string | number>;

/**
 * Translate a key for a language, interpolating {vars}. Falls back to English,
 * then to the raw key, so the UI never shows a blank where a label belongs.
 */
export function translate(lang: Language, key: string, vars?: TranslateVars): string {
  let str = lookup(dictionaries[lang], key) ?? lookup(en, key) ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

export type TFunction = (key: string, vars?: TranslateVars) => string;
