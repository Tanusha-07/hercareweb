import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import DynamicIcon from '@/components/common/DynamicIcon';

interface Block {
  to: string;
  titleKey: string;
  descKey: string;
  actionKey: string;
  icon: string;
  card: string;
  chip: string;
  btn: string;
}

const blocks: Block[] = [
  { to: '/about', titleKey: 'home.blocks.about', descKey: 'home.blocks.about', actionKey: 'home.blocks.about', icon: 'AppWindow', card: 'bg-lavender-200', chip: 'bg-lavender-600 text-white', btn: 'bg-lavender-600 text-white hover:bg-lavender-700' },
  { to: '/awareness', titleKey: 'home.blocks.awareness', descKey: 'home.blocks.awareness', actionKey: 'home.blocks.awareness', icon: 'BookOpen', card: 'bg-sage-200', chip: 'bg-sage-600 text-white', btn: 'bg-sage-600 text-white hover:bg-sage-700' },
  { to: '/find-doctor', titleKey: 'home.blocks.doctor', descKey: 'home.blocks.doctor', actionKey: 'home.blocks.doctor', icon: 'Search', card: 'bg-berry-200', chip: 'bg-berry-600 text-white', btn: 'bg-berry-600 text-white hover:bg-berry-700' },
  { to: '/wellness-journal', titleKey: 'home.blocks.journal', descKey: 'home.blocks.journal', actionKey: 'home.blocks.journal', icon: 'Sparkles', card: 'bg-cream-300', chip: 'bg-ink text-white', btn: 'bg-ink text-white hover:brightness-110' },
  { to: '/safety', titleKey: 'home.blocks.safety', descKey: 'home.blocks.safety', actionKey: 'home.blocks.safety', icon: 'ShieldAlert', card: 'bg-alert-redBg', chip: 'bg-alert-red text-white', btn: 'bg-alert-red text-white hover:brightness-95' },
];

/** Post-onboarding dashboard: exactly five primary feature cards. */
export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div>
      <section className="mb-5 text-center">
        <h1 className="text-2xl font-extrabold text-ink">
          {t('home.greeting')}
          {user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-1 text-base text-ink-soft">{t('home.subtitle')}</p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {blocks.map((b) => (
          <Link
            key={b.to}
            to={b.to}
            className={`card ${b.card} flex flex-col gap-3 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5`}
            aria-label={t(`${b.titleKey}.title`)}
          >
            <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${b.chip}`}>
              <DynamicIcon name={b.icon} size={30} />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{t(`${b.titleKey}.title`)}</h2>
              <p className="mt-1 text-base text-ink-soft">{t(`${b.descKey}.desc`)}</p>
            </div>
            <span className={`btn ${b.btn} w-full`}>{t(`${b.actionKey}.action`)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
