import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/** Four large single-digit boxes with auto-advance, backspace and paste support. */
export function OtpInput({ value, onChange, error, disabled, autoFocus }) {
  const refs = useRef([]);
  // The value is always a contiguous string of up to 4 digits.
  const digits = [0, 1, 2, 3].map((i) => value[i] || '');

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const typeAt = (i, d) => {
    const pos = Math.min(i, value.length);
    onChange((value.slice(0, pos) + d + value.slice(pos + 1)).slice(0, 4));
    refs.current[Math.min(pos + 1, 3)]?.focus();
  };
  const removeAt = (i) => onChange(value.slice(0, i) + value.slice(i + 1));

  return (
    <div className="flex justify-center gap-3" role="group" aria-label="Enter 4-digit delivery OTP">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1);
            if (v) typeAt(i, v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault();
              if (d) removeAt(i);
              else if (i > 0) {
                removeAt(Math.min(i - 1, value.length - 1));
                refs.current[i - 1]?.focus();
              }
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
            if (pasted) {
              e.preventDefault();
              onChange(pasted);
              refs.current[Math.min(pasted.length, 3)]?.focus();
            }
          }}
          className={cn(
            'h-16 w-14 rounded-2xl border-2 bg-white text-center text-3xl font-extrabold tabular-nums transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:bg-slate-900',
            error ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700',
          )}
        />
      ))}
    </div>
  );
}
