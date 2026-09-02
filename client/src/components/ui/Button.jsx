import { Link } from 'react-router-dom';
import Spinner from './Spinner';

/**
 * The one button. Replaces ~12 hand-rolled variants.
 *
 * variant: primary | secondary | ghost | danger | success | onDark | onDarkSolid
 * size:    sm | md | lg   (md/lg keep 44px touch targets)
 * loading: shows spinner, disables, keeps width (aria-busy)
 * Render as <Link> via `to`, or <a> via `href`.
 */
const VARIANTS = {
  primary:
    'bg-trust-600 text-white shadow-cta hover:bg-trust-700 active:bg-trust-800',
  secondary:
    'bg-white text-slate-700 border border-slate-300 shadow-card hover:bg-slate-50 hover:border-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300',
  success:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
  onDark:
    'bg-white/10 text-white border border-white/25 hover:bg-white/20 backdrop-blur-sm',
  onDarkSolid: 'bg-white text-navy-900 shadow-lg hover:bg-slate-100',
};

const SIZES = {
  sm: 'px-3 py-2 text-xs min-h-10 gap-1.5',
  md: 'px-4 py-2.5 text-sm min-h-11 gap-2',
  lg: 'px-6 py-3.5 text-base min-h-12 gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  to,
  href,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'inline-flex items-center justify-center rounded-xl font-bold tracking-tight',
    'transition duration-150 cursor-pointer select-none',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  ].join(' ');

  const content = (
    <>
      {loading && <Spinner size="xs" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-busy={loading || undefined} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} aria-busy={loading || undefined} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled || loading} className={classes} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
