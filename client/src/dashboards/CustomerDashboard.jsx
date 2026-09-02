import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlass, CalendarCheck, CalendarBlank, CreditCard, Clock, Wrench,
  CheckCircle, Star, User, ArrowRight, ClipboardText,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { Button, Card, StatusBadge, StatCard, Skeleton, EmptyState } from '../components/ui';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }

  const pending   = bookings.filter(b => b.status === 'REQUESTED').length;
  const active    = bookings.filter(b => ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(b.status)).length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const reviews   = bookings.filter(b => b.review).length;

  // Most recent 4 bookings for the dashboard panel
  const recentBookings = bookings.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">

      {/* ── Welcome Banner ───────────────────────────────────────────────── */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-trust-950 p-8 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-4 items-start md:flex-row md:items-center">
          <div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-trust-300">
              Customer Portal
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Akwaaba, {user?.firstName} {user?.lastName}!
            </h1>
            <p className="mt-1 text-slate-300">
              Find verified, trusted local artisans &amp; service professionals across Ghana.
            </p>
          </div>
          <Button to="/services" variant="onDarkSolid" size="lg" className="whitespace-nowrap">
            Find a Service Pro
          </Button>
        </div>
      </div>

      {/* ── Action Cards ────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          to="/services"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-trust-300 hover:shadow-lift"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100">
            <MagnifyingGlass aria-hidden="true" weight="duotone" size={24} />
          </div>
          <h2 className="mb-1 font-bold tracking-tight text-navy-900">Find Service</h2>
          <p className="text-sm text-slate-500">Browse verified professionals</p>
        </Link>

        <Link
          to="/my-bookings"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-trust-300 hover:shadow-lift"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-trust-50 text-trust-600 transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100">
            <CalendarCheck aria-hidden="true" weight="duotone" size={24} />
          </div>
          <h2 className="mb-1 font-bold tracking-tight text-navy-900">My Bookings</h2>
          <p className="text-sm text-slate-500">View and manage appointments</p>
        </Link>

        <Link
          to="/payments"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-trust-300 hover:shadow-lift"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100">
            <CreditCard aria-hidden="true" weight="duotone" size={24} />
          </div>
          <h2 className="mb-1 font-bold tracking-tight text-navy-900">Payments</h2>
          <p className="text-sm text-slate-500">Transaction history</p>
        </Link>
      </div>

      {/* ── Live Stats Row ────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Clock} tone="amber" label="Pending" value={pending} />
        <StatCard icon={Wrench} tone="blue" label="Active Jobs" value={active} />
        <StatCard icon={CheckCircle} tone="emerald" label="Completed" value={completed} />
        <StatCard icon={Star} tone="purple" label="Reviews Given" value={reviews} />
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* ── Recent Bookings Panel (2/3 width) ─────────────────────────── */}
        <div className="lg:col-span-2">
          <Card padding="p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold tracking-tight text-navy-900">Recent Bookings</h2>
              <Link
                to="/my-bookings"
                className="group inline-flex items-center gap-1 text-xs font-semibold text-trust-600 transition hover:text-trust-700"
              >
                View All
                <ArrowRight aria-hidden="true" weight="bold" size={12} className="transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="p-6">
              {loadingBookings ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : recentBookings.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={CalendarBlank}
                  title="No Bookings Yet"
                  body="Browse verified professionals and request your first job."
                  action={{ label: 'Browse Services', to: '/services' }}
                />
              ) : (
                <div className="space-y-3">
                  {recentBookings.map(b => (
                    <Link
                      key={b.id}
                      to={`/my-bookings/${b.id}`}
                      className="group flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:border-trust-200 hover:bg-trust-50/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-bold text-navy-900 group-hover:text-trust-700">
                            {b.service?.name}
                          </span>
                          <StatusBadge status={b.status} domain="booking" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <User aria-hidden="true" size={12} className="shrink-0 text-slate-400" />
                            {b.provider?.user?.firstName} {b.provider?.user?.lastName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarCheck aria-hidden="true" size={12} className="shrink-0 text-slate-400" />
                            {b.scheduledDate
                              ? new Date(b.scheduledDate).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })
                              : 'TBD'}
                          </span>
                          {b.price && (
                            <span className="font-bold tabular-nums text-trust-700">
                              GH₵ {b.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight
                        aria-hidden="true"
                        weight="bold"
                        size={14}
                        className="ml-3 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-trust-600 motion-reduce:group-hover:translate-x-0"
                      />
                    </Link>
                  ))}

                  {bookings.length > 4 && (
                    <Link
                      to="/my-bookings"
                      className="block pt-2 text-center text-sm font-semibold text-trust-600 transition hover:text-trust-700 hover:underline"
                    >
                      View {bookings.length - 4} more bookings
                    </Link>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Sidebar (1/3 width) ────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <h2 className="mb-4 border-b border-slate-100 pb-3 text-base font-bold tracking-tight text-navy-900">
              Account Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</span>
                <span className="font-semibold text-navy-900">{user?.firstName} {user?.lastName}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email</span>
                <span className="break-all font-semibold text-navy-900">{user?.email}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Phone</span>
                <span className="font-semibold text-navy-900">{user?.phoneNumber || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Account Type</span>
                <span className="mt-1 inline-block">
                  <StatusBadge status={user?.role} domain="role" />
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="mb-4 border-b border-slate-100 pb-3 text-base font-bold tracking-tight text-navy-900">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                to="/services"
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-trust-200 hover:bg-trust-50/50"
              >
                <MagnifyingGlass aria-hidden="true" weight="duotone" size={20} className="shrink-0 text-slate-400 transition group-hover:text-trust-600" />
                <div>
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-trust-700">Browse Services</h3>
                  <p className="text-xs text-slate-500">Electrical, Plumbing, AC &amp; more</p>
                </div>
              </Link>

              <Link
                to="/my-bookings"
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-trust-200 hover:bg-trust-50/50"
              >
                <ClipboardText aria-hidden="true" weight="duotone" size={20} className="shrink-0 text-slate-400 transition group-hover:text-trust-600" />
                <div>
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-trust-700">All Bookings</h3>
                  <p className="text-xs text-slate-500">Track all your service requests</p>
                </div>
                {(pending + active) > 0 && (
                  <span
                    aria-label={`${pending + active} open bookings`}
                    className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-black tabular-nums text-white"
                  >
                    {pending + active}
                  </span>
                )}
              </Link>

              <Link
                to="/my-bookings?filter=COMPLETED"
                className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-gold-200 hover:bg-gold-50/50"
              >
                <Star aria-hidden="true" weight="duotone" size={20} className="shrink-0 text-slate-400 transition group-hover:text-gold-500" />
                <div>
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-gold-700">Leave Reviews</h3>
                  <p className="text-xs text-slate-500">Rate your completed jobs</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
