import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { KEYS, storage } from '@/utils/storage';

export type ToastKind = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

export type TextSize = 'normal' | 'large' | 'xlarge';

interface UiContextValue {
  toasts: Toast[];
  toast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;

  assistantOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;

  textSize: TextSize;
  setTextSize: (size: TextSize) => void;

  speakByDefault: boolean;
  setSpeakByDefault: (value: boolean) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

let toastSeq = 1;

const TEXT_SIZE_ROOT: Record<TextSize, string> = {
  normal: '100%',
  large: '118%',
  xlarge: '135%',
};

export function UiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [textSize, setTextSizeState] = useState<TextSize>(() =>
    storage.get<TextSize>(`${KEYS.session}:textSize`, 'normal'),
  );
  const [speakByDefault, setSpeakByDefaultState] = useState<boolean>(() =>
    storage.get<boolean>(`${KEYS.session}:speak`, false),
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = toastSeq++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const setTextSize = useCallback((size: TextSize) => {
    setTextSizeState(size);
    storage.set(`${KEYS.session}:textSize`, size);
    document.documentElement.style.fontSize = TEXT_SIZE_ROOT[size];
  }, []);

  const setSpeakByDefault = useCallback((value: boolean) => {
    setSpeakByDefaultState(value);
    storage.set(`${KEYS.session}:speak`, value);
  }, []);

  // Apply persisted text size once on mount.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = TEXT_SIZE_ROOT[textSize];
    }
    // Run once; setTextSize keeps the DOM in sync afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({
      toasts,
      toast,
      dismissToast,
      assistantOpen,
      openAssistant: () => setAssistantOpen(true),
      closeAssistant: () => setAssistantOpen(false),
      textSize,
      setTextSize,
      speakByDefault,
      setSpeakByDefault,
    }),
    [toasts, toast, dismissToast, assistantOpen, textSize, setTextSize, speakByDefault, setSpeakByDefault],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used inside UiProvider');
  return ctx;
}
