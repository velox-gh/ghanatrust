import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providerAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [scheduledDate, setScheduledDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  useEffect(() => {
    fetchProviderProfile();
  }, [id]);

  const fetchProviderProfile = async () => {
    try {
      const res = await providerAPI.getProviderById(id);
      const providerData = res.data.provider;
      setProvider(providerData);

      // Auto-select first service only when there is exactly one option
      const services = providerData?.services || [];
      if (services.length === 1) {
        setSelectedServiceId(String(services[0].service.id));
      }
      // Multiple services → leave blank so user must actively choose
    } catch (err) {
      console.error('Failed to load provider:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive the currently selected ProviderService record (carries price info)
  const selectedProviderService = provider?.services?.find(
    (ps) => String(ps.service.id) === String(selectedServiceId)
  );

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedServiceId) {
      setBookingMessage({ type: 'error', text: '⚠️ Please select a service before booking.' });
      return;
    }

    setBookingLoading(true);
    setBookingMessage(null);

    try {
      await bookingAPI.createBooking({
        providerId: provider.id,
        serviceId: parseInt(selectedServiceId),
        scheduledDate,
        description,
        price: selectedProviderService?.price || null,
      });
      setBookingMessage({ type: 'success', text: '✅ Booking request submitted! The provider will be notified.' });
      setDescription('');
      setScheduledDate('');
      setSelectedServiceId('');
    } catch (err) {
      setBookingMessage({ type: 'error', text: err.response?.data?.message || '❌ Failed to submit booking. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Provider Not Found</h2>
          <button onClick={() => navigate('/services')} className="mt-4 text-emerald-600 font-bold">
            ← Return to Services
          </button>
        </div>
      </div>
    );
  }

  const proUser = provider.user || {};

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-8 text-white shadow-xl mb-10 border border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-emerald-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
                  {proUser.firstName ? proUser.firstName[0] : 'P'}
                </div>
                {provider.identityVerified && (
                  <span title="Ghana Card Identity Verified" className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-sm font-bold shadow">
                    ✓
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black">{proUser.firstName} {proUser.lastName}</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Level 2 Certified
                  </span>
                </div>
                <p className="text-emerald-400 font-semibold mt-1">
                  {provider.businessName || 'Master Professional Artisan'}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
                  <span>📍 {provider.locations?.[0]?.location?.name || 'Kumasi, Ashanti Region'}</span>
                  <span>🗓️ {provider.experienceYears || 8}+ Years Exp</span>
                </div>
              </div>
            </div>

            {/* Score & Job Stats */}
            <div className="flex gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-center px-3 border-r border-white/10">
                <span className="text-xs text-slate-300 block">Trust Score</span>
                <span className="text-2xl font-black text-amber-300">⭐ {provider.trustScore || '4.9'}</span>
              </div>
              <div className="text-center px-3">
                <span className="text-xs text-slate-300 block">Jobs Done</span>
                <span className="text-2xl font-black text-emerald-400">{provider.jobsCompleted || 127}+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About & Trust System */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                About The Professional
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {provider.description || 'Verified Ghanaian artisan committed to high standard workmanship, timely job delivery, and safety.'}
              </p>

              {/* Verification Badges */}
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                GhanaTrust Verification Badges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl font-semibold flex items-center gap-2">
                  <span>🟢</span> Ghana Card ID
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl font-semibold flex items-center gap-2">
                  <span>🟢</span> Phone (MoMo)
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl font-semibold flex items-center gap-2">
                  <span>🟢</span> Trade Certificate
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl font-semibold flex items-center gap-2">
                  <span>🟢</span> Workshop Location
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                Services Offered & Pricing
              </h2>
              <div className="space-y-4">
                {provider.services?.map((ps) => (
                  <div key={ps.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900">{ps.service?.name}</h4>
                      <span className="text-xs text-slate-500">{ps.service?.category?.name}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      Request Quote
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-900">
                  Reviews & Ratings
                </h2>
                <span className="text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  ⭐ {provider.trustScore || '0.0'} Average
                </span>
              </div>
              <div className="space-y-4">
                {provider.reviews?.length > 0 ? (
                  provider.reviews.map((review) => (
                    <div key={review.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700">
                            {review.customer?.firstName?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">
                              {review.customer?.firstName} {review.customer?.lastName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-amber-400 text-sm">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic text-center py-6">
                    No reviews yet. Be the first to review after a booking!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar Form */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl h-fit sticky top-28">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Book This Professional
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Request a quote or schedule job inspection with {proUser.firstName}.
            </p>

            {bookingMessage && (
              <div className={`p-4 rounded-xl text-xs font-semibold mb-4 ${bookingMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {bookingMessage.text}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SELECT SERVICE
                </label>
                <select
                  value={selectedServiceId}
                  required
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select a service --</option>
                  {provider.services?.map((ps) => (
                    <option key={ps.service.id} value={String(ps.service.id)}>
                      {ps.service.name}
                    </option>
                  ))}
                </select>
                {selectedProviderService && (
                  <p className="text-xs text-emerald-700 font-semibold mt-1.5">
                    💰 Price will be negotiated after booking request
                  </p>
                )}
                {provider.services?.length === 0 && (
                  <p className="text-xs text-rose-600 mt-1.5">⚠️ This provider has no services listed yet.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PREFERRED SCHEDULED DATE
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  JOB DESCRIPTION / ADDRESS
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe what needs to be fixed or installed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {bookingLoading ? 'Submitting Request...' : 'Send Booking Request 🛡️'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;