import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSpeechInput } from '@/hooks/useSpeechInput';

interface Props {
  /** Called with the reviewed/edited transcript when the user submits. */
  onResult: (text: string) => void;
  className?: string;
}

/**
 * Microphone button with listening / processing / error states and an editable
 * transcript review step. When speech recognition is unsupported it renders
 * nothing, so callers can rely on their text input as the fallback.
 */
export default function VoiceButton({ onResult, className = '' }: Props) {
  const { lang, t } = useLanguage();
  const speech = useSpeechInput(lang);

  if (!speech.supported) return null;

  const listening = speech.phase === 'listening';

  const handleToggle = () => {
    if (listening) {
      speech.stop();
      if (speech.transcript.trim()) onResult(speech.transcript.trim());
    } else {
      speech.start();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={listening}
        aria-label={listening ? t('common.stop') : t('common.speak')}
        className={`btn ${listening ? 'btn-danger animate-fade-in' : 'btn-secondary'} ${className}`}
      >
        {listening ? <MicOff size={22} aria-hidden /> : <Mic size={22} aria-hidden />}
        <span>{listening ? t('assistant.listening') : t('common.speak')}</span>
      </button>

      {speech.error === 'unsupported' && (
        <p role="status" className="text-sm text-ink-muted">
          {t('assistant.voiceUnsupported')}
        </p>
      )}

      {speech.transcript && (
        <label className="block">
          <span className="field-label">{t('common.speak')}</span>
          <textarea
            className="input"
            rows={2}
            value={speech.transcript}
            onChange={(e) => speech.setTranscript(e.target.value)}
            aria-label={t('assistant.placeholder')}
          />
          <button type="button" className="btn-primary mt-2 w-full" onClick={() => onResult(speech.transcript.trim())}>
            {t('assistant.send')}
          </button>
        </label>
      )}
    </div>
  );
}
