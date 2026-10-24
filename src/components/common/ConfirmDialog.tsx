import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible modal confirmation for destructive actions. */
export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, danger, onConfirm, onCancel }: Props) {
  const { t } = useLanguage();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="presentation" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="card w-full max-w-sm animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-xl font-bold">
          {title}
        </h2>
        <p className="mt-2 text-base text-ink-soft">{message}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`${danger ? 'btn-danger' : 'btn-primary'} flex-1`}
            onClick={onConfirm}
          >
            {confirmLabel ?? t('common.yes')}
          </button>
        </div>
      </div>
    </div>
  );
}
