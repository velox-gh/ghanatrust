import { ShieldCheck, SealCheck, Trophy } from '@phosphor-icons/react';

/**
 * GhanaTrust 3-level verification system as UI.
 *
 * Levels: 1 = Ghana Card ID + phone · 2 = trade skill certified · 3 = verified track record
 *
 * <TrustBadge level={2} />                    — single pill (highest achieved level)
 * <TrustBadge levels={{identity:true, skills:false, track:true}} /> — compact 3-dot strip
 */
const LEVELS = {
  1: {
    label: 'ID Verified',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ShieldCheck,
  },
  2: {
    label: 'Trade Certified',
    cls: 'bg-trust-50 text-trust-700 border-trust-200',
    icon: SealCheck,
  },
  3: {
    label: 'Trusted Pro',
    cls: 'bg-gold-50 text-gold-700 border-gold-200',
    icon: Trophy,
  },
};

/** Pill for the highest achieved level. */
export default function TrustBadge({ level = 1, size = 'md', className = '' }) {
  const cfg = LEVELS[level] || LEVELS[1];
  const Icon = cfg.icon;
  const sizing =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1'
      : size === 'lg'
        ? 'text-xs px-3.5 py-1.5 gap-1.5'
        : 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <span
      title={`GhanaTrust Level ${level} — ${cfg.label}`}
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${cfg.cls} ${sizing} ${className}`}
    >
      <Icon aria-hidden="true" weight="fill" size={size === 'sm' ? 11 : 13} />
      <span>
        <span className="sr-only-x">Level {level}: </span>
        {cfg.label}
      </span>
    </span>
  );
}

/**
 * Compact three-state strip — shows each level's achievement
 * (filled = achieved, outline = not yet).
 */
export function TrustLevelDots({ identity = false, skills = false, track = false, size = 14 }) {
  const items = [
    { on: identity, label: 'Ghana Card ID verified', icon: ShieldCheck, onCls: 'text-blue-600', offCls: 'text-slate-300' },
    { on: skills, label: 'Trade skills certified', icon: SealCheck, onCls: 'text-trust-600', offCls: 'text-slate-300' },
    { on: track, label: 'Verified track record', icon: Trophy, onCls: 'text-gold-500', offCls: 'text-slate-300' },
  ];
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`Verification: ${items.filter((i) => i.on).map((i) => i.label).join(', ') || 'none'}`}>
      {items.map(({ on, label, icon: Icon, onCls, offCls }) => (
        <Icon
          key={label}
          aria-hidden="true"
          weight={on ? 'fill' : 'regular'}
          size={size}
          title={label}
          className={on ? onCls : offCls}
        />
      ))}
    </span>
  );
}
