import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingAPI, paymentAPI, disputeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// ─── Status Step Timeline ─────────────────────────────────────────────────────
const STEPS = [
  { key: 'REQUESTED',   label: 'Requested',   icon: '📋' },
  { key: 'ACCEPTED',    label: 'Accepted',     icon: '✅' },
  { key: 'IN_PROGRESS', label: 'In Progress',  icon: '🔧' },
  { key: 'COMPLETED',   label: 'Completed',    icon: '🏁' },
];

const STATUS_ORDER = ['REQUESTED', 'ACCEPTED', 'PRICE_AGREED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'REVIEWED'];

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [momoNumber, setMomoNumber] = useState('');
  
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionPrice, setCompletionPrice] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [error, setError] = useState('');

  const fetchBooking = useCallback(async () => {
    try {
      const res = await bookingAPI.getBookingById(id);
      if (res.data.success) {
        setBooking(res.data.booking);
        if (res.data.booking.status === 'ACCEPTED' || res.data.booking.status === 'PRICE_AGREED') {
          const msgRes = await bookingAPI.getMessages(id);
          setMessages(msgRes.data.messages);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const { socket } = useSocket();

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  useEffect(() => {
    if (!socket) return;

    // Join the booking room
    socket.emit('join_booking', id);

    // Listen for new messages
    const handleNewMessage = (msg) => {
      if (msg.bookingId === parseInt(id)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    // Listen for booking status updates
    const handleBookingUpdate = (updatedBooking) => {
      if (updatedBooking.id === parseInt(id)) {
        setBooking(updatedBooking);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('booking_updated', handleBookingUpdate);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('booking_updated', handleBookingUpdate);
    };
  }, [socket, id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await bookingAPI.sendMessage(id, newMessage);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const handleAction = async (action, price = null) => {
    if (action === 'agreePrice' && !price) {
      setShowCompleteModal(true); // Using the same modal state for price agreement
      return;
    }
    
    setActionLoading(action);
    try {
      if (action === 'accept') await bookingAPI.updateStatus(id, 'ACCEPTED');
      if (action === 'agreePrice') {
        await bookingAPI.agreePrice(id, price);
        setShowCompleteModal(false);
      }
      if (action === 'start') await bookingAPI.updateStatus(id, 'IN_PROGRESS');
      if (action === 'complete') {
        await bookingAPI.completeBooking(id);
      }
      if (action === 'cancel') {
        await bookingAPI.cancelBooking(id);
        setShowCancelModal(false);
      }
      await fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading('');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('review');
    try {
      await bookingAPI.createReview({
        bookingId: id,
        rating: reviewRating,
        comment: reviewComment
      });
      setShowReviewModal(false);
      await fetchBooking(); // Reload booking to show review
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setActionLoading('');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('payment');
    try {
      // Need to import paymentAPI at top of file, wait I didn't import it in this replace block!
      // Wait, let me just add it. Wait, I can't import inside the function. I'll need to update imports.
      // But let me use the fetch call directly or assume we import paymentAPI.
      alert('Processing payment...');
      const res = await paymentAPI.createPayment({
        bookingId: id,
        amount: booking.price,
        mobileMoneyNumber: momoNumber
      });
      const data = res.data;
      if (!data.success) throw new Error(data.message);
      
      alert(data.message);
      setShowPaymentModal(false);
      
      // Since mock payment takes 3s to update DB, let's poll or just reload after 3.5s
      setTimeout(() => {
        fetchBooking();
      }, 3500);

    } catch (err) {
      alert(err.message || 'Failed to initiate payment.');
    } finally {
      setActionLoading('');
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason) return;
    try {
      setActionLoading('dispute');
      const res = await disputeAPI.createDispute({ bookingId: id, reason: disputeReason, description: disputeDescription });
      if (res.data.success) {
        alert('Dispute submitted successfully');
        setShowDisputeModal(false);
        navigate(`/disputes/${res.data.data.id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to file dispute');
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
  const canCancel = isCustomer && ['REQUESTED', 'ACCEPTED', 'PRICE_AGREED', 'SCHEDULED'].includes(s);
  const canAccept = isProvider && s === 'REQUESTED';
  const canSetPrice = isProvider && s === 'ACCEPTED';
  const canStart = isProvider && s === 'PRICE_AGREED';
  const canComplete = isProvider && s === 'IN_PROGRESS';
  const canPay = isCustomer && s === 'COMPLETED';
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

        {/* Price Negotiation Chat */}
        {(s === 'ACCEPTED' || s === 'PRICE_AGREED') && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">💬 Negotiation & Chat</h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl flex flex-col h-80 mb-4">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center mt-20">No messages yet. Start negotiating!</p>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          isMine ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                        }`}>
                          <p className="font-semibold text-[10px] mb-1 opacity-70">
                            {isMine ? 'You' : msg.sender?.firstName || 'User'} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-3 bg-white border-t border-slate-200 rounded-b-xl">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
            
            {s === 'ACCEPTED' && isProvider && (
              <p className="text-xs text-amber-600 font-semibold mt-2">
                Once you and the customer agree on a price, click "Set Agreed Price" below.
              </p>
            )}
            {s === 'PRICE_AGREED' && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Price has been agreed upon! Provider can now start the job.
              </p>
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
            {canSetPrice && (
              <button
                onClick={() => handleAction('agreePrice')}
                disabled={!!actionLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {actionLoading === 'agreePrice' ? 'Setting...' : '💰 Set Agreed Price'}
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
            {canPay && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition"
              >
                💳 Pay Now via Mobile Money
              </button>
            )}
            {canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition"
              >
                ⭐ Leave a Review
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-2.5 bg-red-100 text-red-700 border border-red-300 font-bold rounded-xl hover:bg-red-200 transition"
              >
                ❌ Cancel Booking
              </button>
            )}
            
            {s !== 'CANCELLED' && s !== 'REQUESTED' && s !== 'REJECTED' && (isCustomer || isProvider) && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="px-6 py-2.5 bg-orange-100 text-orange-800 border border-orange-300 font-bold rounded-xl hover:bg-orange-200 transition"
              >
                ⚖️ File a Dispute
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Leave a Review</h3>
            <p className="text-sm text-slate-600 mb-4">
              How was your experience with <strong>{booking.provider?.user?.firstName}</strong>?
            </p>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl ${reviewRating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Comment</label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  rows="4"
                  placeholder="Tell others about the service you received..."
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'review'}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50"
                >
                  {actionLoading === 'review' ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Job Modal / Agree Price Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">💰 Set Agreed Price</h3>
            <p className="text-sm text-slate-600 mb-6">
              Enter the final negotiated price. Once set, you can start the job!
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleAction('agreePrice', completionPrice); }}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Agreed Price (GH₵)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  value={completionPrice}
                  onChange={(e) => setCompletionPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'agreePrice'}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {actionLoading === 'agreePrice' ? 'Saving...' : 'Set Price GH₵ ' + (completionPrice || '0')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Mobile Money Payment</h3>
            <p className="text-sm text-slate-600 mb-6">
              You are paying <strong>GH₵ {booking.price?.toFixed(2) || '0.00'}</strong> to <strong>{booking.provider?.user?.firstName}</strong> for the <strong>{booking.service?.name}</strong> service.
            </p>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Money Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 024XXXXXXX or 055XXXXXXX"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  A payment prompt will be sent to this number. Please authorize the transaction on your phone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'payment'}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {actionLoading === 'payment' ? 'Processing...' : 'Pay GH₵ ' + (booking.price?.toFixed(2) || '0.00')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">File a Dispute</h3>
            <p className="text-sm text-slate-600 mb-4">
              Having issues with this booking? Describe the problem below. Our admin team will investigate.
            </p>
            <form onSubmit={handleDisputeSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Dispute *</label>
                <select
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Select a reason...</option>
                  <option value="No Show">No Show</option>
                  <option value="Poor Quality">Poor Quality of Work</option>
                  <option value="Unprofessional Behavior">Unprofessional Behavior</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Details</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Please provide any additional context..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'dispute'}
                  className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {actionLoading === 'dispute' ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailPage;
