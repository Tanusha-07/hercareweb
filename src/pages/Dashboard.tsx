import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import DynamicIcon from '@/components/common/DynamicIcon';
import { useLanguage } from '@/context/LanguageContext';

const options = [
  { to: '/dashboard/periods', key: 'periods', icon: 'Droplet', card: 'bg-berry-200', chip: 'bg-berry-600 text-white', btn: 'bg-berry-600 text-white hover:bg-berry-700' },
  { to: '/dashboard/pregnancy', key: 'pregnancy', icon: 'HeartHandshake', card: 'bg-sage-200', chip: 'bg-sage-600 text-white', btn: 'bg-sage-600 text-white hover:bg-sage-700' },
  { to: '/dashboard/general-health', key: 'general', icon: 'Stethoscope', card: 'bg-lavender-200', chip: 'bg-lavender-600 text-white', btn: 'bg-lavender-600 text-white hover:bg-lavender-700' },
];

/** My Health: choose which dashboard to open today. */
export default function Dashboard() {
  const { t } = useLanguage();
  return (
    <div>
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.intro')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <Link key={o.to} to={o.to} className={`card ${o.card} flex flex-col gap-3 transition-transform hover:-translate-y-0.5`}>
            <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${o.chip}`}>
              <DynamicIcon name={o.icon} size={30} />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{t(`dashboard.${o.key}.label`)}</h2>
              <p className="mt-1 text-base text-ink-soft">{t(`dashboard.${o.key}.desc`)}</p>
            </div>
            <span className={`btn ${o.btn} w-full`}>{t('common.next')}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
