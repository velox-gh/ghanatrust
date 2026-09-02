/** Loading placeholder rectangle — set height/width via className. */
export default function Skeleton({ className = '', rounded = 'rounded-xl' }) {
  return <div aria-hidden="true" className={`animate-pulse bg-slate-200/70 ${rounded} ${className}`} />;
}
