import { useEffect, useRef, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { speak, stopSpeaking, speechSynthesisSupported } from '@/services/speech';

interface Props {
  /** Text to read aloud (already localised). */
  text: string;
  /** Optional accessible label override. */
  label?: string;
  className?: string;
}

/**
 * Speaker button that reads important guidance aloud in the active language.
 * Offers play/stop; the browser handles pause via its own controls. Hidden when
 * speech synthesis is unavailable so we never imply a non-working feature.
 */
export default function AudioButton({ text, label, className = '' }: Props) {
  const { lang, t } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const supported = speechSynthesisSupported();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopSpeaking();
    };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speak(text, lang, () => mounted.current && setPlaying(false));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label ?? t('common.listen')}
      className={`inline-flex min-h-tap min-w-tap items-center justify-center gap-2 rounded-pill bg-berry-50 px-4 text-berry-700 hover:bg-berry-100 ${className}`}
    >
      {playing ? <Square size={20} aria-hidden /> : <Volume2 size={20} aria-hidden />}
      <span className="text-base font-semibold">{playing ? t('common.stop') : t('common.listen')}</span>
    </button>
  );
}
