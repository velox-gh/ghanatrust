import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, ClipboardText, CalendarBlank, User, CalendarCheck, CurrencyCircleDollar,
  EnvelopeSimple, ArrowRight, CheckCircle, PlayCircle, FlagCheckered, XCircle, Star,
} from '@phosphor-icons/react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Button, Card, StatusBadge, StatCard, TabBar, Modal, Alert, Skeleton, EmptyState,
} from '../components/ui';

// ─── Action Buttons ───────────────────────────────────────────────────────────
const BookingActions = ({ booking, role, onAction, loadingId }) => {
  const isLoading = loadingId === booking.id;
  const s = booking.status;

  if (role === 'PROVIDER') {
    return (
      <div className="flex flex-wrap gap-2">
        {s === 'REQUESTED' && (
          <Button size="sm" onClick={() => onAction(booking, 'accept')} loading={isLoading}>
            <CheckCircle aria-hidden="true" weight="bold" size={14} /> Accept Job
          </Button>
        )}
        {s === 'ACCEPTED' && (
          <Button size="sm" onClick={() => onAction(booking, 'start')} loading={isLoading}>
            <PlayCircle aria-hidden="true" weight="bold" size={14} /> Start Job
          </Button>
        )}
        {s === 'IN_PROGRESS' && (
          <Button size="sm" variant="success" onClick={() => onAction(booking, 'complete')} loading={isLoading}>
            <FlagCheckered aria-hidden="true" weight="bold" size={14} /> Mark Complete
          </Button>
        )}
      </div>
    );
  }

  if (role === 'CUSTOMER') {
    return (
      <div className="flex flex-wrap gap-2">
        {(s === 'COMPLETED' || s === 'PAID') && !booking.review && (
          <Button size="sm" variant="secondary" to={`/my-bookings/${booking.id}`}>
            <Star aria-hidden="true" weight="fill" size={13} className="text-gold-400" /> Leave Review
          </Button>
        )}
        {['REQUESTED', 'ACCEPTED', 'SCHEDULED'].includes(s) && (
          <Button size="sm" variant="danger" onClick={() => onAction(booking, 'cancel')} loading={isLoading}>
            <XCircle aria-hidden="true" weight="bold" size={14} /> Cancel
          </Button>
        )}
      </div>
    );
  }

  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MyBookings = () => {
  const { user } = useAuth();
  const role = user?.role;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAction = async (booking, action) => {
    if (action === 'cancel') {
      setCancelTarget(booking);
      return;
    }

    setLoadingId(booking.id);
    try {
      if (action === 'accept') {
        await bookingAPI.updateStatus(booking.id, 'ACCEPTED');
      } else if (action === 'start') {
        await bookingAPI.updateStatus(booking.id, 'IN_PROGRESS');
      } else if (action === 'complete') {
        await bookingAPI.completeBooking(booking.id);
      }
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please try again.');
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    try {
      await bookingAPI.cancelBooking(cancelTarget.id);
      setCancelTarget(null);
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed. Please try again.');
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter tabs — REQUESTED/ACCEPTED/IN_PROGRESS/COMPLETED/CANCELLED (+ PRICE_AGREED & SCHEDULED grouped flows)
  const pendingCount = bookings.filter((b) => b.status === 'REQUESTED').length;
  const activeCount = bookings.filter((b) =>
    ['ACCEPTED', 'IN_PROGRESS', 'SCHEDULED'].includes(b.status)
  ).length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  const filterOptions = [
    { id: 'ALL', label: 'All Bookings', icon: ClipboardText },
    { id: 'REQUESTED', label: 'Requested', icon: EnvelopeSimple, count: pendingCount },
    { id: 'ACCEPTED', label: 'Active', icon: Wrench, count: activeCount },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle, count: completedCount },
    { id: 'CANCELLED', label: 'Cancelled', icon: XCircle },
  ];
  const filtered =
    filterStatus === 'ALL'
      ? bookings
      : bookings.filter((b) =>
          filterStatus === 'ACCEPTED'
            ? ['ACCEPTED', 'PRICE_AGREED', 'SCHEDULED', 'IN_PROGRESS'].includes(b.status)
            : filterStatus === 'COMPLETED'
              ? ['COMPLETED', 'PAID', 'REVIEWED'].includes(b.status)
              : b.status === filterStatus
        );

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-navy-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-trust-50 text-trust-600">
              {role === 'PROVIDER' ? (
                <Wrench aria-hidden="true" weight="duotone" size={22} />
              ) : (
                <ClipboardText aria-hidden="true" weight="duotone" size={22} />
              )}
            </span>
            {role === 'PROVIDER' ? 'Job Requests & Bookings' : 'My Bookings'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {role === 'PROVIDER'
              ? 'Accept incoming requests, manage active jobs, and track completions.'
              : 'Track your service requests, provider updates, and job history.'}
          </p>
        </div>

        {/* Stats Row */}
        {bookings.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={EnvelopeSimple} tone="amber" label="Pending" value={pendingCount} sublabel="Awaiting response" />
            <StatCard icon={Wrench} tone="blue" label="Active" value={activeCount} sublabel="Scheduled or in progress" />
            <StatCard icon={CheckCircle} tone="emerald" label="Completed" value={completedCount} sublabel="Finished jobs" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert tone="error" onClose={() => setError('')} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Filter Tabs */}
        <Card padding="px-2 py-0" className="mb-6 inline-flex max-w-full">
          <TabBar
            tabs={filterOptions}
            active={filterStatus}
            onChange={setFilterStatus}
            ariaLabel="Filter bookings by status"
          />
        </Card>

        {/* Booking List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarBlank}
            title={filterStatus === 'ALL' ? 'No Bookings Yet' : 'No Bookings in This Filter'}
            body={
              filterStatus === 'ALL'
                ? 'Browse verified service providers to request your first job.'
                : 'Try a different filter above.'
            }
            action={filterStatus === 'ALL' ? { label: 'Find a Service Pro', to: '/' } : undefined}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <Card
                key={booking.id}
                padding="p-6"
                className={[
                  booking.status === 'REQUESTED'
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : booking.status === 'IN_PROGRESS'
                      ? 'border-blue-300 ring-1 ring-blue-100'
                      : '',
                ].join(' ')}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-black tracking-tight text-navy-900">{booking.service?.name}</h2>
                      <StatusBadge status={booking.status} domain="booking" />
                    </div>

                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {booking.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-500 md:grid-cols-3">
                      {role === 'CUSTOMER' && (
                        <span className="flex items-center gap-1.5">
                          <User aria-hidden="true" size={13} className="shrink-0 text-slate-400" />
                          Provider:&nbsp;
                          <strong className="font-semibold text-slate-700">
                            {booking.provider?.user?.firstName} {booking.provider?.user?.lastName}
                          </strong>
                        </span>
                      )}
                      {role === 'PROVIDER' && (
                        <span className="flex items-center gap-1.5">
                          <User aria-hidden="true" size={13} className="shrink-0 text-slate-400" />
                          Customer:&nbsp;
                          <strong className="font-semibold text-slate-700">
                            {booking.customer?.firstName} {booking.customer?.lastName}
                          </strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck aria-hidden="true" size={13} className="shrink-0 text-slate-400" />
                        Scheduled:&nbsp;
                        <strong className="font-semibold text-slate-700">
                          {booking.scheduledDate
                            ? new Date(booking.scheduledDate).toLocaleDateString('en-GH', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : 'TBD'}
                        </strong>
                      </span>
                      {booking.price && (
                        <span className="flex items-center gap-1.5">
                          <CurrencyCircleDollar aria-hidden="true" size={13} className="shrink-0 text-slate-400" />
                          Rate:&nbsp;
                          <strong className="font-semibold text-trust-700 tabular-nums">
                            GH₵ {booking.price.toFixed(2)}
                          </strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <EnvelopeSimple aria-hidden="true" size={13} className="shrink-0 text-slate-400" />
                        Requested:&nbsp;
                        <strong className="font-semibold text-slate-700">
                          {new Date(booking.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex min-w-40 flex-col items-stretch justify-between gap-3 md:items-end">
                    <Link
                      to={`/my-bookings/${booking.id}`}
                      className="group inline-flex items-center gap-1 text-xs font-bold text-trust-600 transition hover:text-trust-700"
                    >
                      View Details
                      <ArrowRight aria-hidden="true" weight="bold" size={12} className="transition group-hover:translate-x-0.5" />
                    </Link>
                    <BookingActions booking={booking} role={role} onAction={handleAction} loadingId={loadingId} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)} disabled={cancelLoading} autoFocus>
              Keep Booking
            </Button>
            <Button loading={cancelLoading} onClick={handleCancelConfirm} className="!bg-red-600 !text-white !border-red-600 hover:!bg-red-700">
              Yes, Cancel Booking
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Are you sure you want to cancel your <strong>{cancelTarget?.service?.name}</strong> booking with{' '}
          <strong>
            {cancelTarget?.provider?.user?.firstName} {cancelTarget?.provider?.user?.lastName}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default MyBookings;
