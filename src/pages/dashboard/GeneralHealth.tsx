import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, CheckCircle2, PhoneCall, Stethoscope } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import BackBar from '@/components/common/BackBar';
import AudioButton from '@/components/common/AudioButton';
import DynamicIcon from '@/components/common/DynamicIcon';
import { useLanguage } from '@/context/LanguageContext';
import { runTriage, symptoms, type TriageInput } from '@/data/symptoms';
import { toTelLink } from '@/utils/phone';
import { EMERGENCY_NUMBER } from '@/data/helplines';
import type { TriageLevel } from '@/types';

type Duration = TriageInput['duration'];
type Severity = TriageInput['severity'];
const DURATIONS: Duration[] = ['days1to3', 'week', 'longer'];
const SEVERITIES: Severity[] = ['mild', 'moderate', 'severe'];

const LEVEL_META: Record<TriageLevel, { titleKey: string; descKey: string; ring: string; text: string; Icon: typeof CheckCircle2 }> = {
  green: { titleKey: 'triage.greenTitle', descKey: 'triage.greenDesc', ring: 'ring-sage-300 bg-sage-50', text: 'text-sage-700', Icon: CheckCircle2 },
  amber: { titleKey: 'triage.amberTitle', descKey: 'triage.amberDesc', ring: 'ring-amber-300 bg-amber-50', text: 'text-alert-amber', Icon: Stethoscope },
  red: { titleKey: 'triage.redTitle', descKey: 'triage.redDesc', ring: 'ring-alert-red/30 bg-alert-redBg', text: 'text-alert-red', Icon: AlertOctagon },
};

/** Dashboard — General health & elder care: rule-based triage, never a diagnosis. */
export default function GeneralHealth() {
  const { t, tp, lang } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [duration, setDuration] = useState<Duration>('days1to3');
  const [severity, setSeverity] = useState<Severity>('mild');
  const [result, setResult] = useState<ReturnType<typeof runTriage> | null>(null);

  const grouped = useMemo(() => {
    const cats: Record<string, typeof symptoms> = {};
    for (const s of symptoms) (cats[s.category] ??= []).push(s);
    return cats;
  }, []);

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const check = () => setResult(runTriage({ symptomIds: selected, duration, severity, lang }));

  const reset = () => {
    setSelected([]);
    setDuration('days1to3');
    setSeverity('mild');
    setResult(null);
  };

  return (
    <div>
      <BackBar to="/dashboard" />
      <PageHeader title={t('dashboard.general.label')} subtitle={t('dashboard.general.desc')} />

      <section className="card mb-4">
        <h2 className="text-lg font-bold">{t('dashboard.general.chooseSymptoms')}</h2>
        <div className="mt-3 space-y-4">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <p className="field-label">{t(`dashboard.general.category_${cat}`)}</p>
              <div className="flex flex-wrap gap-2">
                {list.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={selected.includes(s.id)}
                    onClick={() => toggle(s.id)}
                    className={`inline-flex min-h-tap items-center gap-2 rounded-pill px-4 text-base font-semibold ${
                      selected.includes(s.id) ? 'bg-berry-600 text-white' : 'bg-white text-berry-700 ring-1 ring-inset ring-berry-100'
                    }`}
                  >
                    <DynamicIcon name={s.icon} size={20} />
                    {tp(s.label)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="field-label">{t('dashboard.general.duration')}</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={duration === d}
                  onClick={() => setDuration(d)}
                  className={`min-h-tap rounded-pill px-4 text-base font-semibold ${
                    duration === d ? 'bg-lavender-600 text-white' : 'bg-white text-lavender-700 ring-1 ring-inset ring-lavender-100'
                  }`}
                >
                  {t(`dashboard.general.durations.${d}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="field-label">{t('dashboard.general.severity')}</p>
            <div className="flex flex-wrap gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={severity === s}
                  onClick={() => setSeverity(s)}
                  className={`min-h-tap rounded-pill px-4 text-base font-semibold ${
                    severity === s ? 'bg-lavender-600 text-white' : 'bg-white text-lavender-700 ring-1 ring-inset ring-lavender-100'
                  }`}
                >
                  {t(`dashboard.general.severities.${s}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-primary flex-1" disabled={selected.length === 0} onClick={check}>
            {t('dashboard.general.checkResults')}
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            {t('dashboard.general.reset')}
          </button>
        </div>
      </section>

      {result && <TriageCard level={result.level} guidance={result.guidance} headline={result.headline} />}

      <section className="card">
        <h2 className="text-lg font-bold">{t('dashboard.general.reminders')}</h2>
        <p className="mt-1 text-base text-ink-soft">{t('dashboard.general.ageing')}</p>
        <p className="mt-1 text-base text-ink-muted">{t('dashboard.general.caregiver')}</p>
        <Link to="/find-doctor" className="btn-secondary mt-3 w-full">
          {t('triage.findClinic')}
        </Link>
      </section>
    </div>
  );
}

function TriageCard({ level, headline, guidance }: { level: TriageLevel; headline: string; guidance: string[] }) {
  const { t } = useLanguage();
  const meta = LEVEL_META[level];
  const { Icon } = meta;
  return (
    <section className={`card mb-4 ring-1 ${meta.ring}`} role="status" aria-live="polite">
      <h2 className={`flex items-center gap-2 text-xl font-extrabold ${meta.text}`}>
        <Icon size={24} aria-hidden />
        {t(meta.titleKey)}
        {/* Colour is never the only signal — the icon + heading carry meaning. */}
      </h2>
      <p className={`mt-1 text-base ${meta.text}`}>{headline}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-ink-soft">
        {guidance.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {level === 'red' && (
          <a href={toTelLink(EMERGENCY_NUMBER)} className="btn-danger">
            <PhoneCall size={20} aria-hidden /> {t('triage.callEmergency')} {EMERGENCY_NUMBER}
          </a>
        )}
        {level !== 'red' && (
          <Link to="/find-doctor" className="btn-primary">
            {t('triage.findClinic')}
          </Link>
        )}
        <AudioButton text={`${headline}. ${guidance.join(' ')}`} />
      </div>
      <p className="mt-3 text-sm text-ink-muted">{t('triage.disclaimer')}</p>
    </section>
  );
}
