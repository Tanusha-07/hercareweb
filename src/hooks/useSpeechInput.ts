import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '@/types';
import { listen, speechRecognitionSupported } from '@/services/speech';

export type SpeechPhase = 'idle' | 'listening' | 'processing' | 'error';

export interface UseSpeechInput {
  supported: boolean;
  phase: SpeechPhase;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTranscript: (text: string) => void;
}

/**
 * Voice-input hook with explicit listening / processing / error states and a
 * text fallback. The recognised transcript is returned editable so the caller
 * can let the user review it before submitting (per the brief).
 */
export function useSpeechInput(lang: Language): UseSpeechInput {
  const supported = speechRecognitionSupported();
  const [phase, setPhase] = useState<SpeechPhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<null | (() => void)>(null);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setPhase('idle');
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setPhase((p) => (p === 'listening' ? 'idle' : p));
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setPhase('error');
      setError('unsupported');
      return;
    }
    setError(null);
    setTranscript('');
    setPhase('listening');
    stopRef.current = listen({
      lang,
      onResult: (text) => {
        setTranscript(text);
        setPhase('listening');
      },
      onError: (err) => {
        setPhase('error');
        setError(err);
      },
      onEnd: () => {
        setPhase((p) => (p === 'error' ? p : 'idle'));
        stopRef.current = null;
      },
    });
    if (!stopRef.current) {
      setPhase('error');
      setError('unsupported');
    }
  }, [lang, supported]);

  useEffect(() => () => stopRef.current?.(), []);

  return { supported, phase, transcript, error, start, stop, reset, setTranscript };
}
