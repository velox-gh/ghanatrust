import { resolveStatus, humaniseStatus, NEUTRAL_TONE } from './statusTokens';

/**
 * The one status pill. Color + icon + text (never color alone).
 * <StatusBadge status="PAID" /> — domain auto-detected; pass domain="payment" to disambiguate.
 */
export default function StatusBadge({ status, domain, size = 'md', className = '' }) {
  const token = resolveStatus(status, domain);
  const label = token ? token.label : humaniseStatus(status) || 'Unknown';
  const tone = token ? token.tone : NEUTRAL_TONE;
  const Icon = token?.icon;

  const sizing =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1'
      : size === 'lg'
        ? 'text-xs px-3.5 py-1.5 gap-1.5'
        : 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${tone} ${sizing} ${className}`}
    >
      {Icon && <Icon aria-hidden="true" weight="bold" className="shrink-0" size={size === 'sm' ? 10 : 12} />}
      {label}
    </span>
  );
}
