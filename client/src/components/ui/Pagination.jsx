import { CaretLeft, CaretRight } from '@phosphor-icons/react';

/** Compact page list: 1 … 4 5 [6] 7 8 … 12 */
const pageWindow = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
};

/**
 * Pagination controls — wires up the admin page state that previously
 * drove API calls with no visible controls.
 */
export default function Pagination({ page, totalPages, onPageChange, className = '' }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-3 ${className}`}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <CaretLeft aria-hidden="true" weight="bold" size={12} /> Prev
      </button>

      <div className="flex items-center gap-1">
        {pageWindow(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs font-bold text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              className={[
                'h-9 w-9 cursor-pointer rounded-lg text-xs font-bold tabular-nums transition',
                p === page ? 'bg-trust-600 text-white shadow-cta' : 'text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next <CaretRight aria-hidden="true" weight="bold" size={12} />
      </button>
    </nav>
  );
}
