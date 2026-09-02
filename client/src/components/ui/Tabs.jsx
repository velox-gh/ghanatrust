import { useRef } from 'react';

/**
 * Accessible tab bar — replaces the two near-identical TabButton copies.
 * role=tablist/tab, aria-selected, arrow-key navigation, count badges.
 *
 * const [tab, setTab] = useState('overview');
 * <TabBar
 *   tabs={[{ id: 'disputes', label: 'Disputes', icon: Scales, count: openDisputes }]}
 *   active={tab} onChange={setTab} ariaLabel="Admin sections"
 * />
 * Content: <div role="tabpanel" aria-labelledby={tabId('disputes', 'admin')}>
 */
export const tabId = (id, groupId = 'gt') => `gt-tab-${groupId}-${id}`;
export const tabPanelId = (id, groupId = 'gt') => `gt-tabpanel-${groupId}-${id}`;

export default function TabBar({ tabs, active, onChange, groupId = 'gt', ariaLabel, className = '' }) {
  const listRef = useRef(null);

  const onKeyDown = (e) => {
    const idx = tabs.findIndex((t) => t.id === active);
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      onChange(next.id);
      listRef.current?.querySelector(`#${CSS.escape(tabId(next.id, groupId))}`)?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`flex gap-1 overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            id={tabId(tab.id, groupId)}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={tabPanelId(tab.id, groupId)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={[
              'flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-4 py-3 text-sm font-semibold transition duration-150',
              isActive
                ? 'border-trust-600 bg-trust-50/60 text-trust-700'
                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800',
            ].join(' ')}
          >
            {Icon && <Icon aria-hidden="true" weight={isActive ? 'fill' : 'regular'} size={16} />}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                  isActive ? 'bg-trust-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
