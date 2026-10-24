import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import LanguageSelector from './LanguageSelector';
import PrivacyQuickExit from './PrivacyQuickExit';

/** Route -> page-title key. Falls back to the brand name. */
const TITLES: Record<string, string> = {
  '/home': 'app.name',
  '/about': 'about.title',
  '/awareness': 'awareness.title',
  '/find-doctor': 'findDoctor.title',
  '/wellness-journal': 'journal.title',
  '/safety': 'safety.title',
  '/dashboard': 'dashboard.title',
  '/settings': 'settings.title',
};

function titleKeyFor(path: string): string {
  const exact = TITLES[path];
  if (exact) return exact;
  if (path.startsWith('/dashboard/')) return 'dashboard.title';
  return 'app.name';
}

/**
 * Consistent app header: logo, current page title, language selector, a
 * highlighted AI assistant launcher (top-right), and the privacy quick-exit.
 */
export default function Header() {
  const { t } = useLanguage();
  const { openAssistant } = useUi();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2">
        <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold leading-tight text-berry-700">{t('app.name')}</p>
          <p className="truncate text-xs text-ink-muted">{t(titleKeyFor(pathname))}</p>
        </div>

        <button
          type="button"
          onClick={openAssistant}
          aria-label={t('header.assistant')}
          title={t('header.assistantHint')}
          className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-pill bg-berry-600 text-white shadow-card hover:bg-berry-700"
        >
          <Sparkles size={22} aria-hidden />
        </button>

        <LanguageSelector />
        <PrivacyQuickExit />
      </div>
    </header>
  );
}
