import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';

import Register from '@/pages/auth/Register';
import VerifyOtp from '@/pages/auth/VerifyOtp';
import LanguagePage from '@/pages/auth/Language';

import Home from '@/pages/Home';
import About from '@/pages/About';
import Awareness from '@/pages/Awareness';
import FindDoctor from '@/pages/FindDoctor';
import WellnessJournal from '@/pages/journal/WellnessJournal';
import Safety from '@/pages/Safety';
import Dashboard from '@/pages/Dashboard';
import Periods from '@/pages/dashboard/Periods';
import Pregnancy from '@/pages/dashboard/Pregnancy';
import GeneralHealth from '@/pages/dashboard/GeneralHealth';
import Settings from '@/pages/Settings';

/** Redirect unauthenticated users into the registration flow. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/register" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

/** Send signed-in users straight to the app home from the auth entry page. */
function AuthEntry() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : <Register />;
}

export default function App() {
  return (
    <Routes>
      {/* Public onboarding */}
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<AuthEntry />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/language" element={<LanguagePage />} />

      {/* Protected app */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/find-doctor" element={<FindDoctor />} />
        <Route path="/wellness-journal" element={<WellnessJournal />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/periods" element={<Periods />} />
        <Route path="/dashboard/pregnancy" element={<Pregnancy />} />
        <Route path="/dashboard/general-health" element={<GeneralHealth />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
