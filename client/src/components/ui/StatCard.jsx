/**
 * KPI tile — consolidates the three divergent stat-card patterns.
 * Tone classes are static (Tailwind can't compile dynamic names).
 */
const TONES = {
  emerald: 'bg-emerald-50 text-emerald-600',
  trust: 'bg-trust-50 text-trust-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  gold: 'bg-gold-50 text-gold-600',
  slate: 'bg-slate-100 text-slate-500',
  navy: 'bg-navy-100 text-navy-700',
};

const VALUE_TONES = {
  emerald: 'text-emerald-600',
  trust: 'text-trust-600',
  amber: 'text-amber-600',
  blue: 'text-blue-600',
  indigo: 'text-indigo-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  gold: 'text-gold-600',
  slate: 'text-slate-700',
  navy: 'text-navy-900',
};

export default function StatCard({ icon: Icon, tone = 'trust', label, value, sublabel, className = '' }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card ${className}`}>
      {Icon && (
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone] || TONES.trust}`}>
          <Icon aria-hidden="true" weight="duotone" size={24} />
        </span>
      )}
      <div className="min-w-0">
        <h3 className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</h3>
        <p className={`mt-0.5 text-2xl font-black tabular-nums tracking-tight ${VALUE_TONES[tone] || VALUE_TONES.trust}`}>
          {value}
        </p>
        {sublabel && <p className="mt-0.5 truncate text-xs text-slate-500">{sublabel}</p>}
      </div>
    </div>
  );
}
