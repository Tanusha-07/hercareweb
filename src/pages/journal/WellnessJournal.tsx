import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Plus, Wind } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import AudioButton from '@/components/common/AudioButton';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi } from '@/context/UiContext';
import { recovery } from '@/services/records';
import { helplines, WOMEN_HELPLINE_NUMBER } from '@/data/helplines';
import { affirmations, recoveryStories } from '@/data/content';
import { formatDate, todayISO } from '@/utils/date';
import { toTelLink } from '@/utils/phone';
import type { RecoveryLog } from '@/types';

/** Tiny non-cryptographic obfuscation. This is a privacy lock, NOT a password. */
function pinHash(pin: string): string {
  let h = 0;
  for (let i = 0; i < pin.length; i++) h = (h * 31 + pin.charCodeAt(i)) >>> 0;
  return `p${h}`;
}

type LogType = RecoveryLog['type'];
const LOG_TYPES: LogType[] = ['craving', 'anxiety', 'pain', 'sleep', 'win'];

/** Block 4 — Daily Wellness Journal: a privacy-first personal recovery tracker. */
export default function WellnessJournal() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [unlocked, setUnlocked] = useState(false);
  const [pinDraft, setPinDraft] = useState('');
  const [pinError, setPinError] = useState(false);

  const profile = useMemo(() => (user ? recovery.profile(user.id) : null), [user, unlocked]);

  // Lock gate: only if a PIN was previously set and the session is not unlocked.
  if (profile?.pinHash && !unlocked) {
    return (
      <div>
        <PageHeader title={t('journal.title')} subtitle={t('journal.lockedTitle')} />
        <div className="card space-y-4 bg-berry-50">
          <p className="text-base text-ink-soft">{t('journal.lockedIntro')}</p>
          <label className="block">
            <span className="field-label">{t('journal.lockedTitle')}</span>
            <input
              className={`input ${pinError ? 'input-error' : ''}`}
              inputMode="numeric"
              type="password"
              maxLength={4}
              value={pinDraft}
              onChange={(e) => {
                setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4));
                setPinError(false);
              }}
            />
          </label>
          {pinError && (
            <p role="alert" className="text-sm font-semibold text-alert-red">
              {t('journal.pinWrong')}
            </p>
          )}
          <button
            type="button"
            className="btn-primary w-full"
            disabled={pinDraft.length !== 4}
            onClick={() => {
              if (profile.pinHash === pinHash(pinDraft)) {
                setUnlocked(true);
                setPinDraft('');
              } else {
                setPinError(true);
              }
            }}
          >
            {t('journal.unlock')}
          </button>
          <p className="text-sm text-ink-muted">{t('journal.privacyNote')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <JournalBody key={user.id} unlocked={unlocked} />;
}

function JournalBody({ unlocked }: { unlocked: boolean }) {
  const { t, tp } = useLanguage();
  const { user } = useAuth();
  const { toast } = useUi();
  const [refresh, setRefresh] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);
  const [quitDate, setQuitDate] = useState(() => (user ? recovery.profile(user.id)?.quitDate ?? todayISO() : todayISO()));
  const [dailySpend, setDailySpend] = useState(() => (user ? recovery.profile(user.id)?.dailySpendRupees ?? 0 : 0));
  const [pinDraft, setPinDraft] = useState('');
  const [note, setNote] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [logType, setLogType] = useState<LogType>('craving');

  const profile = useMemo(() => (user ? recovery.profile(user.id) : null), [user, refresh, unlocked]);
  const logs = useMemo(() => (user ? recovery.logs(user.id) : []), [user, refresh]);
  const daysSober = useMemo(() => (user ? recovery.daysSober(user.id) : 0), [user, refresh]);
  const saved = useMemo(() => (user ? recovery.savingsRupees(user.id) : 0), [user, refresh]);

  if (!user) return null;

  const saveProfile = (patch: Partial<{ quitDate: string; dailySpendRupees: number; pinHash?: string }>) => {
    const base = recovery.profile(user.id) ?? { quitDate: todayISO(), dailySpendRupees: 0 };
    recovery.setProfile(user.id, { ...base, ...patch });
    setRefresh((n) => n + 1);
  };

  const addLog = () => {
    recovery.log(user.id, { date: todayISO(), type: logType, intensity, note: note.trim() || undefined });
    setNote('');
    setRefresh((n) => n + 1);
    toast(t('common.done'), 'success');
  };

  const todayAffirmation = affirmations[new Date().getDate() % affirmations.length];
  const breathingText = tp({
    en: 'Breathe in slowly for four counts, hold for four, and out for six. Repeat five times.',
    hi: 'চার গिनो में धीरे से साँस लें, चार रोकें, और छह में छोड़ें। पाँच बार दोहराएँ।',
    kn: 'ನಾಲ್ಕು ಎಣಿಕೆ ನಿಧಾನವಾಗಿ ಉಸಿರು ತೆಗೆದುಕೊಳ್ಳಿ, ನಾಲ್ಕು ಇಡಿ, ಆರು ಎಣಿಸಿ ಬಿಡಿ. ಐದು ಬಾರಿ ಪುನರಾವರ್ತಿಸಿ.',
  });

  return (
    <div>
      <PageHeader title={t('journal.title')} subtitle={t('journal.daysSober', { days: daysSober })} />

      {/* Privacy note */}
      <div className="card mb-4 flex items-start gap-3 bg-sage-50">
        <Leaf size={22} className="mt-0.5 shrink-0 text-sage-700" aria-hidden />
        <p className="text-sm text-sage-700">{t('journal.privacyNote')}</p>
      </div>

      {/* Progress + savings */}
      <section className="card mb-4 bg-lavender-50">
        <h2 className="text-lg font-bold">{t('journal.progress')}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-berry-50 p-4">
            <p className="text-sm text-ink-muted">{t('journal.daysSoberLabel')}</p>
            <p className="text-2xl font-extrabold text-berry-700">{daysSober}</p>
          </div>
          <div className="rounded-2xl bg-sage-50 p-4">
            <p className="text-sm text-ink-muted">{t('journal.savingsLabel')}</p>
            <p className="text-2xl font-extrabold text-sage-700">₹{saved}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">{t('journal.quitDate')}</span>
            <input
              type="date"
              className="input"
              value={quitDate}
              max={todayISO()}
              onChange={(e) => {
                setQuitDate(e.target.value);
                saveProfile({ quitDate: e.target.value });
              }}
            />
          </label>
          <label className="block">
            <span className="field-label">{t('journal.dailySpend')}</span>
            <input
              className="input"
              inputMode="numeric"
              value={dailySpend || ''}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/\D/g, ''));
                setDailySpend(v);
                saveProfile({ dailySpendRupees: v });
              }}
            />
          </label>
        </div>

        {!profile?.pinHash && (
          <div className="mt-4 border-t border-berry-100 pt-4">
            <span className="field-label">{t('journal.setPin')}</span>
            <div className="flex flex-wrap items-end gap-2">
              <input
                className="input max-w-32"
                inputMode="numeric"
                type="password"
                maxLength={4}
                placeholder="••••"
                aria-label={t('journal.setPin')}
                value={pinDraft}
                onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={pinDraft.length !== 4}
                onClick={() => {
                  saveProfile({ pinHash: pinHash(pinDraft) });
                  setPinDraft('');
                  toast(t('common.save'), 'success');
                }}
              >
                {t('journal.setPin')}
              </button>
            </div>
            <p className="mt-1 text-sm text-ink-muted">{t('journal.pinHint')}</p>
          </div>
        )}
      </section>

      {/* Today's affirmation */}
      <section className="card mb-4 bg-sage-50">
        <h2 className="text-lg font-bold">{t('journal.affirmation')}</h2>
        <p className="mt-1 text-base text-ink-soft">{tp(todayAffirmation)}</p>
        <AudioButton text={tp(todayAffirmation)} className="mt-2" />
      </section>

      {/* Log an entry */}
      <section className="card mb-4 bg-berry-50">
        <h2 className="text-lg font-bold">{t('journal.logCraving')}</h2>
        <p className="mt-1 text-base text-ink-muted">{t('journal.loggedHow')}</p>

        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t('journal.logCraving')}>
          {LOG_TYPES.map((ty) => (
            <button
              key={ty}
              type="button"
              aria-pressed={logType === ty}
              onClick={() => setLogType(ty)}
              className={`min-h-tap rounded-pill px-4 text-base font-semibold ${
                logType === ty ? 'bg-berry-600 text-white' : 'bg-white text-berry-700 ring-1 ring-inset ring-berry-100'
              }`}
            >
              {t(`journal.types.${ty}`)}
            </button>
          ))}
        </div>

        <label className="mt-3 block">
          <span className="field-label">{t('journal.progress')}</span>
          <input
            className="input"
            type="range"
            min={1}
            max={5}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            aria-label={`${t('journal.progress')} 1–5`}
          />
          <span className="text-sm text-ink-muted">{intensity} / 5</span>
        </label>

        <label className="mt-3 block">
          <span className="field-label">{t('journal.affirmation')}</span>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} />
        </label>

        <button type="button" className="btn-primary mt-3 w-full" onClick={addLog}>
          <Plus size={20} aria-hidden /> {t('common.add')}
        </button>
      </section>

      {/* Breathing / immediate coping */}
      <section className="card mb-4 bg-lavender-50">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Wind size={22} className="text-lavender-700" aria-hidden /> {t('journal.breathing')}
        </h2>
        <p className="mt-1 text-base text-ink-soft">{breathingText}</p>
        <AudioButton text={breathingText} className="mt-2" />
      </section>

      {/* Recent entries */}
      <section className="mb-4">
        <h2 className="mb-2 text-lg font-bold">{t('journal.entries')}</h2>
        <div className="rounded-card bg-cream-200 p-3">
        {logs.length === 0 ? (
          <p className="card text-center text-ink-muted">{t('empty.generic')}</p>
        ) : (
          <ul className="space-y-2">
            {logs.slice(0, 20).map((l) => (
              <li key={l.id} className="card flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-ink">{t(`journal.types.${l.type}`)}</p>
                  {l.note && <p className="text-sm text-ink-muted">{l.note}</p>}
                </div>
                <span className="shrink-0 text-sm text-ink-muted">
                  {formatDate(l.date)} · {l.intensity ?? '-'}/5
                </span>
              </li>
            ))}
          </ul>
        )}
        </div>
        <button type="button" className="btn-ghost mt-3 w-full" onClick={() => setClearOpen(true)}>
          {t('journal.clearLogs')}
        </button>
      </section>

      {/* Recovery stories */}
      <section className="mb-4">
        <h2 className="mb-2 text-lg font-bold">{t('journal.storiesTitle')}</h2>
        <div className="space-y-3">
          {recoveryStories.map((s) => (
            <article key={s.id} className="card bg-blush-100">
              <h3 className="text-base font-bold text-ink">{tp(s.title)}</h3>
              <p className="mt-1 text-base text-ink-soft">{tp(s.body)}</p>
              <p className="mt-2 text-xs text-ink-muted">{t('common.demoData')}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Talk to someone */}
      <section className="card bg-sage-50">
        <h2 className="text-lg font-bold">{t('journal.supportTitle')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {helplines.map((h) => (
            <a key={h.id} href={toTelLink(h.number)} className="btn-danger" aria-label={`${tp(h.name)} ${h.number}`}>
              {tp(h.name)} · {h.number}
            </a>
          ))}
        </div>
        <Link to="/safety" className="link mt-3 inline-block">
          {t('journal.safetyTitle')}
        </Link>
        <p className="mt-2 text-sm text-ink-muted">{t('journal.emergencyCraving')} — {t('triage.callEmergency')} {WOMEN_HELPLINE_NUMBER}.</p>
      </section>

      <ConfirmDialog
        open={clearOpen}
        danger
        title={t('journal.clearLogs')}
        message={t('journal.clearConfirm')}
        confirmLabel={t('common.delete')}
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          recovery.clearLogs(user.id);
          setClearOpen(false);
          setRefresh((n) => n + 1);
          toast(t('common.done'), 'success');
        }}
      />
    </div>
  );
}
