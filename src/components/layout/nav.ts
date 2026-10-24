import type { Language } from '@/types';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: string;
}

/** The five primary bottom-nav destinations (mobile-first). */
export const navItems: NavItem[] = [
  { to: '/home', labelKey: 'nav.home', icon: 'Home' },
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: 'LayoutDashboard' },
  { to: '/wellness-journal', labelKey: 'nav.journal', icon: 'BookOpen' },
  { to: '/safety', labelKey: 'nav.safety', icon: 'ShieldAlert' },
  { to: '/settings', labelKey: 'nav.settings', icon: 'Settings' },
];

/** Native script for a language, used by the selector. */
export const nativeNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
};
