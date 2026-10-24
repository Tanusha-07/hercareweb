import { useMemo, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import BackBar from '@/components/common/BackBar';
import AudioButton from '@/components/common/AudioButton';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi } from '@/context/UiContext';
import { infant, maternal } from '@/services/records';
import { toTelLink } from '@/utils/phone';
import { EMERGENCY_NUMBER } from '@/data/helplines';
import { formatDate, todayISO } from '@/utils/date';
import type { InfantRecordType, MaternalRecordType } from '@/types';

const maternalTypes: MaternalRecordType[] = ['bp', 'weight', 'iron', 'appointment', 'milestone'];
const infantTypes: InfantRecordType[] = ['feeding', 'sleep', 'vaccination', 'growth', 'milestone', 'appointment'];

const warningSigns: { en: string; hi: string; kn: string }[] = [
  {
    en: 'Heavy vaginal bleeding or fluid leaking',
    hi: 'योनि से अधिक रक्तस्राव या तरल रिसना',
    kn: 'ಯೋನಿಯಿಂದ ಅಧಿಕ ರಕ್ತಸ್ರಾವ ಅಥವಾ ದ್ರವ ಸ್ರವಿಸುವುದು',
  },
  {
    en: 'Severe headache, blurred vision or swelling of face/hands',
    hi: 'तेज़ सिरदर्द, धुंधली दृष्टि या चेहरे/हाथों की सूजन',
    kn: 'ತೀವ್ರ ತಲೆನೋವು, ಮಂಜುಗಾಣಿಕೆ ಅಥವಾ ಮುಖ/ಕೈ ಊತ',
  },
  {
    en: 'Fits or feeling faint',
    hi: 'दौरा पड़ना या बेहोशी जैसा लगना',
    kn: 'ಸವಲೆ ಬರುವುದು ಅಥವಾ ಮೂರ್ಛೆ ಇರುವುದು',
  },
  {
    en: 'Baby moving much less than usual, or not at all',
    hi: 'शिशु के सामान्य से बहुत कम या बिल्कुल न हिलना',
    kn: 'ಮಗು ಸಾಮಾನ್ಯಕ್ಕಿಂತ ತುಂಬಾ ಕಡಿಮೆ ಅಥವಾ ಎಂದೂ ಅಲುಗಾಡದಿರುವುದು',
  },
  {
    en: 'Fever, or pain that will not ease',
    hi: 'बुखार, या जो दर्द कम न हो',
    kn: 'ಜ್ವರ, ಅಥವಾ ಕಡಿಮೆಯಾಗದ ನೋವು',
  },
];

/** Dashboard — Pregnancy & newborn care (mother + baby trackers). */
export default function Pregnancy() {
  const { t, tp } = useLanguage();
  const { user } = useAuth();
  const { toast } = useUi();
  const [tab, setTab] = useState<'mother' | 'baby'>('mother');
  const [refresh, setRefresh] = useState(0);

  const momRows = useMemo(() => (user ? maternal.all(user.id) : []), [user, refresh]);
  const babyRows = useMemo(() => (user ? infant.all(user.id) : []), [user, refresh]);

  if (!user) return null;
  const bump = () => setRefresh((n) => n + 1);

  return (
    <div>
      <BackBar to="/dashboard" />
      <PageHeader title={t('dashboard.pregnancy.label')} subtitle={t('dashboard.pregnancy.desc')} />

      {/* Warning signs (always visible, safety-first) */}
      <section className="card mb-4 bg-alert-redBg ring-1 ring-alert-red/25">
        <h2 className="text-lg font-extrabold text-alert-red">{t('dashboard.pregnancy.warningSigns')}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-alert-red">
          {warningSigns.map((w, i) => (
            <li key={i}>{tp(w)}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={toTelLink(EMERGENCY_NUMBER)} className="btn-danger">
            {t('triage.callEmergency')} {EMERGENCY_NUMBER}
          </a>
          <AudioButton text={warningSigns.map((w) => tp(w)).join('. ')} />
        </div>
      </section>

      <div className="mb-4 flex gap-2" role="tablist" aria-label={t('dashboard.pregnancy.label')}>
        {(['mother', 'baby'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`inline-flex min-h-tap flex-1 items-center justify-center rounded-pill px-4 text-base font-semibold ${
              tab === k ? 'bg-berry-600 text-white' : 'bg-white text-berry-700 ring-1 ring-inset ring-berry-100'
            }`}
          >
            {k === 'mother' ? t('dashboard.pregnancy.maternalTracker') : t('dashboard.pregnancy.infantTracker')}
          </button>
        ))}
      </div>

      {tab === 'mother' ? (
        <Tracker
          rows={momRows.map((r) => ({ id: r.id, type: r.type, date: r.date, value: r.value, note: r.note }))}
          types={maternalTypes}
          labelFor={(type) => t(`dashboard.pregnancy.${type}`)}
          onAdd={(type, date, value, note) => {
            maternal.add(user.id, { type: type as MaternalRecordType, date, value: value || undefined, note: note || undefined });
            toast(t('common.done'), 'success');
            bump();
          }}
          onDelete={(id) => {
            maternal.remove(user.id, id);
            bump();
          }}
        />
      ) : (
        <Tracker
          rows={babyRows.map((r) => ({ id: r.id, type: r.type, date: r.date, value: r.value, note: r.note }))}
          types={infantTypes}
          labelFor={(type) => t(`dashboard.pregnancy.${type}`)}
          onAdd={(type, date, value, note) => {
            infant.add(user.id, { type: type as InfantRecordType, date, value: value || undefined, note: note || undefined });
            toast(t('common.done'), 'success');
            bump();
          }}
          onDelete={(id) => {
            infant.remove(user.id, id);
            bump();
          }}
        />
      )}
    </div>
  );
}

interface Row {
  id: string;
  type: string;
  date: string;
  value?: string;
  note?: string;
}

function Tracker({
  rows,
  types,
  labelFor,
  onAdd,
  onDelete,
}: {
  rows: Row[];
  types: string[];
  labelFor: (type: string) => string;
  onAdd: (type: string, date: string, value: string, note: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [type, setType] = useState(types[0]);
  const [date, setDate] = useState(todayISO());
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  return (
    <div>
      <div className="card mb-4 space-y-3">
        <h2 className="text-lg font-bold">{t('dashboard.pregnancy.addMeasurement')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">{t('dashboard.pregnancy.postpartum')}</span>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((ty) => (
                <option key={ty} value={ty}>
                  {labelFor(ty)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t('dashboard.pregnancy.dueDate')}</span>
            <input type="date" className="input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <label className="block">
          <span className="field-label">{t('common.add')} ({t('common.optional')})</span>
          <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 120/80, 55 kg" />
        </label>
        <label className="block">
          <span className="field-label">{t('dashboard.periods.logSymptoms')}</span>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            onAdd(type, date, value, note);
            setValue('');
            setNote('');
          }}
        >
          {t('dashboard.pregnancy.addMeasurement')}
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="card text-center text-ink-muted">{t('empty.generic')}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="card flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-bold text-ink">{labelFor(r.type)}</p>
                <p className="text-sm text-ink-muted">
                  {formatDate(r.date)}
                  {r.value ? ` · ${r.value}` : ''}
                  {r.note ? ` — ${r.note}` : ''}
                </p>
              </div>
              <button type="button" className="link text-sm" onClick={() => onDelete(r.id)}>
                {t('common.delete')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
