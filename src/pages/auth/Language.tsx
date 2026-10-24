import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import AuthShell from '@/components/layout/AuthShell';
import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES } from '@/i18n';
import { nativeNames } from '@/components/layout/nav';
import type { Language } from '@/types';

/** Step 3: choose a language, then enter the app. */
export default function LanguagePage() {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Language>(lang);

  const confirm = () => {
    setLang(selected);
    navigate('/home', { replace: true });
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold text-ink">{t('languageSelect.title')}</h1>
      <p className="mt-2 text-base text-ink-soft">{t('languageSelect.intro')}</p>

      <ul className="mt-6 space-y-3" role="radiogroup" aria-label={t('languageSelect.title')}>
        {LANGUAGES.map((l) => (
          <li key={l.code}>
            <button
              type="button"
              role="radio"
              aria-checked={selected === l.code}
              onClick={() => setSelected(l.code)}
              className={`flex min-h-tap w-full items-center justify-between rounded-2xl border-2 bg-white px-5 py-4 text-left transition-colors ${
                selected === l.code ? 'border-berry-500 bg-berry-50' : 'border-berry-100 hover:border-berry-300'
              }`}
            >
              <span>
                <span className="block text-xl font-bold text-ink">{nativeNames[l.code]}</span>
                <span className="block text-sm text-ink-muted">{l.label}</span>
              </span>
              {selected === l.code && <Check size={26} className="text-berry-600" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="btn-primary mt-8 w-full" onClick={confirm}>
        {t('languageSelect.continue')}
      </button>
    </AuthShell>
  );
}
