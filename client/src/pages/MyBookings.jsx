import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  REQUESTED:   { label: 'Requested',   color: 'bg-amber-100 text-amber-800 border-amber-300',  icon: '🟡' },
  ACCEPTED:    { label: 'Accepted',    color: 'bg-blue-100 text-blue-800 border-blue-300',      icon: '🔵' },
  SCHEDULED:   { label: 'Scheduled',   color: 'bg-indigo-100 text-indigo-800 border-indigo-300',icon: '📅' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-orange-100 text-orange-800 border-orange-300',icon: '🔧' },
  COMPLETED:   { label: 'Completed',   color: 'bg-emerald-100 text-emerald-800 border-emerald-300',icon: '✅' },
  PAID:        { label: 'Paid',        color: 'bg-green-100 text-green-800 border-green-300',   icon: '💰' },
  REVIEWED:    { label: 'Reviewed',    color: 'bg-purple-100 text-purple-800 border-purple-300',icon: '⭐' },
  CANCELLED:   { label: 'Cancelled',   color: 'bg-red-100 text-red-800 border-red-300',         icon: '❌' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-700', icon: '●' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
const CancelModal = ({ booking, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Booking?</h3>
      <p className="text-sm text-slate-600 mb-4">
        Are you sure you want to cancel your <strong>{booking?.service?.name}</strong> booking with{' '}
        <strong>{booking?.provider?.user?.firstName} {booking?.provider?.user?.lastName}</strong>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
        >
          Keep Booking
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Cancelling...' : 'Yes, Cancel'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Action Buttons ───────────────────────────────────────────────────────────
const BookingActions = ({ booking, role, onAction, loadingId }) => {
  const isLoading = loadingId === booking.id;
  const s = booking.status;

  if (role === 'PROVIDER') {
    return (
      <div className="flex flex-wrap gap-2">
        {s === 'REQUESTED' && (
          <button
            onClick={() => onAction(booking, 'accept')}
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isLoading ? '...' : '✅ Accept Job'}
          </button>
        )}
        {s === 'ACCEPTED' && (
          <button
            onClick={() => onAction(booking, 'start')}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? '...' : '🔧 Start Job'}
          </button>
        )}
        {s === 'IN_PROGRESS' && (
          <button
            onClick={() => onAction(booking, 'complete')}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isLoading ? '...' : '🏁 Mark Complete'}
          </button>
        )}
      </div>
    );
  }

  if (role === 'CUSTOMER') {
    return (
      <div className="flex flex-wrap gap-2">
        {(s === 'COMPLETED' || s === 'PAID') && !booking.review && (
          <Link
            to={`/my-bookings/${booking.id}`}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition"
          >
            ⭐ Leave Review
          </Link>
        )}
        {['REQUESTED', 'ACCEPTED', 'SCHEDULED'].includes(s) && (
          <button
            onClick={() => onAction(booking, 'cancel')}
            disabled={isLoading}
            className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 text-xs font-bold rounded-xl hover:bg-red-200 transition disabled:opacity-50"
          >
            {isLoading ? '...' : '❌ Cancel'}
          </button>
        )}
      </div>
    );
  }

  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      alert(err.response?.data?.message || 'Action failed. Please try again.');
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
      alert(err.response?.data?.message || 'Cancel failed. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter options
  const filterOptions = ['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const filtered = filterStatus === 'ALL' ? bookings : bookings.filter(b => b.status === filterStatus);

  const pendingCount = bookings.filter(b => b.status === 'REQUESTED').length;
  const activeCount = bookings.filter(b => ['ACCEPTED', 'IN_PROGRESS', 'SCHEDULED'].includes(b.status)).length;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {role === 'PROVIDER' ? '🔧 Job Requests & Bookings' : '📋 My Bookings'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'PROVIDER'
              ? 'Accept incoming requests, manage active jobs, and track completions.'
              : 'Track your service requests, provider updates, and job history.'}
          </p>
        </div>

        {/* Stats Row */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Pending</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-black text-blue-600">{activeCount}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Active</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-black text-emerald-600">
                {bookings.filter(b => b.status === 'COMPLETED').length}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Completed</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filterOptions.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                filterStatus === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {s === 'ALL' ? 'All Bookings' : STATUS_CONFIG[s]?.icon + ' ' + STATUS_CONFIG[s]?.label}
              {s === 'REQUESTED' && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
        )}

        {/* Booking List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <span className="text-5xl block mb-4">📅</span>
            <h3 className="text-xl font-bold text-slate-800">
              {filterStatus === 'ALL' ? 'No Bookings Yet' : `No ${STATUS_CONFIG[filterStatus]?.label} Bookings`}
            </h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              {filterStatus === 'ALL'
                ? 'Browse verified service providers to request your first job.'
                : 'Try a different filter above.'}
            </p>
            {filterStatus === 'ALL' && (
              <Link
                to="/services"
                className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
              >
                Find a Service Pro
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <div
                key={booking.id}
                className={`bg-white rounded-2xl border shadow-sm p-6 transition ${
                  booking.status === 'REQUESTED' ? 'border-amber-300 ring-1 ring-amber-200' :
                  booking.status === 'IN_PROGRESS' ? 'border-blue-300 ring-1 ring-blue-100' :
                  'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3 flex-wrap">
                      <h3 className="font-black text-lg text-slate-900">{booking.service?.name}</h3>
                      <StatusBadge status={booking.status} />
                    </div>

                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {booking.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-500">
                      {role === 'CUSTOMER' && (
                        <span>
                          👤 Provider: <strong className="text-slate-700">
                            {booking.provider?.user?.firstName} {booking.provider?.user?.lastName}
                          </strong>
                        </span>
                      )}
                      {role === 'PROVIDER' && (
                        <span>
                          👤 Customer: <strong className="text-slate-700">
                            {booking.customer?.firstName} {booking.customer?.lastName}
                          </strong>
                        </span>
                      )}
                      <span>
                        🗓️ Scheduled: <strong className="text-slate-700">
                          {booking.scheduledDate
                            ? new Date(booking.scheduledDate).toLocaleDateString('en-GH', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : 'TBD'}
                        </strong>
                      </span>
                      {booking.price && (
                        <span>
                          💰 Rate: <strong className="text-emerald-700">GH₵ {booking.price.toFixed(2)}</strong>
                        </span>
                      )}
                      <span>
                        📬 Requested: <strong className="text-slate-700">
                          {new Date(booking.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-end justify-between gap-3 min-w-[160px]">
                    <Link
                      to={`/my-bookings/${booking.id}`}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      View Details →
                    </Link>
                    <BookingActions
                      booking={booking}
                      role={role}
                      onAction={handleAction}
                      loadingId={loadingId}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}
    </div>
  );
};

export default MyBookings;