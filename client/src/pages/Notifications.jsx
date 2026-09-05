import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Checks, CalendarCheck, Wrench, Trophy, CurrencyCircleDollar,
  Scales, Rocket, SealCheck, EnvelopeSimple, ArrowRight,
} from '@phosphor-icons/react';
import { notificationAPI } from '../services/api';
import { Button, Card, EmptyState, Skeleton, TabBar } from '../components/ui';

const TYPE_META = {
  BOOKING_REQUEST: { icon: CalendarCheck, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
  BOOKING_ACCEPTED: { icon: CalendarCheck, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  BOOKING_SCHEDULED: { icon: CalendarCheck, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
  BOOKING_IN_PROGRESS: { icon: Wrench, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  BOOKING_COMPLETED: { icon: Trophy, tone: 'text-gold-700 bg-gold-50 border-gold-100' },
  PAYMENT_RECEIVED: { icon: CurrencyCircleDollar, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  PAYMENT_CONFIRMED: { icon: SealCheck, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  SUBSCRIPTION_ACTIVE: { icon: Rocket, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  DISPUTE_UPDATE: { icon: Scales, tone: 'text-rose-600 bg-rose-50 border-rose-100' },
  EMAIL: { icon: EnvelopeSimple, tone: 'text-slate-600 bg-slate-50 border-slate-100' },
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
};

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.list(tab === 'unread' ? { unreadOnly: 'true' } : {});
      setItems(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openItem = async (n) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      notificationAPI.markRead(n.id).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
    notificationAPI.markAllRead().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-navy-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-navy-900">
              <Bell aria-hidden="true" weight="duotone" size={26} className="text-trust-600" />
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You\u2019re all caught up.'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAll}>
              <Checks aria-hidden="true" weight="bold" size={14} />
              Mark all read
            </Button>
          )}
        </div>

        <div className="mb-6">
          <TabBar
            ariaLabel="Notification filter"
            tabs={[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread${unreadCount ? ` (${unreadCount})` : ''}` },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        <Card padding="p-0" className="overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              body="Booking updates, payments, and plan activity will land here."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.EMAIL;
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={`flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition hover:bg-slate-50 ${
                        !n.isRead ? 'bg-trust-50/40' : ''
                      }`}
                    >
                      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.tone}`}>
                        <Icon aria-hidden="true" weight="duotone" size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={`truncate text-sm ${n.isRead ? 'font-semibold text-slate-700' : 'font-bold text-navy-900'}`}>
                            {n.title}
                          </span>
                          {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-trust-500" aria-label="unread" />}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{n.message}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-400">
                        {timeAgo(n.createdAt)}
                        {n.link && <ArrowRight aria-hidden="true" size={12} weight="bold" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
