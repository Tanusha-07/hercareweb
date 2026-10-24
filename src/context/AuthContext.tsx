import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import * as authService from '@/services/auth';
import { useLanguage } from './LanguageContext';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** Begin OTP: ask the server to send a code. Returns resend timing + dev code. */
  startRegistration: (phone: string) => ReturnType<typeof authService.startRegistration>;
  /** Complete OTP, create/refresh the account, and sign in. */
  completeRegistration: (
    phone: string,
    name: string,
    requestId: string,
    code: string,
  ) => Promise<User>;
  logout: () => void;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getSessionUser());
  const { setLang } = useLanguage();

  const startRegistration = useCallback((phone: string) => authService.startRegistration(phone), []);

  const completeRegistration = useCallback(
    async (phone: string, name: string, requestId: string, code: string) => {
      const { user: created } = await authService.completeRegistration(phone, name, requestId, code);
      setUser(created);
      // Adopt the account's saved language (defaults to en on first sign-in).
      setLang(created.language);
      return created;
    },
    [setLang],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(() => {
    authService.deleteAccount();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user?.phoneVerified),
      startRegistration,
      completeRegistration,
      logout,
      deleteAccount,
    }),
    [user, startRegistration, completeRegistration, logout, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
