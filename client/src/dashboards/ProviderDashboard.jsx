import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { providerAPI, bookingAPI, serviceAPI } from '../services/api';

// ─── Sub-components (Verification) ────────────────────────────────────────────
const VerificationBadge = ({ label, verified, pendingStatus }) => {
  const isPending = pendingStatus === 'PENDING';
  if (verified) {
    return (
      <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800">
        <span className="text-xs font-bold block uppercase">{label}</span>
        <span className="text-base font-bold mt-1 block">🟢 Verified</span>
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-800">
        <span className="text-xs font-bold block uppercase">{label}</span>
        <span className="text-base font-bold mt-1 block">🟡 Under Review</span>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 text-gray-500">
      <span className="text-xs font-bold block uppercase">{label}</span>
      <span className="text-base font-bold mt-1 block">⚪ Not Submitted</span>
    </div>
  );
};

// ─── Booking Status Badge ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    REQUESTED:   { label: 'Requested',   cls: 'bg-amber-100 text-amber-800 border-amber-300',   icon: '🟡' },
    ACCEPTED:    { label: 'Accepted',    cls: 'bg-blue-100 text-blue-800 border-blue-300',       icon: '🔵' },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🔧' },
    COMPLETED:   { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✅' },
    CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-800 border-red-300',          icon: '❌' },
    SCHEDULED:   { label: 'Scheduled',   cls: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: '📅' },
  }[status] || { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200', icon: '●' };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Incoming Job Request Card ─────────────────────────────────────────────────
const JobCard = ({ booking, onAction, loadingId }) => {
  const isLoading = loadingId === booking.id;
  const s = booking.status;

  return (
    <div className={`p-5 rounded-xl border bg-white shadow-sm transition ${
      s === 'REQUESTED' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-100'
    }`}>
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-slate-900 truncate">{booking.service?.name}</h4>
            <StatusBadge status={s} />
          </div>
          <p className="text-xs text-slate-500 mb-2 line-clamp-1">
            {booking.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              👤 <strong className="text-slate-700">
                {booking.customer?.firstName} {booking.customer?.lastName}
              </strong>
            </span>
            <span>
              🗓️{' '}
              <strong className="text-slate-700">
                {booking.scheduledDate
                  ? new Date(booking.scheduledDate).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'TBD'}
              </strong>
            </span>
            {booking.price && (
              <span className="text-emerald-700 font-bold">GH₵ {booking.price.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 items-end shrink-0">
          <Link
            to={`/my-bookings/${booking.id}`}
            className="text-xs text-blue-600 hover:underline font-semibold whitespace-nowrap"
          >
            View Details →
          </Link>
          <div className="flex gap-2 flex-wrap justify-end">
            {s === 'REQUESTED' && (
              <button
                onClick={() => onAction(booking.id, 'accept')}
                disabled={isLoading}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isLoading ? '...' : '✅ Accept'}
              </button>
            )}
            {s === 'ACCEPTED' && (
              <button
                onClick={() => onAction(booking.id, 'start')}
                disabled={isLoading}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? '...' : '🔧 Start Job'}
              </button>
            )}
            {s === 'IN_PROGRESS' && (
              <button
                onClick={() => onAction(booking.id, 'complete')}
                disabled={isLoading}
                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {isLoading ? '...' : '🏁 Complete'}
              </button>
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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add service');
    } finally {
      setServiceActionLoading(false);
    }
  };

  const handleRemoveService = async (id) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    setServiceActionLoading(true);
    try {
      await providerAPI.removeService(id);
      await refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove service');
    } finally {
      setServiceActionLoading(false);
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
      alert(err.response?.data?.message || 'Action failed. Please try again.');
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
      setSubmitMessage({ type: 'success', text: `✅ ${type === 'IDENTITY' ? 'Identity' : 'Skills'} verification submitted! Our team will review it shortly.` });
      fetchMyVerifications();
      if (type === 'IDENTITY') { setIdentityDoc(''); setIdentityNote(''); }
      if (type === 'SKILLS')   { setSkillsDoc('');   setSkillsNote(''); }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: `❌ Failed to submit. ${err.response?.data?.message || 'Try again.'}` });
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Provider Hero Banner ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-emerald-500/30 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Service Provider Portal
            </span>
            <h1 className="text-3xl font-bold mt-2">
              Welcome, {user?.firstName}! 🔧
            </h1>
            <p className="text-emerald-100 mt-1">
              {provider?.businessName || 'Build your trusted reputation and expand your client base across Ghana.'}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 text-center">
            <span className="text-xs text-emerald-200 block uppercase tracking-wider">Trust Score</span>
            <span className="text-2xl font-black text-amber-300">⭐ {provider?.trustScore || '0.0'} / 5.0</span>
            <span className="text-[10px] text-emerald-100 block mt-1">{provider?.jobsCompleted || 0} Jobs Done</span>
          </div>
        </div>
      </div>

      {/* ── Quick Links ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/my-bookings"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            📋
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Job Requests</h3>
            <p className="text-xs text-slate-500">Manage bookings</p>
          </div>
        </Link>

        <button
          onClick={() => document.getElementById('add-service-section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-white text-left p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-emerald-300 transition group w-full"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            ➕
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Add Service</h3>
            <p className="text-xs text-slate-500">Expand offerings</p>
          </div>
        </button>

        <Link
          to="/payments"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-purple-300 transition group"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            💳
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Earnings</h3>
            <p className="text-xs text-slate-500">View transactions</p>
          </div>
        </Link>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-amber-600">{incoming.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Pending Requests</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-blue-600">{active.length}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Active Jobs</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">{provider?.jobsCompleted || 0}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Jobs Completed</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-purple-600">{provider?.completionRate || 0}%</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">Completion Rate</p>
        </div>
      </div>
      {/* ── My Services Panel ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🛠️ My Services
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage the services you offer. Customers will see these options when they book you.
          </p>
        </div>

        <div className="p-6">
          {provider?.services?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {provider.services.map((ps) => (
                <div key={ps.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{ps.service?.name}</h3>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      {ps.service?.category?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveService(ps.id)}
                    disabled={serviceActionLoading}
                    className="text-xs text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 font-semibold transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 mb-6">
              <p className="text-sm text-slate-500">You haven't added any services yet.</p>
            </div>
          )}

          {/* Add Service Form */}
          <form onSubmit={handleAddService} className="flex flex-col md:flex-row gap-3 items-end p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">TYPE OR SELECT A SERVICE</label>
              <input
                required
                list="services-list"
                type="text"
                placeholder="e.g. Plumbing Repair"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="services-list">
                {allServices.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.category?.name}
                  </option>
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              disabled={serviceActionLoading || !newServiceName}
              className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 h-[42px]"
            >
              {serviceActionLoading ? '...' : '+ Add'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Job Requests & Bookings Panel ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📋 Job Requests & Bookings
          </h2>
          <Link to="/my-bookings" className="text-xs text-blue-600 hover:underline font-semibold">
            View All →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'incoming', label: 'Incoming', count: incoming.length, color: 'amber' },
            { key: 'active',   label: 'Active',   count: active.length,   color: 'blue' },
            { key: 'done',     label: 'Completed', count: completed.length, color: 'emerald' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${
                  tab.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  tab.color === 'blue'  ? 'bg-blue-100 text-blue-700' :
                                          'bg-emerald-100 text-emerald-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loadingBookings ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : tabBookings.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <span className="text-3xl block mb-2">
                {activeTab === 'incoming' ? '📭' : activeTab === 'active' ? '⚙️' : '🏆'}
              </span>
              <p className="text-sm font-semibold">
                {activeTab === 'incoming' ? 'No pending job requests' :
                 activeTab === 'active'   ? 'No active jobs right now' :
                                            'No completed jobs yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tabBookings.map(booking => (
                <JobCard
                  key={booking.id}
                  booking={booking}
                  onAction={handleBookingAction}
                  loadingId={loadingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Trust Badges ─────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🛡️</span> Trust & Verification Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VerificationBadge
            label="Ghana Card Identity"
            verified={provider?.identityVerified}
            pendingStatus={identityStatus}
          />
          <div className={`p-4 rounded-xl border ${provider?.phoneVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="text-xs font-bold block uppercase">Phone Verified</span>
            <span className="text-base font-bold mt-1 block">
              {provider?.phoneVerified ? '🟢 Verified' : '⚪ Not Verified'}
            </span>
          </div>
          <VerificationBadge
            label="Skills / Trade Cert"
            verified={provider?.skillsVerified}
            pendingStatus={skillsStatus}
          />
          <div className={`p-4 rounded-xl border ${provider?.locationVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="text-xs font-bold block uppercase">Location Verified</span>
            <span className="text-base font-bold mt-1 block">
              {provider?.locationVerified ? '🟢 Verified' : '⚪ Not Set'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Verification Submission Forms ─────────────────────────────────── */}
      {submitMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold mb-6 ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {submitMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Identity Verification Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            🪪 Identity Verification
          </h3>
          <p className="text-xs text-gray-500 mb-4">Submit your Ghana Card details to get identity-verified.</p>
          {provider?.identityVerified ? (
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-semibold">
              ✅ Your identity is already verified!
            </div>
          ) : identityStatus === 'PENDING' ? (
            <div className="text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm font-semibold">
              🟡 Verification request is under review.
            </div>
          ) : identityStatus === 'REJECTED' ? (
            <div className="space-y-3">
              <div className="text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold">
                ❌ Previous request was rejected. Please resubmit with corrected details.
              </div>
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
        </div>

        {/* Skills Verification Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            📜 Skills / Trade Certificate
          </h3>
          <p className="text-xs text-gray-500 mb-4">Upload your NVTI certificate or relevant trade qualification.</p>
          {provider?.skillsVerified ? (
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-semibold">
              ✅ Your skills are already verified!
            </div>
          ) : skillsStatus === 'PENDING' ? (
            <div className="text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm font-semibold">
              🟡 Skills verification request is under review.
            </div>
          ) : skillsStatus === 'REJECTED' ? (
            <div className="space-y-3">
              <div className="text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold">
                ❌ Previous request was rejected. Please resubmit with the correct certificate.
              </div>
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
        </div>
      </div>

      {/* ── Verification History ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900">Verification Request History</h2>
        </div>
        {loadingVerifications ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading history...</div>
        ) : verifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No verification requests submitted yet.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Submitted</th>
                <th className="px-6 py-3 font-semibold">Admin Notes</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map(req => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {req.status === 'PENDING'  && <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full text-xs font-bold">Pending</span>}
                    {req.status === 'VERIFIED' && <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full text-xs font-bold">Verified ✓</span>}
                    {req.status === 'REJECTED' && <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-full text-xs font-bold">Rejected</span>}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(req.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{req.adminNotes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── Verification Sub-forms ────────────────────────────────────────────────────
function IdentityForm({ doc, setDoc, note, setNote, loading, onSubmit }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">GHANA CARD ID NUMBER</label>
        <input
          type="text"
          required
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          placeholder="GHA-XXXXXXXXX-X"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">NOTES (Optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any additional information..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Identity Request 🪪'}
      </button>
    </form>
  );
}

function SkillsForm({ doc, setDoc, note, setNote, loading, onSubmit }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">CERTIFICATE / DOCUMENT URL</label>
        <input
          type="text"
          required
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          placeholder="https://drive.google.com/your-certificate"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">TRADE / SKILL DESCRIPTION</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. NVTI Level 2 Electrician, 2019"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Skills Request 📜'}
      </button>
    </form>
  );
}

export default ProviderDashboard;
