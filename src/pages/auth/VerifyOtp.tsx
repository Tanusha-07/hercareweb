import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '@/components/layout/AuthShell';
import OtpInput from '@/components/common/OtpInput';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi } from '@/context/UiContext';
import { formatPhoneForDisplay } from '@/utils/phone';
import { OtpError, requestOtp } from '@/services/otp';

interface VerifyState {
  name: string;
  phone: string;
  requestId: string;
  resendAfterSeconds: number;
  devMockCode?: string;
}

/** Step 2: verify the 6-digit code with the server, then create the account. */
export default function VerifyOtp() {
  const { t } = useLanguage();
  const { completeRegistration } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as Partial<VerifyState>;

  const [code, setCode] = useState('');
  const [requestId, setRequestId] = useState(state.requestId ?? '');
  const [devCode, setDevCode] = useState(state.devMockCode);
  const [seconds, setSeconds] = useState(state.resendAfterSeconds ?? 30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.phone) navigate('/register', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [seconds]);

  const resend = async () => {
    if (!state.phone || seconds > 0) return;
    setError(null);
    try {
      const res = await requestOtp(state.phone);
      setRequestId(res.requestId);
      setDevCode(res.devMockCode);
      setSeconds(res.resendAfterSeconds);
      setCode('');
    } catch (err) {
      setError(err instanceof OtpError && err.code === 'network' ? t('auth.networkError') : t('errors.generic'));
    }
  };

  const submit = async (value: string) => {
    if (!state.phone || !requestId || value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await completeRegistration(state.phone, state.name ?? '', requestId, value);
      toast(t('auth.verifiedToast'), 'success');
      navigate('/language', { replace: true });
    } catch (err) {
      const c = err instanceof OtpError ? err.code : 'server';
      setError(
        c === 'invalid_otp'
          ? t('auth.otpInvalid')
          : c === 'expired'
            ? t('auth.otpExpired')
            : c === 'rate_limited'
              ? t('auth.rateLimited')
              : c === 'network'
                ? t('auth.networkError')
                : t('errors.generic'),
      );
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold text-ink">{t('auth.verifyTitle')}</h1>
      <p className="mt-2 text-base text-ink-soft">
        {t('auth.verifyIntro')} <strong>{formatPhoneForDisplay(state.phone ?? '')}</strong>
      </p>

      {devCode && (
        <p className="mt-3 rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-alert-amber" role="status">
          {t('auth.mockMode', { code: devCode })}
        </p>
      )}

      <div className="mt-6">
        <OtpInput value={code} onChange={setCode} onComplete={submit} invalid={Boolean(error)} label={t('auth.verifyTitle')} />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-alert-red">
          {error}
        </p>
      )}

      <button type="button" className="btn-primary mt-6 w-full" disabled={busy || code.length !== 6} onClick={() => submit(code)}>
        {busy ? t('auth.verifying') : t('auth.createAccount')}
      </button>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          className="link"
          onClick={() => navigate('/register', { replace: true })}
        >
          {t('auth.changeNumber')}
        </button>
        <button type="button" className="font-semibold text-berry-700 disabled:text-ink-muted" onClick={resend} disabled={seconds > 0}>
          {seconds > 0 ? t('auth.resendIn', { seconds }) : t('auth.resend')}
        </button>
      </div>
    </AuthShell>
  );
}
