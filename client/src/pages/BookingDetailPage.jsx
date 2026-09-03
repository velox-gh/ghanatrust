import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock, CheckCircle, Handshake, CalendarCheck, Wrench, FlagCheckered,
  CurrencyCircleDollar, Star, XCircle, ClipboardText, Users, Chats, CreditCard,
  Scales, MapPin, PaperPlaneRight, ArrowLeft,
} from '@phosphor-icons/react';
import { bookingAPI, paymentAPI, disputeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Button, Card, StatusBadge, Field, Modal, Alert, Rating, Spinner, EmptyState,
} from '../components/ui';

// ─── Status Step Timeline ─────────────────────────────────────────────────────
const STEPS = [
  { key: 'REQUESTED',     label: 'Requested',     icon: Clock },
  { key: 'ACCEPTED',      label: 'Accepted',      icon: CheckCircle },
  { key: 'PRICE_AGREED',  label: 'Price Agreed',  icon: Handshake },
  { key: 'SCHEDULED',     label: 'Scheduled',     icon: CalendarCheck },
  { key: 'IN_PROGRESS',   label: 'In Progress',   icon: Wrench },
  { key: 'COMPLETED',     label: 'Completed',     icon: FlagCheckered },
  { key: 'PAID',          label: 'Paid',          icon: CurrencyCircleDollar },
  { key: 'REVIEWED',      label: 'Reviewed',      icon: Star },
];

const STATUS_ORDER = ['REQUESTED', 'ACCEPTED', 'PRICE_AGREED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'REVIEWED'];

const StatusTimeline = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <XCircle aria-hidden="true" weight="fill" size={24} className="shrink-0 text-red-500" />
        <div>
          <p className="font-bold text-red-700">Booking Cancelled</p>
          <p className="text-xs text-red-600">This booking was cancelled and is no longer active.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="relative">
      <div className="relative flex items-start justify-between overflow-x-auto pb-1">
        {/* Progress bar */}
        <div className="absolute left-0 right-0 top-4 z-0 h-1 bg-slate-200 sm:top-5" aria-hidden="true">
          <div
            className="h-full bg-trust-500 transition-all duration-500"
            style={{ width: `${Math.max(0, (currentIdx / (STATUS_ORDER.length - 1)) * 100)}%` }}
          />
        </div>

        {STEPS.map((step) => {
          const StepIcon = step.icon;
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const isDone = currentIdx > stepIdx;
          const isActive = currentIdx === stepIdx;

          return (
            <div key={step.key} className="relative z-10 flex min-w-14 flex-1 flex-col items-center gap-1.5">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition sm:h-10 sm:w-10',
                  isDone
                    ? 'border-trust-500 bg-trust-500 text-white'
                    : isActive
                      ? 'border-trust-600 bg-trust-600 text-white ring-4 ring-trust-100'
                      : 'border-slate-300 bg-white text-slate-400',
                ].join(' ')}
              >
                {isDone ? (
                  <CheckCircle aria-hidden="true" weight="fill" size={20} />
                ) : (
                  <StepIcon aria-hidden="true" weight={isActive ? 'fill' : 'regular'} size={16} />
                )}
              </div>
              <span
                className={[
                  'text-center text-[10px] font-semibold leading-tight sm:text-xs',
                  isActive ? 'text-trust-700' : isDone ? 'text-trust-700' : 'text-slate-500',
                ].join(' ')}
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

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionPrice, setCompletionPrice] = useState('');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [error, setError] = useState('');
  // Inline feedback state (replaces alert() calls)
  const [feedback, setFeedback] = useState(null); // { tone, text } shown near actions
  const [chatError, setChatError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [paymentError, setPaymentError] = useState('');

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
      setChatError('');
    } catch {
      setChatError('Failed to send message. Please try again.');
    }
  };

  const handleAction = async (action, price = null) => {
    if (action === 'agreePrice' && !price) {
      setShowCompleteModal(true); // Using the same modal state for price agreement
      return;
    }

    setActionLoading(action);
    setFeedback(null);
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
      setFeedback({ tone: 'success', text: 'Booking updated.' });
    } catch (err) {
      setFeedback({ tone: 'error', text: err.response?.data?.message || 'Action failed.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('review');
    setReviewError('');
    try {
      await bookingAPI.createReview({
        bookingId: id,
        rating: reviewRating,
        comment: reviewComment
      });
      setShowReviewModal(false);
      await fetchBooking(); // Reload booking to show review
      setFeedback({ tone: 'success', text: 'Thanks! Your review has been published.' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setActionLoading('');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('payment');
    setPaymentError('');
    try {
      // Backend computes the amount from the booking — never trusted from the client
      const res = await paymentAPI.initializePayment(id);
      const data = res.data;
      if (!data.success) throw new Error(data.message);

      // Redirect to Paystack's secure checkout (MoMo / card)
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Failed to initiate payment.');
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
        setShowDisputeModal(false);
        navigate(`/disputes/${res.data.data.id}`);
      }
    } catch (err) {
      setFeedback({ tone: 'error', text: err.response?.data?.message || 'Failed to file dispute' });
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <Spinner size="lg" className="text-trust-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
        <div className="w-full max-w-md">
          <EmptyState
            icon={XCircle}
            title="Booking unavailable"
            body={error || 'Booking not found'}
            action={{ label: 'Back to My Bookings', to: '/my-bookings' }}
          />
        </div>
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
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/my-bookings" className="font-semibold transition hover:text-trust-600">My Bookings</Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-700" aria-current="page">Booking #{booking.id}</span>
        </nav>

        {/* Page-level feedback (replaces alert()) */}
        {feedback && (
          <Alert tone={feedback.tone} className="mb-6" onClose={() => setFeedback(null)}>
            {feedback.text}
          </Alert>
        )}

        {/* Status Timeline Card */}
        <Card className="mb-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-navy-900">{booking.service?.name}</h1>
              <p className="mt-0.5 text-sm text-slate-500">Booking #{booking.id}</p>
            </div>
            <StatusBadge status={s} domain="booking" size="lg" />
          </div>
          <StatusTimeline status={s} />
        </Card>

        {/* Details Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Booking Info */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-bold tracking-tight text-navy-900">
              <ClipboardText aria-hidden="true" weight="duotone" size={19} className="text-trust-600" />
              Booking Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Service</span>
                <span className="font-semibold text-navy-900">{booking.service?.name}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description</span>
                <span className="text-slate-600">{booking.description || '—'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Date</span>
                <span className="font-semibold text-navy-900">
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
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">End Date</span>
                  <span className="font-semibold text-navy-900">
                    {new Date(booking.scheduledEndDate).toLocaleString('en-GH', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {booking.price && (
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Agreed Rate</span>
                  <span className="text-xl font-black tabular-nums text-trust-600">
                    GH₵ {booking.price.toFixed(2)}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Booked On</span>
                <span className="text-slate-600">
                  {new Date(booking.createdAt).toLocaleDateString('en-GH', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* People Info */}
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-bold tracking-tight text-navy-900">
              <Users aria-hidden="true" weight="duotone" size={19} className="text-trust-600" />
              Parties
            </h2>
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-blue-700">Customer</span>
                <p className="font-bold text-navy-900">
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </p>
                <p className="text-xs text-slate-600">{booking.customer?.email}</p>
                {booking.customer?.phoneNumber && (
                  <p className="text-xs text-slate-600">{booking.customer?.phoneNumber}</p>
                )}
              </div>

              <div className="rounded-xl border border-trust-100 bg-trust-50 p-3">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-trust-700">Service Provider</span>
                <p className="font-bold text-navy-900">
                  {booking.provider?.user?.firstName} {booking.provider?.user?.lastName}
                </p>
                {booking.provider?.businessName && (
                  <p className="text-xs text-slate-600">{booking.provider.businessName}</p>
                )}
                <p className="text-xs text-slate-600">{booking.provider?.user?.email}</p>
                {booking.provider?.user?.phoneNumber && (
                  <p className="text-xs text-slate-600">{booking.provider?.user?.phoneNumber}</p>
                )}
              </div>

              {booking.location && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <MapPin aria-hidden="true" weight="fill" size={12} /> Location
                  </span>
                  <p className="font-semibold text-navy-900">{booking.location.name}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Review Card (if exists) */}
        {booking.review && (
          <div className="mb-6 rounded-2xl border border-gold-200 bg-gold-50 p-6">
            <h2 className="mb-3 flex items-center gap-2 font-bold tracking-tight text-gold-800">
              <Star aria-hidden="true" weight="fill" size={18} className="text-gold-500" />
              Customer Review
            </h2>
            <div className="mb-2 flex items-center gap-2">
              <Rating value={booking.review.rating} size={16} showValue />
              <span className="sr-only-x">{booking.review.rating} out of 5</span>
            </div>
            {booking.review.comment && (
              <p className="text-sm italic text-slate-700">&ldquo;{booking.review.comment}&rdquo;</p>
            )}
          </div>
        )}

        {/* Price Negotiation Chat */}
        {(s === 'ACCEPTED' || s === 'PRICE_AGREED') && (
          <Card className="mb-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold tracking-tight text-navy-900">
              <Chats aria-hidden="true" weight="duotone" size={19} className="text-trust-600" />
              Negotiation &amp; Chat
            </h2>

            <div className="mb-4 flex h-80 flex-col rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <p className="mt-20 text-center text-sm text-slate-500">No messages yet. Start negotiating!</p>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                          isMine
                            ? 'rounded-br-sm bg-trust-600 text-white'
                            : 'rounded-bl-sm border border-slate-200 bg-white text-navy-900'
                        }`}>
                          <p className={`mb-1 text-[10px] font-semibold ${isMine ? 'text-trust-100' : 'text-slate-500'}`}>
                            {isMine ? 'You' : msg.sender?.firstName || 'User'} · {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="rounded-b-xl border-t border-slate-200 bg-white p-3">
                {chatError && (
                  <Alert tone="error" className="mb-2" onClose={() => setChatError('')}>
                    {chatError}
                  </Alert>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <label htmlFor="chat-message" className="sr-only-x">Type a message</label>
                  <input
                    id="chat-message"
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-navy-900 placeholder:text-slate-400 transition focus:border-trust-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-trust-500/40"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()} aria-label="Send message">
                    Send <PaperPlaneRight aria-hidden="true" weight="fill" size={14} />
                  </Button>
                </form>
              </div>
            </div>

            {s === 'ACCEPTED' && isProvider && (
              <p className="mt-2 text-xs font-semibold text-gold-700">
                Once you and the customer agree on a price, click &ldquo;Set Agreed Price&rdquo; below.
              </p>
            )}
            {s === 'PRICE_AGREED' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-trust-700">
                <Handshake aria-hidden="true" weight="fill" size={13} />
                Price has been agreed upon! Provider can now start the job.
              </p>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-bold tracking-tight text-navy-900">
            <FlagCheckered aria-hidden="true" weight="duotone" size={19} className="text-trust-600" />
            Actions
          </h2>
          <div className="flex flex-wrap gap-3">

            {/* Provider actions */}
            {canAccept && (
              <Button onClick={() => handleAction('accept')} loading={actionLoading === 'accept'} disabled={!!actionLoading}>
                <CheckCircle aria-hidden="true" weight="bold" size={15} /> Accept Job
              </Button>
            )}
            {canSetPrice && (
              <Button onClick={() => handleAction('agreePrice')} loading={actionLoading === 'agreePrice'} disabled={!!actionLoading}>
                <CurrencyCircleDollar aria-hidden="true" weight="bold" size={15} /> Set Agreed Price
              </Button>
            )}
            {canStart && (
              <Button onClick={() => handleAction('start')} loading={actionLoading === 'start'} disabled={!!actionLoading}>
                <Wrench aria-hidden="true" weight="bold" size={15} /> Start Job
              </Button>
            )}
            {canComplete && (
              <Button variant="success" onClick={() => handleAction('complete')} loading={actionLoading === 'complete'} disabled={!!actionLoading} className="!bg-trust-600 !text-white !border-trust-600 hover:!bg-trust-700">
                <FlagCheckered aria-hidden="true" weight="bold" size={15} /> Mark as Complete
              </Button>
            )}

            {/* Customer actions */}
            {canPay && (
              <Button onClick={() => setShowPaymentModal(true)}>
                <CreditCard aria-hidden="true" weight="bold" size={15} /> Pay Now via Mobile Money
              </Button>
            )}
            {canReview && (
              <Button variant="secondary" onClick={() => setShowReviewModal(true)}>
                <Star aria-hidden="true" weight="fill" size={14} className="text-gold-400" /> Leave a Review
              </Button>
            )}
            {canCancel && (
              <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                <XCircle aria-hidden="true" weight="bold" size={15} /> Cancel Booking
              </Button>
            )}

            {s !== 'CANCELLED' && s !== 'REQUESTED' && s !== 'REJECTED' && (isCustomer || isProvider) && (
              <Button variant="secondary" onClick={() => setShowDisputeModal(true)} className="!border-gold-300 !bg-gold-50 !text-gold-800 hover:!bg-gold-100">
                <Scales aria-hidden="true" weight="bold" size={15} /> File a Dispute
              </Button>
            )}

            {/* Always: Back */}
            <Button variant="secondary" to="/my-bookings">
              <ArrowLeft aria-hidden="true" weight="bold" size={14} /> Back to List
            </Button>
          </div>

          {s === 'COMPLETED' && !booking.review && isCustomer && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gold-700">
              <Star aria-hidden="true" weight="fill" size={13} />
              This job is complete! Your review helps other customers find great providers.
            </p>
          )}
          {s === 'CANCELLED' && (
            <p className="mt-3 text-xs text-red-600">This booking has been cancelled.</p>
          )}
        </Card>
      </div>

      {/* Cancel Modal */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel This Booking?"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={!!actionLoading} autoFocus>
              Keep Booking
            </Button>
            <Button
              onClick={() => handleAction('cancel')}
              loading={actionLoading === 'cancel'}
              disabled={!!actionLoading}
              className="!border-red-600 !bg-red-600 !text-white hover:!bg-red-700"
            >
              {actionLoading === 'cancel' ? 'Cancelling…' : 'Yes, Cancel Booking'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Are you sure you want to cancel your <strong>{booking.service?.name}</strong> booking?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Review Modal */}
      <Modal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Leave a Review"
        size="md"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="gt-review-form"
              loading={actionLoading === 'review'}
              disabled={actionLoading === 'review'}
            >
              {actionLoading === 'review' ? 'Submitting…' : 'Submit Review'}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          How was your experience with <strong>{booking.provider?.user?.firstName}</strong>?
        </p>
        <form id="gt-review-form" onSubmit={handleReviewSubmit}>
          <div className="mb-4">
            <span className="mb-2 block text-sm font-bold text-navy-900" id="gt-rating-label">Rating</span>
            <Rating value={reviewRating} onChange={setReviewRating} size={20} label="Your rating" />
          </div>
          <Field
            as="textarea"
            label="Comment"
            name="reviewComment"
            rows={4}
            required
            placeholder="Tell others about the service you received..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
          {reviewError && (
            <Alert tone="error" className="mt-3" onClose={() => setReviewError('')}>
              {reviewError}
            </Alert>
          )}
        </form>
      </Modal>

      {/* Complete Job Modal / Agree Price Modal */}
      <Modal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Set Agreed Price"
        size="md"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="gt-price-form"
              loading={actionLoading === 'agreePrice'}
              disabled={actionLoading === 'agreePrice'}
            >
              Set Price GH₵ {completionPrice || '0'}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          Enter the final negotiated price. Once set, you can start the job!
        </p>
        <form id="gt-price-form" onSubmit={(e) => { e.preventDefault(); handleAction('agreePrice', completionPrice); }}>
          <Field
            label="Agreed Price (GH₵)"
            name="completionPrice"
            type="number"
            required
            min="1"
            step="0.01"
            placeholder="e.g. 150.00"
            value={completionPrice}
            onChange={(e) => setCompletionPrice(e.target.value)}
          />
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Secure Mobile Money Payment"
        size="md"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowPaymentModal(false)} disabled={actionLoading === 'payment'}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="gt-payment-form"
              loading={actionLoading === 'payment'}
              disabled={actionLoading === 'payment'}
            >
              Pay GH₵ {booking.price?.toFixed(2) || '0.00'}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          You are paying <strong className="tabular-nums">GH₵ {booking.price?.toFixed(2) || '0.00'}</strong> to{' '}
          <strong>{booking.provider?.user?.firstName}</strong> for the <strong>{booking.service?.name}</strong> service.
        </p>
        <form id="gt-payment-form" onSubmit={handlePaymentSubmit}>
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            You'll be redirected to <strong>Paystack</strong>, our secure payment partner, to approve this payment via
            <strong> MTN MoMo, Telecel Cash, AT Money</strong> or card. Never share your PIN with anyone.
          </p>
          {actionLoading === 'payment' && (
            <Alert tone="info" className="mt-3">
              Redirecting to secure checkout…
            </Alert>
          )}
          {paymentError && (
            <Alert tone="error" className="mt-3" onClose={() => setPaymentError('')}>
              {paymentError}
            </Alert>
          )}
        </form>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        open={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="File a Dispute"
        size="md"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowDisputeModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="gt-dispute-form"
              loading={actionLoading === 'dispute'}
              disabled={actionLoading === 'dispute'}
              className="!border-gold-600 !bg-gold-600 !text-white hover:!bg-gold-700"
            >
              {actionLoading === 'dispute' ? 'Submitting…' : 'Submit Dispute'}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          Having issues with this booking? Describe the problem below. Our admin team will investigate.
        </p>
        <form id="gt-dispute-form" onSubmit={handleDisputeSubmit}>
          <Field
            as="select"
            label="Reason for Dispute *"
            required
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          >
            <option value="">Select a reason...</option>
            <option value="No Show">No Show</option>
            <option value="Poor Quality">Poor Quality of Work</option>
            <option value="Unprofessional Behavior">Unprofessional Behavior</option>
            <option value="Payment Issue">Payment Issue</option>
            <option value="Other">Other</option>
          </Field>
          <div className="mt-4">
            <Field
              as="textarea"
              label="Additional Details"
              name="disputeDescription"
              rows={4}
              placeholder="Please provide any additional context..."
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingDetailPage;
