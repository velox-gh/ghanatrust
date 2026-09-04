import { getCategoryIcon } from './ui/categoryIcons';

/**
 * Jiji-style category tiles: a horizontally scrolling rail on phones, a grid on
 * desktop. Filters the feed in place rather than navigating away — the point of
 * the feed-first homepage is that browsing never leaves the page.
 */
const CategoryStrip = ({ categories, selectedId, onSelect }) => {
  if (!categories.length) return null;

  const tile = (active) =>
    [
      'flex shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-center transition duration-200',
      'w-[5.5rem] sm:w-auto',
      active
        ? 'border-trust-500 bg-trust-50 text-trust-800 shadow-card'
        : 'border-slate-200 bg-white text-slate-700 hover:border-trust-300 hover:bg-trust-50/40',
    ].join(' ');

  return (
    <nav aria-label="Service categories">
      <ul
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-8"
        style={{ scrollbarWidth: 'thin' }}
      >
        <li>
          <button
            type="button"
            onClick={() => onSelect('')}
            aria-pressed={!selectedId}
            className={tile(!selectedId)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-sm font-black text-white">
              All
            </span>
            <span className="text-[11px] font-bold leading-tight">Everything</span>
          </button>
        </li>

        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          const active = String(selectedId) === String(cat.id);
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSelect(active ? '' : cat.id)}
                aria-pressed={active}
                className={tile(active)}
              >
                <Icon aria-hidden="true" weight="duotone" size={30} className={active ? 'text-trust-600' : 'text-navy-700'} />
                <span className="text-[11px] font-bold leading-tight">{cat.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategoryStrip;
