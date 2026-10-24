import { Leaf } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';

/**
 * Privacy quick-exit. A neutral leaf button that immediately navigates to a
 * harmless in-app page (the About guide) and closes the assistant. It is a
 * client-side navigation only — it does NOT claim to clear history, close the
 * tab, or defeat monitoring. The Settings/About pages explain the limits.
 */
export default function PrivacyQuickExit() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { closeAssistant } = useUi();

  const exit = () => {
    closeAssistant();
    // Never trap the user: go to a neutral page, or home if already there.
    navigate(pathname === '/about' ? '/home' : '/about');
  };

  return (
    <button
      type="button"
      onClick={exit}
      aria-label={t('header.quickExit')}
      title={t('header.quickExitHint')}
      className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-pill bg-sage-100 text-sage-700 ring-1 ring-inset ring-sage-300 hover:bg-sage-200"
    >
      <Leaf size={22} aria-hidden />
    </button>
  );
}
