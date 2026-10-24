import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import OfflineBanner from '@/components/common/OfflineBanner';
import Toasts from '@/components/common/Toasts';
import AIAssistantPanel from '@/components/assistant/AIAssistantPanel';

/**
 * Shell for all authenticated pages: header, offline banner, main content
 * region (with a skip-link target), bottom nav, toasts and the assistant panel.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen pb-24">
      <OfflineBanner />
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-4">
        <Outlet />
      </main>
      <BottomNav />
      <Toasts />
      <AIAssistantPanel />
    </div>
  );
}
