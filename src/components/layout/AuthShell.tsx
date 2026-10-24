import type { ReactNode } from 'react';
import Toasts from '@/components/common/Toasts';

/** Warm, focused layout for registration / OTP / language onboarding screens. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blush-100 via-cream-50 to-cream-100">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/logo.png" alt="HerCare+" width={72} height={72} className="h-16 w-16" />
        </div>
        {children}
      </div>
      <Toasts />
    </div>
  );
}
