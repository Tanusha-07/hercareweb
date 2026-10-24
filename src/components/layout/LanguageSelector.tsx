import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES } from '@/i18n';
import { nativeNames } from './nav';

/**
 * Compact header language picker. Shows each language in its own script and
 * applies changes instantly (no reload) via LanguageContext.
 */
export default function LanguageSelector() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.changeLanguage')}
        className="inline-flex min-h-tap items-center gap-1 rounded-pill bg-white px-3 text-sm font-semibold text-berry-700 ring-1 ring-inset ring-berry-100 hover:bg-berry-50"
      >
        <Globe size={18} aria-hidden />
        <span>{nativeNames[lang]}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            aria-label={t('common.language')}
            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl bg-white py-1 shadow-card ring-1 ring-berry-100"
          >
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className="flex min-h-tap w-full items-center justify-between gap-2 px-4 text-left text-base hover:bg-berry-50"
                >
                  <span className="font-semibold text-ink">{nativeNames[l.code]}</span>
                  <span className="text-xs text-ink-muted">{l.label}</span>
                  {l.code === lang && <Check size={18} className="text-sage-600" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
