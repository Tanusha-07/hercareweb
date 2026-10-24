import { WifiOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useOnline } from '@/hooks/useOnline';

/** Persistent, honest offline indicator. Never claims offline calls/AI work. */
export default function OfflineBanner() {
  const online = useOnline();
  const { t } = useLanguage();
  if (online) return null;
  return (
    <div
      role="status"
      className="flex items-center gap-2 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-alert-amber"
    >
      <WifiOff size={18} aria-hidden />
      <span>{t('app.offline')}</span>
    </div>
  );
}
