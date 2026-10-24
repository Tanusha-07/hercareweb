import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import BackBar from '@/components/common/BackBar';
import AudioButton from '@/components/common/AudioButton';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi } from '@/context/UiContext';
import { periods } from '@/services/records';
import { symptoms } from '@/data/symptoms';
import { formatDate, todayISO } from '@/utils/date';
import type { PeriodEntry } from '@/types';

const FLOWS: PeriodEntry['flow'][] = ['light', 'medium', 'heavy'];

const hygieneTips: { en: string; hi: string; kn: string }[] = [
  {
    en: 'Change your pad or cloth every 4 to 6 hours, and wash with clean water and soap.',
    hi: 'हर 4 से 6 घंटे में नैपकिन या कपड़ा बदलें, और साफ़ पानी व साबुन से धोएँ।',
    kn: 'ಪ್ರತಿ 4 ರಿಂದ 6 ಗಂಟೆಗೆ ಪ್ಯಾಡ್/ಬಟ್ಟೆ ಬದಲಿಸಿ, ಶುಚಿ ನೀರು ಮತ್ತು ಸಾಬೂನಿನಿಂದ ತೊಳೆಯಿರಿ.',
  },
  {
    en: 'Dry reusable cloth in sunlight. Keep a clean spare folded separately.',
    hi: 'दोबारा इस्तेमाल होने वाला कपड़ा धूप में सुखाएँ। साफ़ अतिरिक्त कपड़ा अलग रखें।',
    kn: 'ಮರುಬಳಕೆ ಬಟ್ಟೆಯನ್ನು ಕಿರಣದಲ್ಲಿ ಒಣಗಿಸಿ. ಶುಚಿ ಹೆಚ್ಚುವರಿ ಬಟ್ಟೆಯನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಇಡಿ.',
  },
  {
    en: 'Rest, drink water, and use a warm compress for cramps. See a health worker for very heavy bleeding or severe pain.',
    hi: 'आराम करें, पानी पिएँ, ऐंठन के लिए सेंक का उपयोग करें। अधिक रक्तस्राव या तेज़ दर्द पर स्वास्थ्य कार्यकर्ता से मिलें।',
    kn: 'ವಿಶ್ರಾಂತಿ, ನೀರು ಕುಡಿಯಿರಿ, ಸೆಕೆಗೆ ಬಿಸಿ ಕೆಸೆ ಬಳಸಿ. ಅಧಿಕ ರಕ್ತಸ್ರಾವ ಅಥವಾ ತೀವ್ರ ನೋವಿಗೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
  },
];

/** Dashboard — Periods & menstruation tracker. */
export default function Periods() {
  const { t, tp } = useLanguage();
  const { user } = useAuth();
  const { toast } = useUi();
  const [refresh, setRefresh] = useState(0);

  const entries = useMemo(() => (user ? periods.all(user.id) : []), [user, refresh]);
  const prediction = useMemo(() => (user ? periods.predict(user.id) : null), [user, refresh]);

  if (!user) return null;

  const bump = () => setRefresh((n) => n + 1);

  const startToday = () => {
    periods.add(user.id, { start: todayISO(), symptoms: [] });
    toast(t('common.done'), 'success');
    bump();
  };

  const endOpen = () => {
    const open = entries.find((e) => !e.end);
    if (!open) return;
    periods.update(user.id, open.id, { end: todayISO() });
    bump();
  };

  const remove = (id: string) => {
    periods.remove(user.id, id);
    bump();
  };

  const toggleSymptom = (entryId: string, current: string[], symId: string) => {
    const next = current.includes(symId) ? current.filter((s) => s !== symId) : [...current, symId];
    periods.update(user.id, entryId, { symptoms: next });
    bump();
  };

  const setFlow = (entryId: string, flow: PeriodEntry['flow']) => {
    periods.update(user.id, entryId, { flow });
    bump();
  };

  const hasOpen = entries.some((e) => !e.end);

  return (
    <div>
      <BackBar to="/dashboard" />
      <PageHeader title={t('dashboard.periods.label')} subtitle={t('dashboard.periods.desc')} />

      <div className="card mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button type="button" className="btn-primary" onClick={startToday}>
          {t('dashboard.periods.periodStarted')}
        </button>
        <button type="button" className="btn-ghost" disabled={!hasOpen} onClick={endOpen}>
          {t('dashboard.periods.periodEnded')}
        </button>
      </div>

      {prediction && (
        <div className="card mb-4 bg-lavender-50">
          <h2 className="text-lg font-bold text-lavender-700">{t('dashboard.periods.timeline')}</h2>
          <p className="mt-1 text-base text-ink-soft">
            {t('dashboard.periods.nextEstimate', { date: formatDate(prediction.nextStart) })}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{t('dashboard.periods.averageCycle', { days: prediction.averageLength })}</p>
        </div>
      )}

      <section className="mb-4">
        <h2 className="mb-2 text-lg font-bold">{t('dashboard.periods.entries')}</h2>
        {entries.length === 0 ? (
          <p className="card text-center text-ink-muted">{t('dashboard.periods.noEntries')}</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li key={e.id} className="card">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-ink">
                    {formatDate(e.start)}
                    {e.end ? ` → ${formatDate(e.end)}` : ` → ${t('common.optional')}`}
                  </p>
                  <button type="button" className="link text-sm" onClick={() => remove(e.id)}>
                    {t('common.delete')}
                  </button>
                </div>

                <div className="mt-2">
                  <span className="field-label">{t('dashboard.periods.flow')}</span>
                  <div className="flex flex-wrap gap-2">
                    {FLOWS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={e.flow === f}
                        onClick={() => setFlow(e.id, f)}
                        className={`min-h-tap rounded-pill px-4 text-base font-semibold ${
                          e.flow === f ? 'bg-berry-600 text-white' : 'bg-white text-berry-700 ring-1 ring-inset ring-berry-100'
                        }`}
                      >
                        {t(`dashboard.periods.flows.${f}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <span className="field-label">{t('dashboard.periods.logSymptoms')}</span>
                  <div className="flex flex-wrap gap-2">
                    {symptoms
                      .filter((s) => s.category !== 'emergency')
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          aria-pressed={e.symptoms.includes(s.id)}
                          onClick={() => toggleSymptom(e.id, e.symptoms, s.id)}
                          className={`min-h-tap rounded-pill px-3 text-sm font-semibold ${
                            e.symptoms.includes(s.id) ? 'bg-lavender-600 text-white' : 'bg-white text-lavender-700 ring-1 ring-inset ring-lavender-100'
                          }`}
                        >
                          {tp(s.label)}
                        </button>
                      ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-bold">{t('dashboard.periods.hygiene')}</h2>
        <ul className="mt-2 space-y-2 text-base text-ink-soft">
          {hygieneTips.map((tip, i) => (
            <li key={i}>{tp(tip)}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <AudioButton text={hygieneTips.map((tip) => tp(tip)).join(' ')} />
          <Link to="/awareness" className="btn-ghost">
            {t('awareness.title')}
          </Link>
        </div>
      </section>
    </div>
  );
}
