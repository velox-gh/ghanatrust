import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, ClipboardText, PlusCircle, CreditCard, ShieldCheck, User, CalendarCheck,
  ArrowRight, CheckCircle, XCircle, Hourglass, IdentificationCard, Certificate,
  MapPin, Phone, Trophy, Package, Gear,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { providerAPI, bookingAPI, serviceAPI } from '../services/api';
import {
  Button, Card, StatusBadge, StatCard, TabBar, Field, Alert, ConfirmDialog,
  Skeleton, EmptyState, TrustBadge, Rating,
} from '../components/ui';

// ─── Verification state tile ──────────────────────────────────────────────────
const VerificationState = {
  VERIFIED: {
    cls: 'bg-trust-50 border-trust-200 text-trust-800',
    icon: CheckCircle,
    iconCls: 'text-trust-500',
    label: 'Verified',
  },
  PENDING: {
    cls: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: Hourglass,
    iconCls: 'text-amber-500',
    label: 'Under Review',
  },
  NONE: {
    cls: 'bg-slate-50 border-slate-200 text-slate-500',
    icon: XCircle,
    iconCls: 'text-slate-400',
    label: 'Not Submitted',
  },
};

const VerificationBadge = ({ label, verified, pendingStatus, icon: Icon }) => {
  const state = verified ? VerificationState.VERIFIED : pendingStatus === 'PENDING' ? VerificationState.PENDING : VerificationState.NONE;
  const StateIcon = state.icon;
  return (
    <div className={`rounded-xl border p-4 ${state.cls}`}>
      <span className="block text-xs font-bold uppercase tracking-wider">{label}</span>
      <span className="mt-1 flex items-center gap-1.5 text-base font-bold">
        <StateIcon aria-hidden="true" weight="fill" size={16} className={state.iconCls} />
        {state.label}
      </span>
      <span className="sr-only-x">{label}: {state.label}</span>
      {Icon && <Icon aria-hidden="true" weight="duotone" size={18} className="float-right -mt-6 opacity-40" />}
    </div>
  );
};

// ─── Incoming Job Request Card ─────────────────────────────────────────────────
const JobCard = ({ booking, onAction, loadingId }) => {
  const isLoading = loadingId === booking.id;
  const s = booking.status;

  return (
    <div
      className={`rounded-xl border bg-white shadow-card transition ${
        s === 'REQUESTED' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-100'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="truncate font-bold tracking-tight text-navy-900">{booking.service?.name}</h3>
            <StatusBadge status={s} domain="booking" />
          </div>
          <p className="mb-2 line-clamp-1 text-xs text-slate-500">
            {booking.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User aria-hidden="true" size={13} className="shrink-0 text-slate-400" />
              <strong className="font-semibold text-slate-700">
                {booking.customer?.firstName} {booking.customer?.lastName}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              <CalendarCheck aria-hidden="true" size={13} className="shrink-0 text-slate-400" />
              <strong className="font-semibold text-slate-700">
                {booking.scheduledDate
                  ? new Date(booking.scheduledDate).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'TBD'}
              </strong>
            </span>
            {booking.price && (
              <span className="font-bold tabular-nums text-trust-700">GH₵ {booking.price.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link
            to={`/my-bookings/${booking.id}`}
            className="group inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-trust-600 transition hover:text-trust-700"
          >
            View Details
            <ArrowRight aria-hidden="true" weight="bold" size={11} className="transition group-hover:translate-x-0.5" />
          </Link>
          <div className="flex flex-wrap justify-end gap-2">
            {s === 'REQUESTED' && (
              <Button size="sm" onClick={() => onAction(booking.id, 'accept')} loading={isLoading}>
                <CheckCircle aria-hidden="true" weight="bold" size={13} /> Accept
              </Button>
            )}
            {s === 'ACCEPTED' && (
              <Button size="sm" variant="secondary" onClick={() => onAction(booking.id, 'start')} loading={isLoading}>
                <Wrench aria-hidden="true" weight="bold" size={13} /> Start Job
              </Button>
            )}
            {s === 'IN_PROGRESS' && (
              <Button size="sm" variant="success" onClick={() => onAction(booking.id, 'complete')} loading={isLoading}>
                <Trophy aria-hidden="true" weight="bold" size={13} /> Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main ProviderDashboard ────────────────────────────────────────────────────
const ProviderDashboard = () => {
  const { user, refreshUser } = useAuth();
  const provider = user?.provider;

  // Verification state
  const [verifications, setVerifications] = useState([]);
  const [loadingVerifications, setLoadingVerifications] = useState(true);
  const [identityDoc, setIdentityDoc] = useState('');
  const [identityNote, setIdentityNote] = useState('');
  const [skillsDoc, setSkillsDoc] = useState('');
  const [skillsNote, setSkillsNote] = useState('');
  const [submitLoading, setSubmitLoading] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);

  // Booking state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('incoming');

  // Services state
  const [allServices, setAllServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [serviceActionLoading, setServiceActionLoading] = useState(false);

  // Feedback & confirms
  const [feedback, setFeedback] = useState(null); // { tone, text }
  const [removeTarget, setRemoveTarget] = useState(null); // provider-service id pending removal

  useEffect(() => {
    fetchMyVerifications();
    fetchBookings();
    fetchAllServices();
  }, []);

  async function fetchMyVerifications() {
    try {
      const res = await providerAPI.getMyVerifications();
      setVerifications(res.data.verifications || []);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoadingVerifications(false);
    }
  }

  async function fetchBookings() {
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }

  async function fetchAllServices() {
    try {
      const res = await serviceAPI.getServices();
      setAllServices(res.data.services || []);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  }

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName) return;
    setServiceActionLoading(true);
    try {
      await providerAPI.addService({
        serviceName: newServiceName
      });
      await refreshUser();
      setNewServiceName('');
      setFeedback({ tone: 'success', text: 'Service added to your profile.' });
    } catch (err) {
      setFeedback({ tone: 'error', text: err.response?.data?.message || 'Failed to add service' });
    } finally {
      setServiceActionLoading(false);
    }
  };

  const handleRemoveService = async (id) => {
    setServiceActionLoading(true);
    try {
      await providerAPI.removeService(id);
      await refreshUser();
      setFeedback({ tone: 'success', text: 'Service removed from your profile.' });
    } catch (err) {
      setFeedback({ tone: 'error', text: err.response?.data?.message || 'Failed to remove service' });
    } finally {
      setServiceActionLoading(false);
      setRemoveTarget(null);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    setLoadingId(bookingId);
    try {
      if (action === 'accept')   await bookingAPI.updateStatus(bookingId, 'ACCEPTED');
      if (action === 'start')    await bookingAPI.updateStatus(bookingId, 'IN_PROGRESS');
      if (action === 'complete') await bookingAPI.completeBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      setFeedback({ tone: 'error', text: err.response?.data?.message || 'Action failed. Please try again.' });
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusForType = (type) => {
    const req = verifications.find(v => v.type === type);
    return req?.status || null;
  };

  const handleVerificationSubmit = async (type, documentUrl, notes) => {
    setSubmitLoading(type);
    setSubmitMessage(null);
    try {
      await providerAPI.submitVerification({ type, documentUrl, notes });
      setSubmitMessage({ type: 'success', text: `${type === 'IDENTITY' ? 'Identity' : 'Skills'} verification submitted! Our team will review it shortly.` });
      fetchMyVerifications();
      if (type === 'IDENTITY') { setIdentityDoc(''); setIdentityNote(''); }
      if (type === 'SKILLS')   { setSkillsDoc('');   setSkillsNote(''); }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: `Failed to submit. ${err.response?.data?.message || 'Try again.'}` });
    } finally {
      setSubmitLoading('');
    }
  };

  const identityStatus = getStatusForType('IDENTITY');
  const skillsStatus   = getStatusForType('SKILLS');

  // Booking segments
  const incoming  = bookings.filter(b => b.status === 'REQUESTED');
  const active    = bookings.filter(b => ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'COMPLETED');

  const tabBookings = activeTab === 'incoming' ? incoming : activeTab === 'active' ? active : completed;

  // Highest achieved trust level
  const trustLevel =
    provider?.skillsVerified && (provider?.jobsCompleted || 0) >= 20 && (provider?.completionRate || 0) >= 95
      ? 3
      : (provider?.skillsVerified || provider?.identityVerified) ? 2 : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ── Provider Hero Banner ─────────────────────────────────────────── */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-trust-600 to-trust-900 p-8 text-white shadow-lift">
        <div className="flex flex-col justify-between items-start gap-4 md:flex-row md:items-center">
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Service Provider Portal
            </span>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight">
              Welcome, {user?.firstName}!
              <Wrench aria-hidden="true" weight="duotone" size={26} className="text-trust-200" />
            </h1>
            <p className="mt-1 text-trust-100">
              {provider?.businessName || 'Build your trusted reputation and expand your client base across Ghana.'}
            </p>
            <div className="mt-3">
              <TrustBadge level={trustLevel} size="lg" className="!border-white/20" />
            </div>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-center backdrop-blur-md">
            <span className="block text-xs uppercase tracking-wider text-trust-100">Trust Score</span>
            <span className="mt-1 flex items-center justify-center gap-2">
              <Rating value={provider?.trustScore || 0} size={13} />
              <span className="text-2xl font-black tabular-nums text-white">
                {(provider?.trustScore || 0).toFixed(1)}
                <span className="text-sm font-bold text-trust-200"> / 5.0</span>
              </span>
            </span>
            <span className="mt-1 block text-[10px] text-trust-100 tabular-nums">
              {provider?.jobsCompleted || 0} Jobs Done
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Links ────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="/my-bookings"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-trust-300 hover:shadow-lift"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
            <ClipboardText aria-hidden="true" weight="duotone" size={24} />
          </span>
          <div>
            <h2 className="font-bold text-navy-900">Job Requests</h2>
            <p className="text-xs text-slate-500">Manage bookings</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => document.getElementById('add-service-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card transition hover:border-trust-300 hover:shadow-lift"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-trust-50 text-trust-600 transition duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
            <PlusCircle aria-hidden="true" weight="duotone" size={24} />
          </span>
          <div>
            <h2 className="font-bold text-navy-900">Add Service</h2>
            <p className="text-xs text-slate-500">Expand offerings</p>
          </div>
        </button>

        <Link
          to="/payments"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-trust-300 hover:shadow-lift"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
            <CreditCard aria-hidden="true" weight="duotone" size={24} />
          </span>
          <div>
            <h2 className="font-bold text-navy-900">Earnings</h2>
            <p className="text-xs text-slate-500">View transactions</p>
          </div>
        </Link>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Hourglass} tone="amber" label="Pending Requests" value={incoming.length} />
        <StatCard icon={Wrench} tone="blue" label="Active Jobs" value={active.length} />
        <StatCard icon={CheckCircle} tone="emerald" label="Jobs Completed" value={provider?.jobsCompleted || 0} />
        <StatCard icon={Trophy} tone="purple" label="Completion Rate" value={`${provider?.completionRate || 0}%`} />
      </div>

      {/* ── My Services Panel ────────────────────────────────────────────── */}
      <Card padding="p-0" className="mb-8">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
            <Wrench aria-hidden="true" weight="duotone" size={20} className="text-trust-600" /> My Services
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Manage the services you offer. Customers will see these options when they book you.
          </p>
        </div>

        <div className="p-6">
          {feedback && (
            <Alert tone={feedback.tone} onClose={() => setFeedback(null)} className="mb-4">
              {feedback.text}
            </Alert>
          )}

          {provider?.services?.length > 0 ? (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {provider.services.map((ps) => (
                <div
                  key={ps.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-trust-200"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-navy-900">{ps.service?.name}</h3>
                    <span className="mt-1 inline-block rounded-full bg-trust-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-trust-700">
                      {ps.service?.category?.name}
                    </span>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setRemoveTarget(ps.id)} disabled={serviceActionLoading}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div id="add-service-section" className="mb-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-6 text-center">
              <p className="text-sm text-slate-500">You haven't added any services yet.</p>
            </div>
          )}

          {/* Add Service Form */}
          <form
            onSubmit={handleAddService}
            id={provider?.services?.length > 0 ? 'add-service-section' : undefined}
            className="flex flex-col items-end gap-3 rounded-xl border border-trust-100 bg-trust-50/50 p-4 md:flex-row"
          >
            <div className="w-full flex-1">
              <Field
                label="Type or Select a Service"
                required
                list="services-list"
                type="text"
                placeholder="e.g. Plumbing Repair"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                size="sm"
              />
              <datalist id="services-list">
                {allServices.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.category?.name}
                  </option>
                ))}
              </datalist>
            </div>

            <Button type="submit" disabled={!newServiceName} loading={serviceActionLoading} className="w-full md:w-auto">
              {!serviceActionLoading && <PlusCircle aria-hidden="true" weight="bold" size={15} />}
              Add Service
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Job Requests & Bookings Panel ────────────────────────────────── */}
      <Card padding="p-0" className="mb-8">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-4">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
            <ClipboardText aria-hidden="true" weight="duotone" size={20} className="text-trust-600" />
            Job Requests &amp; Bookings
          </h2>
          <Link
            to="/my-bookings"
            className="group inline-flex items-center gap-1 text-xs font-bold text-trust-600 transition hover:text-trust-700"
          >
            View All
            <ArrowRight aria-hidden="true" weight="bold" size={11} className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-4">
          <TabBar
            groupId="provider-jobs"
            ariaLabel="Job booking sections"
            active={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'incoming', label: 'Incoming', count: incoming.length },
              { id: 'active', label: 'Active', count: active.length },
              { id: 'done', label: 'Completed', count: completed.length },
            ]}
          />
        </div>

        {/* Tab Content */}
        <div
          role="tabpanel"
          id="gt-tabpanel-provider-jobs-incoming"
          aria-labelledby="gt-tab-provider-jobs-incoming"
          className="p-6"
        >
          {loadingBookings ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : tabBookings.length === 0 ? (
            <EmptyState
              size="sm"
              className="!border-0 !bg-transparent"
              icon={activeTab === 'incoming' ? Package : activeTab === 'active' ? Gear : Trophy}
              title={
                activeTab === 'incoming' ? 'No pending job requests'
                : activeTab === 'active' ? 'No active jobs right now'
                : 'No completed jobs yet'
              }
              body={
                activeTab === 'incoming'
                  ? 'New customer requests will appear here the moment they arrive.'
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {tabBookings.map((booking) => (
                <JobCard key={booking.id} booking={booking} onAction={handleBookingAction} loadingId={loadingId} />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ── Trust Badges ─────────────────────────────────────────────────── */}
      <Card padding="p-6" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
          <ShieldCheck aria-hidden="true" weight="duotone" size={20} className="text-trust-600" />
          Trust &amp; Verification Badges
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <VerificationBadge label="Ghana Card Identity" verified={provider?.identityVerified} pendingStatus={identityStatus} icon={IdentificationCard} />
          <VerificationBadge label="Phone Verified" verified={provider?.phoneVerified} icon={Phone} />
          <VerificationBadge label="Skills / Trade Cert" verified={provider?.skillsVerified} pendingStatus={skillsStatus} icon={Certificate} />
          <VerificationBadge label="Location Verified" verified={provider?.locationVerified} icon={MapPin} />
        </div>
      </Card>

      {/* ── Verification Submission Forms ─────────────────────────────────── */}
      {submitMessage && (
        <Alert tone={submitMessage.type} onClose={() => setSubmitMessage(null)} className="mb-6">
          {submitMessage.text}
        </Alert>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Identity Verification Form */}
        <Card padding="p-6">
          <h3 className="mb-1 flex items-center gap-2 text-base font-bold tracking-tight text-navy-900">
            <IdentificationCard aria-hidden="true" weight="duotone" size={19} className="text-trust-600" />
            Identity Verification
          </h3>
          <p className="mb-4 text-xs text-slate-500">Submit your Ghana Card details to get identity-verified.</p>
          {provider?.identityVerified ? (
            <Alert tone="success">Your identity is already verified!</Alert>
          ) : identityStatus === 'PENDING' ? (
            <Alert tone="warning">Verification request is under review.</Alert>
          ) : identityStatus === 'REJECTED' ? (
            <div className="space-y-3">
              <Alert tone="error">Previous request was rejected. Please resubmit with corrected details.</Alert>
              <IdentityForm
                doc={identityDoc} setDoc={setIdentityDoc}
                note={identityNote} setNote={setIdentityNote}
                loading={submitLoading === 'IDENTITY'}
                onSubmit={() => handleVerificationSubmit('IDENTITY', identityDoc, identityNote)}
              />
            </div>
          ) : (
            <IdentityForm
              doc={identityDoc} setDoc={setIdentityDoc}
              note={identityNote} setNote={setIdentityNote}
              loading={submitLoading === 'IDENTITY'}
              onSubmit={() => handleVerificationSubmit('IDENTITY', identityDoc, identityNote)}
            />
          )}
        </Card>

        {/* Skills Verification Form */}
        <Card padding="p-6">
          <h3 className="mb-1 flex items-center gap-2 text-base font-bold tracking-tight text-navy-900">
            <Certificate aria-hidden="true" weight="duotone" size={19} className="text-trust-600" />
            Skills / Trade Certificate
          </h3>
          <p className="mb-4 text-xs text-slate-500">Upload your NVTI certificate or relevant trade qualification.</p>
          {provider?.skillsVerified ? (
            <Alert tone="success">Your skills are already verified!</Alert>
          ) : skillsStatus === 'PENDING' ? (
            <Alert tone="warning">Skills verification request is under review.</Alert>
          ) : skillsStatus === 'REJECTED' ? (
            <div className="space-y-3">
              <Alert tone="error">Previous request was rejected. Please resubmit with the correct certificate.</Alert>
              <SkillsForm
                doc={skillsDoc} setDoc={setSkillsDoc}
                note={skillsNote} setNote={setSkillsNote}
                loading={submitLoading === 'SKILLS'}
                onSubmit={() => handleVerificationSubmit('SKILLS', skillsDoc, skillsNote)}
              />
            </div>
          ) : (
            <SkillsForm
              doc={skillsDoc} setDoc={setSkillsDoc}
              note={skillsNote} setNote={setSkillsNote}
              loading={submitLoading === 'SKILLS'}
              onSubmit={() => handleVerificationSubmit('SKILLS', skillsDoc, skillsNote)}
            />
          )}
        </Card>
      </div>

      {/* ── Verification History ──────────────────────────────────────────── */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-base font-bold tracking-tight text-navy-900">Verification Request History</h2>
        </div>
        {loadingVerifications ? (
          <div className="p-8 text-center">
            <Skeleton className="mx-auto h-16 w-full max-w-md" />
          </div>
        ) : verifications.length === 0 ? (
          <EmptyState
            size="sm"
            className="!border-0 !bg-transparent"
            icon={Certificate}
            title="No verification requests yet"
            body="Submit your identity or skills documents above to start the verification process."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only-x">Your verification request history</caption>
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3 font-bold">Type</th>
                  <th scope="col" className="px-6 py-3 font-bold">Status</th>
                  <th scope="col" className="px-6 py-3 font-bold">Submitted</th>
                  <th scope="col" className="px-6 py-3 font-bold">Admin Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verifications.map((req) => (
                  <tr key={req.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                        {req.type}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={req.status} domain="verification" />
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500 tabular-nums">
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{req.adminNotes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Remove-service confirmation */}
      <ConfirmDialog
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => handleRemoveService(removeTarget)}
        title="Remove this service?"
        message="Customers will no longer see this service when booking you. You can add it back later."
        confirmLabel="Remove Service"
        loading={serviceActionLoading}
      />
    </div>
  );
};

// ─── Verification Sub-forms ────────────────────────────────────────────────────
function IdentityForm({ doc, setDoc, note, setNote, loading, onSubmit }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <Field
        label="Ghana Card ID Number"
        type="text"
        required
        size="sm"
        value={doc}
        onChange={(e) => setDoc(e.target.value)}
        placeholder="GHA-XXXXXXXXX-X"
      />
      <Field
        label="Notes (optional)"
        type="text"
        size="sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Any additional information..."
      />
      <Button type="submit" loading={loading} className="w-full">
        Submit Identity Request
      </Button>
    </form>
  );
}

function SkillsForm({ doc, setDoc, note, setNote, loading, onSubmit }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <Field
        label="Certificate / Document URL"
        type="url"
        required
        size="sm"
        value={doc}
        onChange={(e) => setDoc(e.target.value)}
        placeholder="https://drive.google.com/your-certificate"
      />
      <Field
        label="Trade / Skill Description"
        type="text"
        size="sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. NVTI Level 2 Electrician, 2019"
      />
      <Button type="submit" loading={loading} className="w-full">
        Submit Skills Request
      </Button>
    </form>
  );
}

export default ProviderDashboard;
