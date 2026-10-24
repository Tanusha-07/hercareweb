import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  /** Optional title shown next to the back control. */
  title?: string;
  /** Route to go back to; defaults to browser history back. */
  to?: string;
}

/** Consistent back control for detail pages, with a large tap target. */
export default function BackBar({ title, to }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => (to ? navigate(to) : navigate(-1))}
        aria-label={t('common.back')}
        className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-pill bg-white text-berry-700 ring-1 ring-inset ring-berry-100 hover:bg-berry-50"
      >
        <ArrowLeft size={22} aria-hidden />
      </button>
      {title && <h2 className="text-xl font-bold">{title}</h2>}
    </div>
  );
}
