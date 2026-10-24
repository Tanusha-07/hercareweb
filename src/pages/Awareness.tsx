import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import BackBar from '@/components/common/BackBar';
import DynamicIcon from '@/components/common/DynamicIcon';
import AudioButton from '@/components/common/AudioButton';
import { useLanguage } from '@/context/LanguageContext';
import { awarenessArticles, awarenessCategories, articlesByCategory } from '@/data/awareness';
import type { AwarenessArticle, AwarenessCategory } from '@/types';

/** Block 2 — Awareness today, healthier tomorrow. */
export default function Awareness() {
  const { t, tp, lang } = useLanguage();
  const [category, setCategory] = useState<AwarenessCategory>('lifecycle');
  const [open, setOpen] = useState<AwarenessArticle | null>(null);

  if (open) {
    const full = awarenessArticles.find((a) => a.id === open.id) ?? open;
    return (
      <div>
        <BackBar to="/awareness" />
        <article className="card">
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-50 text-sage-700">
              <DynamicIcon name={full.icon} size={26} />
            </span>
            <h1 className="text-xl font-extrabold">{tp(full.title)}</h1>
          </div>
          <AudioButton text={`${tp(full.title)}. ${full.body.map((b) => tp(b)).join(' ')}`} className="mb-3" />
          <div className="space-y-3 text-base text-ink-soft">
            {full.body.map((para, i) => (
              <p key={i}>{tp(para)}</p>
            ))}
          </div>

          {full.seekHelp && (
            <section className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <h2 className="text-base font-bold text-alert-amber">{t('common.seekHelp')}</h2>
              <p className="mt-1 text-base text-ink-soft">{tp(full.seekHelp)}</p>
            </section>
          )}

          <p className="mt-4 text-sm text-ink-muted">
            {t('common.source')}: {full.source}
          </p>

          {full.nextStep && (
            <Link to={full.nextStep.to} className="btn-primary mt-4 w-full">
              {t('awareness.nextStep')}: {tp(full.nextStep.label)}
            </Link>
          )}
        </article>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t('awareness.title')} subtitle={t('awareness.intro')} />

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t('awareness.title')}>
        {awarenessCategories.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`inline-flex min-h-tap items-center gap-2 rounded-pill px-4 text-base font-semibold ${
              category === c.id ? 'bg-berry-600 text-white' : 'bg-white text-berry-700 ring-1 ring-inset ring-berry-100'
            }`}
          >
            <DynamicIcon name={c.icon} size={20} />
            {t(`awareness.categories.${c.id}`)}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {articlesByCategory(category).map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => setOpen(a)} className="card flex w-full items-center gap-3 text-left hover:bg-berry-50">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700">
                <DynamicIcon name={a.icon} size={26} />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold text-ink">{tp(a.title)}</span>
                <span className="block text-sm text-ink-muted">{tp(a.summary)}</span>
              </span>
            </button>
          </li>
        ))}
        {articlesByCategory(category).length === 0 && (
          <li className="card text-center text-ink-muted">{t('awareness.empty')}</li>
        )}
      </ul>
      <p className="sr-only" aria-live="polite">
        {lang}
      </p>
    </div>
  );
}
