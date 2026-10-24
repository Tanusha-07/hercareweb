import { useMemo, useState } from 'react';
import { MapPin, MessageCircle, Phone, Save, Share2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import VoiceButton from '@/components/common/VoiceButton';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi } from '@/context/UiContext';
import { useOnline } from '@/hooks/useOnline';
import { sampleFacilities, buildLocationCascade, filterFacilities, allSpecialities, type FacilityFilters } from '@/data/facilities';
import { savedFacilities } from '@/services/records';
import { whatsappShareUrl, smsShareUrl, facilityShareText } from '@/services/share';
import { toTelLink } from '@/utils/phone';
import type { Facility } from '@/types';

const EMPTY: FacilityFilters = { state: '', district: '', block: '', village: '' };

/** Block 3 — Find your doctor: offline-friendly directory + filters. */
export default function FindDoctor() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useUi();
  const online = useOnline();

  const facilities = sampleFacilities;
  const cascade = useMemo(() => buildLocationCascade(facilities), [facilities]);
  const specialities = useMemo(() => allSpecialities(facilities), [facilities]);

  const [filters, setFilters] = useState<FacilityFilters>(EMPTY);
  const [savedIds, setSavedIds] = useState<string[]>(() => (user ? savedFacilities.ids(user.id) : []));
  const [detail, setDetail] = useState<Facility | null>(null);

  const results = useMemo(() => filterFacilities(facilities, filters), [facilities, filters]);

  const set = (patch: Partial<FacilityFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const toggleSave = (f: Facility) => {
    if (!user) return;
    const nowSaved = savedFacilities.toggle(user.id, f.id);
    setSavedIds(savedFacilities.ids(user.id));
    toast(nowSaved ? t('findDoctor.save') : t('common.saved'), 'success');
  };

  const selectClass = 'input appearance-none';

  if (detail) {
    return (
      <FacilityDetail
        facility={detail}
        saved={savedIds.includes(detail.id)}
        onSave={() => toggleSave(detail)}
        onBack={() => setDetail(null)}
      />
    );
  }

  return (
    <div>
      <PageHeader title={t('findDoctor.title')} subtitle={t('findDoctor.intro')} />

      {!online && (
        <p className="mb-3 rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-alert-amber" role="status">
          {t('findDoctor.offlineNotice')}
        </p>
      )}

      <div className="card mb-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">{t('findDoctor.state')}</span>
            <select className={selectClass} value={filters.state} onChange={(e) => set({ state: e.target.value, district: '', block: '', village: '' })}>
              <option value="">—</option>
              {cascade.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t('findDoctor.district')}</span>
            <select className={selectClass} value={filters.district} disabled={!filters.state} onChange={(e) => set({ district: e.target.value, block: '', village: '' })}>
              <option value="">—</option>
              {(cascade.districtsByState[filters.state ?? ''] ?? []).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t('findDoctor.block')}</span>
            <select className={selectClass} value={filters.block} disabled={!filters.district} onChange={(e) => set({ block: e.target.value, village: '' })}>
              <option value="">—</option>
              {(cascade.blocksByDistrict[filters.district ?? ''] ?? []).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">{t('findDoctor.village')}</span>
            <select className={selectClass} value={filters.village} disabled={!filters.block} onChange={(e) => set({ village: e.target.value })}>
              <option value="">—</option>
              {(cascade.villagesByBlock[filters.block ?? ''] ?? []).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="field-label">{t('common.search')}</span>
          <input className={selectClass} value={filters.query ?? ''} onChange={(e) => set({ query: e.target.value })} placeholder={t('findDoctor.searchPlaceholder')} />
        </label>
        <VoiceButton onResult={(text) => set({ query: text })} />

        <fieldset className="grid grid-cols-2 gap-2 border-t border-berry-100 pt-3">
          <legend className="sr-only">{t('findDoctor.filters')}</legend>
          <label className="flex min-h-tap items-center gap-2 text-base">
            <input type="radio" name="ownership" checked={!filters.ownership} onChange={() => set({ ownership: undefined })} className="h-5 w-5 accent-berry-600" />
            {t('findDoctor.ownershipAll')}
          </label>
          <label className="flex min-h-tap items-center gap-2 text-base">
            <input type="radio" name="ownership" checked={filters.ownership === 'government'} onChange={() => set({ ownership: 'government' })} className="h-5 w-5 accent-berry-600" />
            {t('findDoctor.government')}
          </label>
          <label className="flex min-h-tap items-center gap-2 text-base">
            <input type="radio" name="ownership" checked={filters.ownership === 'private'} onChange={() => set({ ownership: 'private' })} className="h-5 w-5 accent-berry-600" />
            {t('findDoctor.private')}
          </label>
          <label className="flex min-h-tap items-center gap-2 text-base">
            <input type="checkbox" checked={Boolean(filters.freeOnly)} onChange={(e) => set({ freeOnly: e.target.checked })} className="h-5 w-5 accent-berry-600" />
            {t('findDoctor.free')}
          </label>
          <label className="flex min-h-tap items-center gap-2 text-base">
            <input type="checkbox" checked={Boolean(filters.femaleDoctorOnly)} onChange={(e) => set({ femaleDoctorOnly: e.target.checked })} className="h-5 w-5 accent-berry-600" />
            {t('findDoctor.femaleDoctor')}
          </label>
        </fieldset>

        <label className="block">
          <span className="field-label">{t('findDoctor.speciality')}</span>
          <select className={selectClass} value={filters.speciality ?? ''} onChange={(e) => set({ speciality: e.target.value })}>
            <option value="">{t('findDoctor.specialityAll')}</option>
            {specialities.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-2 text-sm font-semibold text-ink-muted">{t('findDoctor.results', { count: results.length })}</p>

      <ul className="space-y-3">
        {results.map((f) => (
          <li key={f.id}>
            <FacilityCard
              facility={f}
              saved={savedIds.includes(f.id)}
              onSave={() => toggleSave(f)}
              onDetails={() => setDetail(f)}
            />
          </li>
        ))}
        {results.length === 0 && <li className="card text-center text-ink-muted">{t('findDoctor.noResults')}</li>}
      </ul>

      <p className="mt-4 rounded-xl bg-lavender-50 px-4 py-3 text-sm text-lavender-700">{t('findDoctor.sampleNotice')}</p>
    </div>
  );
}

function OwnershipBadge({ facility }: { facility: Facility }) {
  const { t } = useLanguage();
  const gov = facility.ownership === 'government';
  return (
    <span className={`rounded-pill px-3 py-1 text-xs font-bold ${gov ? 'bg-sage-100 text-sage-700' : 'bg-lavender-100 text-lavender-700'}`}>
      {gov ? t('findDoctor.government') : t('findDoctor.private')}
    </span>
  );
}

function FacilityCard({ facility, saved, onSave, onDetails }: { facility: Facility; saved: boolean; onSave: () => void; onDetails: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-ink">{facility.name}</h2>
          <p className="text-sm text-ink-muted">
            {facility.type} • {facility.village}, {facility.block}
          </p>
        </div>
        <OwnershipBadge facility={facility} />
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        {facility.femaleDoctor === true && <span className="rounded-pill bg-berry-50 px-3 py-1 font-semibold text-berry-700">{t('findDoctor.femaleDoctor')}</span>}
        <span className="rounded-pill bg-cream-200 px-3 py-1 font-semibold text-ink-soft">
          {facility.free && facility.feeVerified ? t('findDoctor.freeLabel') : facility.feeNote ?? t('findDoctor.feeLabel')}
        </span>
        {facility.isSample && <span className="rounded-pill bg-amber-100 px-3 py-1 font-semibold text-alert-amber">{t('common.demoData')}</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a href={toTelLink(facility.phone ?? '')} className="btn-primary" aria-label={`${t('common.callNow')} — ${t('findDoctor.callNote')}`}>
          <Phone size={18} aria-hidden /> {t('common.callNow')}
        </a>
        <button type="button" className="btn-ghost" onClick={onDetails}>
          {t('common.viewDetails')}
        </button>
        <button type="button" className={`btn-ghost ${saved ? 'text-berry-700' : ''}`} onClick={onSave} aria-pressed={saved}>
          <Save size={18} aria-hidden /> {saved ? t('common.saved') : t('findDoctor.save')}
        </button>
        <a
          href={whatsappShareUrl(facility)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          aria-label={t('common.share')}
        >
          <MessageCircle size={18} aria-hidden /> WhatsApp
        </a>
      </div>
    </div>
  );
}

function FacilityDetail({ facility, saved, onSave, onBack }: { facility: Facility; saved: boolean; onSave: () => void; onBack: () => void }) {
  const { t } = useLanguage();
  const sharePreview = facilityShareText(facility);
  return (
    <div>
      <BackBarInline onBack={onBack} />
      <article className="card">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-extrabold">{facility.name}</h1>
          <OwnershipBadge facility={facility} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-base text-ink-soft">
          <MapPin size={18} aria-hidden /> {facility.address}, {facility.village}, {facility.block}, {facility.district}, {facility.state}
        </p>

        <dl className="mt-4 space-y-2 text-base">
          <Row label={t('findDoctor.type')} value={facility.type} />
          <Row label={t('findDoctor.speciality')} value={facility.specialities.join(', ')} />
          <Row label={t('findDoctor.spokenLanguages')} value={facility.languages.map((l) => l.toUpperCase()).join(', ')} />
          <Row label={t('findDoctor.femaleDoctor')} value={facility.femaleDoctor === true ? t('common.verified') : facility.femaleDoctor === false ? t('common.no') : t('common.notVerified')} />
          <Row label={t('findDoctor.feeLabel')} value={facility.free && facility.feeVerified ? t('findDoctor.freeLabel') : facility.feeNote ?? t('common.notVerified')} />
          {facility.hours && <Row label={t('findDoctor.type')} value={facility.hours} />}
          {facility.source && <Row label={t('common.source')} value={facility.source} />}
        </dl>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a href={toTelLink(facility.phone ?? '')} className="btn-primary">
            <Phone size={18} aria-hidden /> {t('common.callNow')}
          </a>
          <button type="button" className={`btn-ghost ${saved ? 'text-berry-700' : ''}`} onClick={onSave} aria-pressed={saved}>
            <Save size={18} aria-hidden /> {saved ? t('common.saved') : t('findDoctor.save')}
          </button>
          <a href={whatsappShareUrl(facility)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <Share2 size={18} aria-hidden /> WhatsApp
          </a>
          <a href={smsShareUrl(facility)} className="btn-secondary">
            <Share2 size={18} aria-hidden /> SMS
          </a>
        </div>

        <details className="mt-4 rounded-2xl bg-cream-100 p-4">
          <summary className="cursor-pointer text-base font-semibold text-ink-soft">{t('common.share')}</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-ink-muted">{sharePreview}</pre>
          <p className="mt-2 text-xs text-ink-muted">{t('findDoctor.callNote')}</p>
        </details>
      </article>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-berry-50 pb-1">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

function BackBarInline({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="mb-3">
      <button type="button" onClick={onBack} className="inline-flex min-h-tap items-center gap-1 rounded-pill bg-white px-4 text-berry-700 ring-1 ring-inset ring-berry-100">
        ← {t('common.back')}
      </button>
    </div>
  );
}
