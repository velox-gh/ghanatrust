import { Star } from '@phosphor-icons/react';

/**
 * The one rating component (fills the previously empty file).
 * Display mode: read-only stars. Interactive: radiogroup with keyboard support.
 *
 * <Rating value={4.5} showValue count={23} />
 * <Rating value={reviewRating} onChange={setReviewRating} label="Your rating" />
 */
export default function Rating({ value = 0, onChange, max = 5, size = 16, showValue = false, count, label, className = '' }) {
  const interactive = typeof onChange === 'function';
  const rounded = Math.round(value);

  const stars = Array.from({ length: max }, (_, i) => {
    const starValue = i + 1;
    const filled = starValue <= rounded;

    if (!interactive) {
      return (
        <Star
          key={starValue}
          aria-hidden="true"
          weight={filled ? 'fill' : 'regular'}
          size={size}
          className={filled ? 'text-gold-400' : 'text-slate-300'}
        />
      );
    }

    return (
      <button
        key={starValue}
        type="button"
        role="radio"
        aria-checked={value === starValue}
        aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
        onClick={() => onChange(starValue)}
        className="cursor-pointer p-0.5 transition duration-100 hover:scale-110 motion-reduce:hover:scale-100"
      >
        <Star
          aria-hidden="true"
          weight={filled ? 'fill' : 'regular'}
          size={size + 8}
          className={filled ? 'text-gold-400' : 'text-slate-300 hover:text-gold-300'}
        />
      </button>
    );
  });

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span
        role={interactive ? 'radiogroup' : undefined}
        aria-label={interactive ? label || 'Rating' : undefined}
        className="inline-flex items-center gap-0.5"
      >
        {stars}
      </span>
      {showValue && (
        <span className="text-xs font-black tabular-nums text-slate-800">
          {Number(value).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs font-medium tabular-nums text-slate-500">({count})</span>
      )}
    </span>
  );
}
