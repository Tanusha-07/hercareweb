import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LanguageSelector from '@/components/layout/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi, type TextSize } from '@/context/UiContext';
import { contacts } from '@/services/records';
import { isValidPhone, formatPhoneForDisplay } from '@/utils/phone';
import { LANGUAGES } from '@/i18n';
import { nativeNames } from '@/components/layout/nav';

const SIZES: TextSize[] = ['normal', 'large', 'xlarge'];

/** Settings: language, accessibility, privacy, trusted contacts, and account. */
export default function Settings() {
  const { t, lang } = useLanguage();
  const { user, logout, deleteAccount } = useAuth();
  const { textSize, setTextSize, speakByDefault, setSpeakByDefault, toast } = useUi();
  const navigate = useNavigate();

  const [refresh, setRefresh] = useState(0);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cRelation, setCRelation] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const trusted = useMemo(() => (user ? contacts.all(user.id) : []), [user, refresh]);
  if (!user) return null;

  const addContact = () => {
    if (!cName.trim() || !isValidPhone(cPhone)) {
      setPhoneError(!isValidPhone(cPhone));
      return;
    }
    contacts.add(user.id, { name: cName.trim(), phone: cPhone, relation: cRelation.trim() || undefined });
    setCName('');
    setCPhone('');
    setCRelation('');
    setPhoneError(false);
    setRefresh((n) => n + 1);
    toast(t('common.saved'), 'success');
  };

  const doLogout = () => {
    logout();
    toast(t('settings.loggedOut'), 'info');
    navigate('/home', { replace: true });
  };

  const doDelete = () => {
    deleteAccount();
    setConfirmDelete(false);
    toast(t('settings.accountDeleted'), 'info');
    navigate('/register', { replace: true });
  };

  return (
    <div>
      <PageHeader title={t('settings.title')} />

      {/* Language */}
      <section className="card mb-4 bg-lavender-50">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{t('settings.languageSection')}</h2>
          <LanguageSelector />
        </div>
        <p className="mt-2 text-sm text-ink-muted">{t('languageSelect.intro')}</p>
        <ul className="mt-2 flex flex-wrap gap-2 text-sm text-ink-soft">
          {LANGUAGES.map((l) => (
            <li key={l.code} className={`rounded-pill px-3 py-1 ${l.code === lang ? 'bg-berry-100 font-semibold text-berry-700' : 'bg-cream-200'}`}>
              {nativeNames[l.code]}
            </li>
          ))}
        </ul>
      </section>

      {/* Accessibility */}
      <section className="card mb-4 bg-sage-50">
        <h2 className="text-lg font-bold">{t('settings.textSize')}</h2>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t('settings.textSize')}>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={textSize === s}
              onClick={() => setTextSize(s)}
              className={`min-h-tap rounded-pill px-4 text-base font-semibold ${
                textSize === s ? 'bg-berry-600 text-white' : 'bg-white text-berry-700 ring-1 ring-inset ring-berry-100'
              }`}
            >
              {t(`settings.textSizes.${s}`)}
            </button>
          ))}
        </div>
        <label className="mt-4 flex min-h-tap items-center justify-between gap-3">
          <span className="text-base font-semibold text-ink">{t('settings.speakByDefault')}</span>
          <input
            type="checkbox"
            className="h-6 w-6 accent-berry-600"
            checked={speakByDefault}
            onChange={(e) => setSpeakByDefault(e.target.checked)}
          />
        </label>
      </section>

      {/* Privacy & safety */}
      <section className="card mb-4 bg-berry-50">
        <h2 className="text-lg font-bold">{t('settings.privacySection')}</h2>
        <p className="mt-1 text-base text-ink-soft">{t('settings.quickExitExplain')}</p>
        <p className="mt-2 text-sm text-ink-muted">{t('journal.privacyNote')}</p>
      </section>

      {/* Trusted contacts */}
      <section className="card mb-4 bg-cream-200">
        <h2 className="text-lg font-bold">{t('settings.trustedContacts')}</h2>
        {trusted.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {trusted.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <span>
                  <span className="block font-bold text-ink">{c.name}</span>
                  <span className="block text-sm text-ink-muted">
                    <Phone size={14} className="mr-1 inline" aria-hidden />
                    {formatPhoneForDisplay(c.phone)}
                    {c.relation ? ` · ${c.relation}` : ''}
                  </span>
                </span>
                <button
                  type="button"
                  className="link text-sm"
                  onClick={() => {
                    contacts.remove(user.id, c.id);
                    setRefresh((n) => n + 1);
                  }}
                >
                  {t('common.delete')}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">{t('safety.noTrustedContact')}</p>
        )}

        <div className="mt-3 space-y-2 border-t border-berry-100 pt-3">
          <span className="field-label">{t('settings.addContact')}</span>
          <input className="input" placeholder={t('auth.fullName')} value={cName} onChange={(e) => setCName(e.target.value)} />
          <div className="flex items-stretch gap-2">
            <span className="inline-flex min-h-tap items-center rounded-xl border-2 border-berry-100 bg-berry-50 px-3 font-semibold text-berry-700">
              +91
            </span>
            <input
              className={`input ${phoneError ? 'input-error' : ''}`}
              inputMode="numeric"
              maxLength={10}
              value={cPhone}
              onChange={(e) => {
                setCPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                setPhoneError(false);
              }}
            />
          </div>
          <input className="input" placeholder={`${t('safety.trustedContact')} (${t('common.optional')})`} value={cRelation} onChange={(e) => setCRelation(e.target.value)} />
          <button type="button" className="btn-primary w-full" onClick={addContact}>
            {t('settings.addContact')}
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="card bg-lavender-50">
        <h2 className="text-lg font-bold">{t('settings.accountSection')}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {user.name} · {formatPhoneForDisplay(user.phone)}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn-ghost flex-1" onClick={doLogout}>
            {t('settings.logout')}
          </button>
          <button type="button" className="btn-danger flex-1" onClick={() => setConfirmDelete(true)}>
            {t('settings.deleteAccount')}
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        danger
        title={t('settings.deleteAccount')}
        message={t('settings.deleteConfirm')}
        confirmLabel={t('common.delete')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={doDelete}
      />
    </div>
  );
}
