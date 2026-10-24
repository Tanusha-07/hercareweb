import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import DynamicIcon from '@/components/common/DynamicIcon';
import { navItems } from './nav';

/** Mobile-first bottom navigation with the five primary sections. */
export default function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav
      aria-label={t('nav.menu')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-berry-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <ul className="mx-auto flex max-w-5xl items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-tap flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-center text-2xs font-semibold transition-colors ${
                  isActive ? 'bg-berry-50 text-berry-700' : 'text-ink-muted hover:text-berry-600'
                }`
              }
            >
              <DynamicIcon name={item.icon} size={24} />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
