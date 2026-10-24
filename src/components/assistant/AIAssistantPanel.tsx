import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { uid } from '@/utils/id';
import { useLanguage } from '@/context/LanguageContext';
import { useUi } from '@/context/UiContext';
import { askAssistant } from '@/services/ai';
import { EMERGENCY_NUMBER } from '@/data/helplines';
import AudioButton from '@/components/common/AudioButton';
import VoiceButton from '@/components/common/VoiceButton';

/**
 * The highlighted AI health assistant. Opens over any page. Safety-first:
 * emergency detection runs before ordinary conversation and interrupts with a
 * prominent call action. Demo mode is always labelled; we never claim a live
 * model is connected.
 */
export default function AIAssistantPanel() {
  const { lang, t } = useLanguage();
  const { assistantOpen, closeAssistant } = useUi();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (assistantOpen && messages.length === 0) {
      setMessages([{ id: uid('m_'), role: 'assistant', text: t('assistant.intro'), createdAt: new Date().toISOString() }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, busy]);

  if (!assistantOpen) return null;

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((m) => [...m, { id: uid('m_'), role: 'user', text, createdAt: new Date().toISOString() }]);
    setBusy(true);
    const answer = await askAssistant(text, lang);
    setMessages((m) => [
      ...m,
      {
        id: uid('m_'),
        role: 'assistant',
        text: answer.text,
        emergency: answer.emergency ?? undefined,
        visualId: answer.visualId,
        demo: answer.demo,
        createdAt: new Date().toISOString(),
      },
    ]);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={t('assistant.title')}>
      <button type="button" aria-label={t('common.close')} className="flex-1 bg-ink/40" onClick={closeAssistant} />
      <div className="flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl">
        <div className="flex items-center gap-2 bg-berry-600 px-4 py-3 text-white">
          <Sparkles size={22} aria-hidden />
          <h2 className="flex-1 text-lg font-bold">{t('assistant.title')}</h2>
          <button
            type="button"
            onClick={() => setMessages([])}
            className="min-h-tap min-w-tap rounded-full hover:bg-white/15"
            aria-label={t('assistant.clearChat')}
            title={t('assistant.clearChat')}
          >
            <RotateCcw size={20} aria-hidden />
          </button>
          <button type="button" onClick={closeAssistant} className="min-h-tap min-w-tap rounded-full hover:bg-white/15" aria-label={t('common.close')}>
            <X size={22} aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-berry-100 px-4 py-2 text-ink">
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="mr-auto max-w-[90%] space-y-2">
                {m.emergency ? (
                  <div className="rounded-2xl bg-alert-redBg p-3 ring-1 ring-alert-red/30">
                    <p className="text-lg font-extrabold text-alert-red">{m.emergency.headline}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-alert-red">
                      {m.emergency.guidance.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                    <a href={`tel:${EMERGENCY_NUMBER}`} className="btn-danger mt-3 w-full">
                      <PhoneCall size={20} aria-hidden />
                      {t('triage.callEmergency')} {EMERGENCY_NUMBER}
                    </a>
                  </div>
                ) : (
                  <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-ink shadow-card">
                    <p className="text-base">{m.text}</p>
                    {m.demo && <p className="mt-1 text-xs text-ink-muted">{t('assistant.demoMode')}</p>}
                    <div className="mt-2 flex gap-2">
                      <AudioButton text={m.text} />
                    </div>
                  </div>
                )}
              </div>
            ),
          )}
          {busy && <p className="text-sm text-ink-muted">{t('assistant.processing')}</p>}
          <div ref={endRef} />
        </div>

        <div className="border-t border-berry-100 bg-white p-3">
          <p className="mb-2 text-xs text-ink-muted">{t('assistant.disclaimer')}</p>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <div className="flex-1">
              <label className="sr-only" htmlFor="assistant-input">
                {t('assistant.placeholder')}
              </label>
              <textarea
                id="assistant-input"
                className="input max-h-28"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('assistant.placeholder')}
              />
              <div className="mt-2">
                <VoiceButton onResult={(text) => void send(text)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={busy || !input.trim()} aria-label={t('assistant.send')}>
              <Send size={20} aria-hidden />
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-ink-muted">
            {t('triage.disclaimer')}{' '}
            <Link to="/find-doctor" className="link" onClick={closeAssistant}>
              {t('findDoctor.title')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
