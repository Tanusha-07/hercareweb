import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useUi, type ToastKind } from '@/context/UiContext';

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastKind, string> = {
  success: 'bg-sage-100 text-sage-700 ring-sage-300',
  error: 'bg-alert-redBg text-alert-red ring-alert-red/30',
  info: 'bg-lavender-50 text-lavender-700 ring-lavender-200',
};

/** Screen-reader-friendly toast stack rendered above everything. */
export default function Toasts() {
  const { toasts, dismissToast } = useUi();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-2 z-[60] flex flex-col items-center gap-2 px-3"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl px-4 py-3 shadow-card ring-1 ${STYLES[t.kind]}`}
          >
            <Icon size={22} className="mt-0.5 shrink-0" aria-hidden />
            <p className="flex-1 text-base font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="min-h-tap min-w-tap rounded-full p-1 hover:bg-black/5"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
