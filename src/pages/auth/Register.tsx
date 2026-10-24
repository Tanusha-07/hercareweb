import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthShell from '@/components/layout/AuthShell';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useUi } from '@/context/UiContext';
import { isValidPhone } from '@/utils/phone';
import { OtpError } from '@/services/otp';

const schema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
});
type FormValues = z.infer<typeof schema>;

/** Step 1 of onboarding: name + phone, then request an OTP from the server. */
export default function Register() {
  const { t } = useLanguage();
  const { startRegistration } = useAuth();
  const { toast } = useUi();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' });

  const onSubmit = handleSubmit(async ({ name, phone }) => {
    if (!isValidPhone(phone)) {
      setError('phone', { message: t('auth.phoneInvalid') });
      return;
    }
    setSubmitting(true);
    try {
      const res = await startRegistration(phone);
      navigate('/verify-otp', { state: { name, phone, requestId: res.requestId, resendAfterSeconds: res.resendAfterSeconds, devMockCode: res.devMockCode } });
    } catch (err) {
      const code = err instanceof OtpError ? err.code : 'server';
      if (code === 'network') toast(t('auth.networkError'), 'error');
      else if (code === 'rate_limited') toast(t('auth.rateLimited'), 'error');
      else if (code === 'duplicate') toast(t('auth.duplicate'), 'info');
      else toast(t('errors.generic'), 'error');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold text-ink">{t('auth.registerTitle')}</h1>
      <p className="mt-2 text-base text-ink-soft">{t('auth.registerIntro')}</p>

      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label className="field-label" htmlFor="name">
            {t('auth.fullName')}
          </label>
          <input
            id="name"
            className={`input ${errors.name ? 'input-error' : ''}`}
            autoComplete="name"
            placeholder={t('auth.fullNamePlaceholder')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1 text-sm font-semibold text-alert-red">
              {t('auth.nameRequired')}
            </p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="phone">
            {t('auth.phone')}
          </label>
          <div className="flex items-stretch gap-2">
            <span className="inline-flex min-h-tap items-center rounded-xl border-2 border-berry-100 bg-berry-50 px-3 text-lg font-semibold text-berry-700">
              +91
            </span>
            <input
              id="phone"
              className={`input ${errors.phone ? 'input-error' : ''}`}
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
              {...register('phone')}
            />
          </div>
          <p id="phone-hint" className="mt-1 text-sm text-ink-muted">
            {t('auth.phoneHint')}
          </p>
          {errors.phone && (
            <p id="phone-error" role="alert" className="mt-1 text-sm font-semibold text-alert-red">
              {errors.phone.message ?? t('auth.phoneInvalid')}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? t('app.loading') : t('auth.sendOtp')}
        </button>
      </form>
    </AuthShell>
  );
}
