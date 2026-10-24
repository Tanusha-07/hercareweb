import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, PhoneCall, Siren } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi } from '@/context/UiContext';
import { contacts, reports } from '@/services/records';
import { helplines } from '@/data/helplines';
import { formatDate, todayISO } from '@/utils/date';
import { toTelLink } from '@/utils/phone';
import type { LocalizedText } from '@/types';

const CATEGORIES: { id: string; label: LocalizedText }[] = [
  { id: 'harassment', label: { en: 'Harassment or stalking', hi: 'उत्पीड़न या पीछा', kn: 'ಕಿರುಕು ಅಥವಾ ಬೆಂಬಿಡದಿ' } },
  { id: 'domestic', label: { en: 'Domestic violence', hi: 'घरेलू हिंसा', kn: 'ಕುಟುಂಬ ಹಿಂಸೆ' } },
  { id: 'abuse', label: { en: 'Physical or sexual abuse', hi: 'शारीरिक या यौन शोषण', kn: 'ಶಾರೀರಿಕ ಅಥವಾ ಲೈಂಗಿಕ ದುರುಪಯೋಗ' } },
  { id: 'other', label: { en: 'Something else', hi: 'कुछ और', kn: 'ಬೇರೆದಾದರೂ' } },
];

/** Block 5 — Care & protect yourself: emergency help, safety and support. */
export default function Safety() {
  const { t, tp } = useLanguage();
  const { user } = useAuth();
  const { openAssistant } = useUi();

  const [confirmCall, setConfirmCall] = useState<string | null>(null);
  const [saved, setSaved] = useState(0);
  const trusted = useMemo(() => (user ? contacts.all(user.id) : []), [user, saved]);

  const list = useMemo(() => (user ? reports.all(user.id) : []), [user, saved]);

  return (
    <div>
      <PageHeader title={t('safety.title')} subtitle={t('safety.subtitle')} />

      <p role="note" className="mb-4 rounded-xl bg-alert-redBg px-4 py-3 text-sm font-semibold text-alert-red">
        {t('safety.emergencyDisclaimer')}
      </p>

      {/* Emergency SOS */}
      <section className="card mb-4 bg-alert-redBg">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Siren size={22} className="text-alert-red" aria-hidden /> {t('safety.sos')}
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {helplines.map((h) => (
            <a
              key={h.id}
              href={toTelLink(h.number)}
              className="btn-danger !px-4 !py-2 text-base"
              aria-label={`${tp(h.name)} ${h.number}`}
            >
              <PhoneCall size={18} aria-hidden />
              <span className="truncate">{tp(h.name)}</span>
              <span className="text-sm font-normal opacity-90">{h.number}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Trusted contact */}
      <section className="card mb-4 bg-cream-200">
        <h2 className="text-lg font-bold">{t('safety.trustedContact')}</h2>
        {trusted.length === 0 ? (
          <div className="mt-2">
            <p className="text-base text-ink-muted">{t('safety.noTrustedContact')}</p>
            <Link to="/settings" className="link mt-2 inline-block">
              {t('settings.addContact')}
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {trusted.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <span>
                  <span className="block font-bold text-ink">{c.name}</span>
                  {c.relation && <span className="block text-sm text-ink-muted">{c.relation}</span>}
                </span>
                <button type="button" className="btn-primary !py-2" onClick={() => setConfirmCall(c.phone)}>
                  <PhoneCall size={18} aria-hidden /> {t('common.callNow')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Talk to someone (AI) + nearby help */}
      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" className="card mb-0 bg-lavender-50 flex items-center gap-3 text-left hover:bg-lavender-100" onClick={openAssistant}>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender-100 text-lavender-700">
            <MessageSquare size={26} aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-bold">{t('safety.assistant')}</span>
            <span className="block text-sm text-ink-muted">{t('assistant.intro')}</span>
          </span>
        </button>
        <Link to="/find-doctor" className="card mb-0 bg-sage-50 flex items-center gap-3 text-left hover:bg-sage-100">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
            <PhoneCall size={26} aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-bold">{t('safety.nearby')}</span>
            <span className="block text-sm text-ink-muted">{t('findDoctor.intro')}</span>
          </span>
        </Link>
      </section>

      {/* Report harassment */}
      <ReportSection onSaved={() => setSaved((n) => n + 1)} />

      {/* Saved reports (private) */}
      {list.length > 0 && (
        <section className="card mb-4 bg-lavender-50">
          <h2 className="text-lg font-bold">{t('safety.report')}</h2>
          <ul className="mt-2 space-y-2">
            {list.map((r) => (
              <li key={r.id} className="rounded-2xl bg-cream-100 px-4 py-3">
                <p className="font-semibold text-ink">{tp(CATEGORIES.find((c) => c.id === r.category)?.label ?? CATEGORIES[3].label)}</p>
                {r.date && <p className="text-sm text-ink-muted">{formatDate(r.date)}</p>}
                <p className="mt-1 text-sm text-ink-soft">{r.description}</p>
                {user && (
                  <button
                    type="button"
                    className="link mt-1 text-sm"
                    onClick={() => {
                      reports.remove(user.id, r.id);
                      setSaved((n) => n + 1);
                    }}
                  >
                    {t('common.delete')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Evidence & safety guide */}
      <section className="card bg-sage-50">
        <h2 className="text-lg font-bold">{t('safety.evidence')}</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-base text-ink-soft">
          <li>{tp({
            en: 'If you can, keep proof: photos of injuries, messages, screenshots, or names and dates. Store them somewhere only you can open.',
            hi: 'सकें तो प्रमाण रखें: चोटों के फ़ोटो, संदेश, स्क्रीनशॉट, या नाम व तारीखें। इन्हें केवल आपके पास खुलने जगह रखें।',
            kn: 'ಸಾಧ್ಯವಿದ್ದರೆ ಪುರಾವೆ ಇಟ್ಟುಕೊಳ್ಳಿ: ಗಾಯಗಳ ಫೋಟೋ, ಸಂದೇಶಗಳು, ಸ್ಕ್ರೀನ್‌ಶಾಟ್, ಅಥವಾ ಹೆಸರು ಮತ್ತು ದಿನಾಂಕ. ನೀವು ಮಾತ್ರ ತೆರೆಯುವ ಜಾಗಡ ಇಡಿ.',
          })}</li>
          <li>{tp({
            en: 'Tell one person you trust what is happening. You do not have to handle this alone.',
            hi: 'जो हो रहा है वह एक भरोसेमंद व्यक्ति को बताएँ। आपको अकेले संभालना ज़रूरी नहीं।',
            kn: 'ಏನಾಗುತ್ತಿದೆ ಎಂದು ಒಬ್ಬ ನಂಬಿಕೆಯ ವ್ಯಕ್ತಿಗೆ ತಿಳಿಸಿ. ನೀವು ಒಬ್ಬರೇ ನಿಭಾಯಿಸಬೇಕಿಲ್ಲ.',
          })}</li>
          <li>{tp({
            en: 'You can report to police or a women’s helpline. Call 112 in an emergency, or 181 for women’s support.',
            hi: 'आप पुलिस या महिला हेल्पलाइन को शिकायत कर सकती हैं। आपात में 112, या महिला सहायता के लिए 181 पर कॉल करें।',
            kn: 'ಪೊಲೀಸರು ಅಥವಾ ಮಹಿಳಾ ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ದೂರು ನೀಡಬಹುದು. ತುರ್ತಿಗೆ 112, ಮಹಿಳಾ ಬೆಂಬಲಕ್ಕೆ 181 ಕರೆ ಮಾಡಿ.',
          })}</li>
        </ul>
        <p className="mt-3 text-sm text-ink-muted">{t('safety.quickExitHelp')}</p>
      </section>

      <ConfirmDialog
        open={confirmCall !== null}
        title={t('safety.trustedContact')}
        message={t('safety.callConfirm', { number: confirmCall ?? '' })}
        confirmLabel={t('common.callNow')}
        onCancel={() => setConfirmCall(null)}
        onConfirm={() => {
          if (confirmCall) window.location.href = toTelLink(confirmCall);
          setConfirmCall(null);
        }}
      />
    </div>
  );
}

function ReportSection({ onSaved }: { onSaved: () => void }) {
  const { t, tp } = useLanguage();
  const { user } = useAuth();
  const { toast } = useUi();
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [when, setWhen] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [followUp, setFollowUp] = useState<'call' | 'sms' | 'none'>('none');

  const submit = () => {
    if (!user || !description.trim()) return;
    reports.add(user.id, {
      category,
      date: when || undefined,
      description: description.trim(),
      contact: contact.trim() || undefined,
      followUp,
    });
    setDescription('');
    setWhen('');
    setContact('');
    onSaved();
    toast(t('safety.reportSaved'), 'success');
  };

  return (
    <section className="card mb-4 bg-berry-50">
      <h2 className="text-lg font-bold">{t('safety.reportTitle')}</h2>
      <p className="mt-1 text-sm text-ink-muted">{t('safety.reportIntro')}</p>

      <label className="mt-3 block">
        <span className="field-label">{t('safety.incidentCategory')}</span>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {tp(c.label)}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block">
        <span className="field-label">{t('safety.incidentWhen')}</span>
        <input type="date" className="input" value={when} max={todayISO()} onChange={(e) => setWhen(e.target.value)} />
      </label>

      <label className="mt-3 block">
        <span className="field-label">{t('safety.incidentDescribe')}</span>
        <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
      </label>

      <label className="mt-3 block">
        <span className="field-label">{t('safety.incidentContact')}</span>
        <input className="input" value={contact} onChange={(e) => setContact(e.target.value)} inputMode="tel" />
      </label>

      <fieldset className="mt-3">
        <legend className="field-label">{t('safety.followUp')}</legend>
        <div className="flex flex-wrap gap-2">
          {(['call', 'sms', 'none'] as const).map((f) => (
            <label key={f} className="flex min-h-tap items-center gap-2 text-base">
              <input type="radio" name="followUp" className="h-5 w-5 accent-berry-600" checked={followUp === f} onChange={() => setFollowUp(f)} />
              {t(`safety.followUp_${f}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="button" className="btn-primary mt-4 w-full" disabled={!description.trim()} onClick={submit}>
        {t('safety.submitReport')}
      </button>
    </section>
  );
}
