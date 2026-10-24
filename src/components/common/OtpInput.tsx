import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  label?: string;
  invalid?: boolean;
}

/**
 * Accessible 6-digit OTP input: one box per digit, arrow/backspace navigation,
 * auto-advance, and paste support. Kept fully controlled by the parent.
 */
export default function OtpInput({ value, onChange, length = 6, onComplete, label, invalid }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char.replace(/\D/g, '').slice(-1);
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (char && index < length - 1) refs.current[index + 1]?.focus();
    if (joined.length === length && !joined.includes('')) onComplete?.(joined);
  };

  return (
    <div
      className="flex justify-center gap-2"
      role="group"
      aria-label={label ?? 'One-time code'}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="\d*"
          maxLength={1}
          value={d}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            if (pasted) {
              onChange(pasted);
              refs.current[Math.min(pasted.length, length - 1)]?.focus();
              if (pasted.length === length) onComplete?.(pasted);
            }
          }}
          className={`h-14 w-12 rounded-xl border-2 bg-white text-center text-2xl font-bold text-ink focus:outline-none ${
            invalid ? 'border-alert-red' : 'border-berry-200 focus:border-berry-400'
          }`}
        />
      ))}
    </div>
  );
}
