import PageHeader from '@/components/common/PageHeader';
import DynamicIcon from '@/components/common/DynamicIcon';
import AudioButton from '@/components/common/AudioButton';
import { useLanguage } from '@/context/LanguageContext';
import { aboutSteps } from '@/data/content';

/** Block 1 — About the app: a short, listenable, step-by-step guide. */
export default function About() {
  const { t, tp } = useLanguage();
  return (
    <div>
      <PageHeader title={t('about.title')} subtitle={t('about.intro')} />
      <ol className="space-y-3">
        {aboutSteps.map((step, i) => {
          const title = tp(step.title);
          const body = tp(step.body);
          return (
            <li key={step.id} className="card flex gap-4">
              <div className="flex flex-col items-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-berry-50 text-berry-700">
                  <DynamicIcon name={step.icon} size={26} />
                </span>
                <span className="mt-1 text-sm font-bold text-ink-muted">{i + 1}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-1 text-base text-ink-soft">{body}</p>
                <div className="mt-2">
                  <AudioButton text={`${title}. ${body}`} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="card mt-4">
        <h2 className="text-lg font-bold">{t('about.privacyTitle')}</h2>
        <p className="mt-1 text-base text-ink-soft">{t('settings.quickExitExplain')}</p>
      </div>
    </div>
  );
}
