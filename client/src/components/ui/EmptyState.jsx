import Button from './Button';

/**
 * Consistent empty state with optional CTA.
 * <EmptyState icon={CalendarBlank} title="No bookings yet"
 *   body="Browse verified professionals to get started."
 *   action={{ label: 'Browse Services', to: '/services' }} />
 */
export default function EmptyState({ icon: Icon, title, body, action, size = 'md', className = '' }) {
  const pad = size === 'sm' ? 'px-6 py-10' : 'px-6 py-16';
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 text-center ${pad} ${className}`}>
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon aria-hidden="true" weight="duotone" size={30} />
        </span>
      )}
      <h3 className="text-base font-bold tracking-tight text-slate-800">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{body}</p>}
      {action && (
        <Button
          className="mt-5"
          variant={action.variant || 'primary'}
          size={size === 'sm' ? 'sm' : 'md'}
          to={action.to}
          href={action.href}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
