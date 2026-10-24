import type { Language } from '@/types';

/**
 * Speech provider abstraction.
 *
 * Uses the browser's built-in speechSynthesis (output) and SpeechRecognition
 * (input) where available. The BCP-47 locale map is the seam for plugging in a
 * richer Indian-language speech provider later — callers do not change.
 *
 * We never claim a language is supported for voice unless the browser reports
 * a matching voice; unsupported input falls back to text entry (see hooks).
 */

export const SPEECH_LOCALES: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
};

export function speechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export type SpeakControls = { stop: () => void };

/**
 * Speak text aloud in the given language. Returns a handle with stop().
 * If no voice matches the locale, still attempts with the default voice so the
 * user hears something; the UI labels this honestly as best-effort.
 */
export function speak(text: string, lang: Language, onEnd?: () => void): SpeakControls {
  if (!speechSynthesisSupported()) {
    onEnd?.();
    return { stop: () => undefined };
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = SPEECH_LOCALES[lang];
  utter.rate = 0.95;
  const match = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(SPEECH_LOCALES[lang].slice(0, 2).toLowerCase()));
  if (match) utter.voice = match;
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();
  synth.speak(utter);
  return {
    stop: () => synth.cancel(),
  };
}

export function stopSpeaking(): void {
  if (speechSynthesisSupported()) window.speechSynthesis.cancel();
}

/** Minimal shape of the browser SpeechRecognition we rely on. */
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

function createRecognition(): RecognitionLike | null {
  if (!speechRecognitionSupported()) return null;
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export interface ListenOptions {
  lang: Language;
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

/** Start a one-shot listen session. Returns a stop() handle, or null if unsupported. */
export function listen(opts: ListenOptions): (() => void) | null {
  const rec = createRecognition();
  if (!rec) return null;
  rec.lang = SPEECH_LOCALES[opts.lang];
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
    opts.onResult(text);
  };
  rec.onerror = (e) => opts.onError(e.error ?? 'error');
  rec.onend = () => opts.onEnd();
  try {
    rec.start();
  } catch {
    opts.onError('not-allowed');
    return null;
  }
  return () => rec.stop();
}
