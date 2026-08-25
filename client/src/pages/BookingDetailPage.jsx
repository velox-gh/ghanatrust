import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Status Step Timeline ─────────────────────────────────────────────────────
const STEPS = [
  { key: 'REQUESTED',   label: 'Requested',   icon: '📋' },
  { key: 'ACCEPTED',    label: 'Accepted',     icon: '✅' },
  { key: 'IN_PROGRESS', label: 'In Progress',  icon: '🔧' },
  { key: 'COMPLETED',   label: 'Completed',    icon: '🏁' },
];

const STATUS_ORDER = ['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'REVIEWED'];

const StatusTimeline = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-bold text-red-700">Booking Cancelled</p>
          <p className="text-xs text-red-500">This booking was cancelled and is no longer active.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="relative">
      <div className="flex items-center justify-between relative">
        {/* Progress bar */}
        <div className="absolute left-0 right-0 top-5 h-1 bg-slate-200 z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(0, (Math.min(currentIdx, 3) / 3) * 100)}%` }}
          />
        </div>

        {STEPS.map((step, i) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const isDone = currentIdx > stepIdx;
          const isActive = STATUS_ORDER.indexOf(status) === stepIdx ||
            (step.key === 'IN_PROGRESS' && status === 'SCHEDULED');
          const isFuture = !isDone && !isActive;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                    ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs font-semibold text-center leading-tight ${
                  isActive ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Detail Page ─────────────────────────────────────────────────────────
const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState('');

  const fetchBooking = useCallback(async () => {
    try {
      const res = await bookingAPI.getBookingById(id);
      setBooking(res.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      if (action === 'accept')    await bookingAPI.updateStatus(id, 'ACCEPTED');
      if (action === 'start')     await bookingAPI.updateStatus(id, 'IN_PROGRESS');
      if (action === 'complete')  await bookingAPI.completeBooking(id);
      if (action === 'cancel') {
        await bookingAPI.cancelBooking(id);
        setShowCancelModal(false);
      }
      await fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <span className="text-4xl">😕</span>
        <p className="text-slate-600">{error || 'Booking not found'}</p>
        <Link to="/my-bookings" className="text-blue-600 hover:underline text-sm font-semibold">
          ← Back to My Bookings
        </Link>
      </div>
    );
  }

  const s = booking.status;
  const isProvider = role === 'PROVIDER';
  const isCustomer = role === 'CUSTOMER';
  const canCancel = isCustomer && ['REQUESTED', 'ACCEPTED', 'SCHEDULED'].includes(s);
  const canAccept = isProvider && s === 'REQUESTED';
  const canStart = isProvider && s === 'ACCEPTED';
  const canComplete = isProvider && s === 'IN_PROGRESS';
  const canReview = isCustomer && (s === 'COMPLETED' || s === 'PAID') && !booking.review;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/my-bookings" className="hover:text-blue-600 font-semibold">My Bookings</Link>
          <span>/</span>
          <span className="text-slate-700">Booking #{booking.id}</span>
        </div>

        {/* Status Timeline Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{booking.service?.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">Booking #{booking.id}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              s === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
              s === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-300' :
              s === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700 border-orange-300' :
              s === 'ACCEPTED' ? 'bg-blue-100 text-blue-700 border-blue-300' :
              'bg-amber-100 text-amber-700 border-amber-300'
            }`}>
              {s.replace('_', ' ')}
            </span>
          </div>
          <StatusTimeline status={s} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Booking Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">📋 Booking Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Service</span>
                <span className="font-semibold text-slate-800">{booking.service?.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Description</span>
                <span className="text-slate-600">{booking.description || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Scheduled Date</span>
                <span className="font-semibold text-slate-800">
                  {booking.scheduledDate
                    ? new Date(booking.scheduledDate).toLocaleString('en-GH', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : 'To be confirmed'}
                </span>
              </div>
              {booking.scheduledEndDate && (
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold block">End Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(booking.scheduledEndDate).toLocaleString('en-GH', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {booking.price && (
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Agreed Rate</span>
                  <span className="text-xl font-black text-emerald-600">GH₵ {booking.price.toFixed(2)}</span>
                </div>
              )}
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold block">Booked On</span>
                <span className="text-slate-600">
                  {new Date(booking.createdAt).toLocaleDateString('en-GH', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* People Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">👥 Parties</h2>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xs text-blue-500 font-bold uppercase block mb-1">Customer</span>
                <p className="font-bold text-slate-800">
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </p>
                <p className="text-xs text-slate-500">{booking.customer?.email}</p>
                {booking.customer?.phoneNumber && (
                  <p className="text-xs text-slate-500">{booking.customer?.phoneNumber}</p>
                )}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-600 font-bold uppercase block mb-1">Service Provider</span>
                <p className="font-bold text-slate-800">
                  {booking.provider?.user?.firstName} {booking.provider?.user?.lastName}
                </p>
                {booking.provider?.businessName && (
                  <p className="text-xs text-slate-600">{booking.provider.businessName}</p>
                )}
                <p className="text-xs text-slate-500">{booking.provider?.user?.email}</p>
                {booking.provider?.user?.phoneNumber && (
                  <p className="text-xs text-slate-500">{booking.provider?.user?.phoneNumber}</p>
                )}
              </div>

              {booking.location && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-bold uppercase block mb-1">📍 Location</span>
                  <p className="font-semibold text-slate-800">{booking.location.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Card (if exists) */}
        {booking.review && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 mb-6">
            <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">⭐ Customer Review</h2>
            <div className="flex items-center gap-2 mb-2">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={n <= booking.review.rating ? 'text-amber-400 text-lg' : 'text-slate-300 text-lg'}>★</span>
              ))}
              <span className="text-sm font-bold text-amber-700">{booking.review.rating}/5</span>
            </div>
            {booking.review.comment && (
              <p className="text-sm text-slate-700 italic">"{booking.review.comment}"</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">

            {/* Provider actions */}
            {canAccept && (
              <button
                onClick={() => handleAction('accept')}
                disabled={!!actionLoading}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {actionLoading === 'accept' ? 'Accepting...' : '✅ Accept Job'}
              </button>
            )}
            {canStart && (
              <button
                onClick={() => handleAction('start')}
                disabled={!!actionLoading}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {actionLoading === 'start' ? 'Starting...' : '🔧 Start Job'}
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => handleAction('complete')}
                disabled={!!actionLoading}
                className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
              >
                {actionLoading === 'complete' ? 'Completing...' : '🏁 Mark as Complete'}
              </button>
            )}

            {/* Customer actions */}
            {canReview && (
              <Link
                to={`/my-bookings/${booking.id}`}
                className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition"
              >
                ⭐ Leave a Review
              </Link>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-2.5 bg-red-100 text-red-700 border border-red-300 font-bold rounded-xl hover:bg-red-200 transition"
              >
                ❌ Cancel Booking
              </button>
            )}

            {/* Always: Back */}
            <Link
              to="/my-bookings"
              className="px-6 py-2.5 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
            >
              ← Back to List
            </Link>
          </div>

          {s === 'COMPLETED' && !booking.review && isCustomer && (
            <p className="text-xs text-amber-600 mt-3 font-semibold">
              ⭐ This job is complete! Your review helps other customers find great providers.
            </p>
          )}
          {s === 'CANCELLED' && (
            <p className="text-xs text-red-500 mt-3">This booking has been cancelled.</p>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel This Booking?</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to cancel your <strong>{booking.service?.name}</strong> booking?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailPage;
