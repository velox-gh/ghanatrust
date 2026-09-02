import { WarningCircle, CheckCircle, Info, Warning, X } from '@phosphor-icons/react';

const TONES = {
  success: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: CheckCircle },
  error: { cls: 'bg-red-50 border-red-200 text-red-800', icon: WarningCircle },
  warning: { cls: 'bg-amber-50 border-amber-200 text-amber-800', icon: Warning },
  info: { cls: 'bg-blue-50 border-blue-200 text-blue-800', icon: Info },
};

/** Inline feedback banner — replaces alert() calls. Announced politely. */
export default function Alert({ tone = 'info', title, children, onClose, className = '' }) {
  const { cls, icon: Icon } = TONES[tone] || TONES.info;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${cls} ${className}`}
    >
      <Icon aria-hidden="true" weight="fill" size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="shrink-0 cursor-pointer rounded-md p-0.5 opacity-60 transition hover:opacity-100"
        >
          <X size={14} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
