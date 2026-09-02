import { useId } from 'react';
import { CaretDown, Warning } from '@phosphor-icons/react';

/**
 * Labelled form control with associated label, hint and error.
 * Fixes the app-wide missing htmlFor/id association.
 *
 * <Field label="Email" type="email" error={err} hint="We never share it" />
 * <Field as="textarea" label="Describe the job" rows={4} />
 * <Field as="select" label="Region" options={[{value:'Accra', label:'Greater Accra'}]} />
 */
const CONTROL_BASE =
  'w-full rounded-xl border bg-slate-50 font-medium text-slate-900 placeholder:text-slate-400 ' +
  'transition duration-150 focus:outline-none focus:ring-2 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed';

const SIZES = {
  md: 'px-4 py-3 text-base', // 16px — avoids iOS focus zoom
  sm: 'px-3 py-2.5 text-sm',
};

export default function Field({
  as = 'input',
  label,
  hint,
  error,
  required = false,
  size = 'md',
  id,
  className = '',
  options = [],
  children,
  ...rest
}) {
  const autoId = useId();
  const inputId = id || `gt-field-${autoId}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const controlClass = [
    CONTROL_BASE,
    SIZES[size] || SIZES.md,
    as === 'textarea' ? 'leading-relaxed' : '',
    error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-400 bg-red-50/40'
      : 'border-slate-200 focus:ring-trust-500 focus:border-trust-500',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  let control;
  if (as === 'select') {
    control = (
      <div className="relative">
        <select id={inputId} required={required || undefined} className={`${controlClass} cursor-pointer appearance-none pr-10`}>
          {children ||
            options.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={value} value={value}>
                  {optLabel}
                </option>
              );
            })}
        </select>
        <CaretDown
          aria-hidden="true"
          size={14}
          weight="bold"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    );
  } else if (as === 'textarea') {
    control = (
      <textarea id={inputId} required={required || undefined} className={controlClass} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...rest} />
    );
  } else {
    control = (
      <input id={inputId} required={required || undefined} className={controlClass} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...rest} />
    );
  }

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-600">
          <Warning aria-hidden="true" weight="fill" size={13} /> {error}
        </p>
      )}
    </div>
  );
}
