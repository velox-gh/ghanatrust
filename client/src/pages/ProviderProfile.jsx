import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, CalendarBlank, ArrowLeft, ShieldCheck, CheckCircle, CurrencyCircleDollar,
  IdentificationCard, Phone, Certificate, Building,
} from '@phosphor-icons/react';
import { providerAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Button, Card, Field, Alert, Spinner, Rating, TrustBadge, TrustLevelDots, EmptyState,
} from '../components/ui';

// Verification badge grid — state-driven, never color-alone
const VERIFICATION_ITEMS = [
  { key: 'identityVerified', icon: IdentificationCard, label: 'Ghana Card ID' },
  { key: 'phoneVerified', icon: Phone, label: 'Phone (MoMo)' },
  { key: 'skillsVerified', icon: Certificate, label: 'Trade Certificate' },
  { key: 'locationVerified', icon: Building, label: 'Workshop Location' },
];

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
      setBookingMessage({ type: 'error', text: 'Please select a service before booking.' });
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
      setBookingMessage({ type: 'success', text: 'Booking request submitted! The provider will be notified.' });
      setDescription('');
      setScheduledDate('');
      setSelectedServiceId('');
    } catch (err) {
      setBookingMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit booking. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <Spinner size="lg" className="text-trust-600" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
        <div className="w-full max-w-md">
          <EmptyState
            icon={ShieldCheck}
            title="Provider Not Found"
            body="This professional may no longer be listed on GhanaTrust."
            action={{ label: 'Return to Services', to: '/services' }}
          />
        </div>
      </div>
    );
  }

  const proUser = provider.user || {};

  // Highest achieved trust level: 3 = skills + proven track record
  const trustLevel =
    provider.skillsVerified && (provider.jobsCompleted || 0) >= 20 && (provider.completionRate || 0) >= 95
      ? 3
      : (provider.skillsVerified || provider.identityVerified) ? 2 : 1;

  return (
    <div className="min-h-screen bg-navy-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/services')} className="mb-4 !px-2">
          <ArrowLeft aria-hidden="true" weight="bold" size={14} /> All Professionals
        </Button>

        {/* Profile Header Banner */}
        <div className="mb-10 rounded-3xl border border-navy-700/50 bg-gradient-to-r from-navy-900 via-navy-800 to-trust-950 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-8 justify-between items-start md:flex-row md:items-center">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/20 bg-trust-600 text-3xl font-bold text-white shadow-lg"
                >
                  {proUser.firstName ? proUser.firstName[0] : 'P'}
                </div>
                {provider.identityVerified && (
                  <span
                    title="Ghana Card Identity Verified"
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy-900 bg-trust-500 text-white shadow"
                  >
                    <CheckCircle aria-hidden="true" weight="fill" size={18} />
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight">{proUser.firstName} {proUser.lastName}</h1>
                  <TrustBadge level={trustLevel} />
                </div>
                <p className="mt-1 font-semibold text-trust-300">
                  {provider.businessName || 'Master Professional Artisan'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <MapPin aria-hidden="true" weight="fill" size={13} className="text-trust-400" />
                    {provider.locations?.[0]?.location?.name || 'Kumasi, Ashanti Region'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarBlank aria-hidden="true" size={13} className="text-trust-400" />
                    {provider.experienceYears || 8}+ Years Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Score & Job Stats */}
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex gap-4">
                <div className="border-r border-white/10 px-3 text-center">
                  <span className="block text-xs text-slate-200">Trust Score</span>
                  <span className="mt-0.5 flex items-center justify-center gap-1">
                    <Rating value={provider.trustScore || 4.9} size={12} />
                  </span>
                  <span className="text-lg font-black tabular-nums text-white">
                    {(provider.trustScore || 4.9).toFixed(1)}
                  </span>
                </div>
                <div className="px-3 text-center">
                  <span className="block text-xs text-slate-200">Jobs Done</span>
                  <span className="text-lg font-black tabular-nums text-trust-300">
                    {provider.jobsCompleted || 127}+
                  </span>
                  <span className="block text-[10px] text-slate-300 tabular-nums">
                    {provider.completionRate || 95}% completion
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-8 lg:col-span-2">
            {/* About & Trust System */}
            <Card padding="p-8" className="rounded-3xl">
              <h2 className="mb-4 border-b border-slate-100 pb-3 text-xl font-bold tracking-tight text-navy-900">
                About The Professional
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                {provider.description || 'Verified Ghanaian artisan committed to high standard workmanship, timely job delivery, and safety.'}
              </p>

              {/* Verification Badges */}
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
                GhanaTrust Verification Badges
                <TrustLevelDots
                  identity={provider.identityVerified}
                  skills={provider.skillsVerified}
                  track={trustLevel === 3}
                />
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                {VERIFICATION_ITEMS.map(({ key, icon: Icon, label }) => {
                  const verified = provider[key];
                  return (
                    <div
                      key={key}
                      title={verified ? `${label} verified` : `${label} not verified yet`}
                      className={`flex items-center gap-2 rounded-xl border p-3 font-semibold ${
                        verified
                          ? 'border-trust-200 bg-trust-50 text-trust-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {verified ? (
                        <CheckCircle aria-hidden="true" weight="fill" size={15} className="shrink-0 text-trust-500" />
                      ) : (
                        <Icon aria-hidden="true" weight="regular" size={15} className="shrink-0" />
                      )}
                      {label}
                      <span className="sr-only-x">{verified ? ' — verified' : ' — not verified'}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Services Offered */}
            <Card padding="p-8" className="rounded-3xl">
              <h2 className="mb-4 border-b border-slate-100 pb-3 text-xl font-bold tracking-tight text-navy-900">
                Services Offered &amp; Pricing
              </h2>
              <div className="space-y-4">
                {provider.services?.map((ps) => (
                  <div
                    key={ps.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div>
                      <h3 className="font-bold text-navy-900">{ps.service?.name}</h3>
                      <span className="text-xs text-slate-500">{ps.service?.category?.name}</span>
                    </div>
                    <span className="rounded-xl border border-trust-200 bg-trust-50 px-3 py-1 text-xs font-bold text-trust-700">
                      {ps.price ? `From GH₵ ${ps.price.toFixed(0)}` : 'Request Quote'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews Section */}
            <Card padding="p-8" className="rounded-3xl">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold tracking-tight text-navy-900">Reviews &amp; Ratings</h2>
                <span className="flex items-center gap-2 rounded-xl border border-gold-200 bg-gold-50 px-3 py-1 text-sm font-bold text-gold-800">
                  <Rating value={provider.trustScore || 0} size={13} />
                  <span className="tabular-nums">{(provider.trustScore || 0).toFixed(1)}</span>
                  <span className="sr-only-x">average rating</span>
                </span>
              </div>
              <div className="space-y-4">
                {provider.reviews?.length > 0 ? (
                  provider.reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            aria-hidden="true"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 font-bold text-slate-700"
                          >
                            {review.customer?.firstName?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy-900">
                              {review.customer?.firstName} {review.customer?.lastName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Rating value={review.rating} size={13} />
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm italic text-slate-500">
                    No reviews yet. Be the first to review after a booking!
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Booking Sidebar Form */}
          <Card padding="p-8" className="sticky top-28 h-fit rounded-3xl shadow-lift">
            <h2 className="mb-2 text-xl font-bold tracking-tight text-navy-900">
              Book This Professional
            </h2>
            <p className="mb-6 text-xs leading-relaxed text-slate-500">
              Request a quote or schedule a job inspection with {proUser.firstName}.
            </p>

            {bookingMessage && (
              <Alert
                tone={bookingMessage.type === 'success' ? 'success' : 'error'}
                className="mb-4"
                onClose={() => setBookingMessage(null)}
              >
                {bookingMessage.text}
              </Alert>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <Field
                as="select"
                label="Select Service"
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                hint={
                  selectedProviderService
                    ? 'Price will be negotiated after booking request'
                    : provider.services?.length === 0
                      ? undefined
                      : undefined
                }
              >
                <option value="">-- Select a service --</option>
                {provider.services?.map((ps) => (
                  <option key={ps.service.id} value={String(ps.service.id)}>
                    {ps.service.name}
                  </option>
                ))}
              </Field>
              {selectedProviderService && (
                <p className="-mt-2 flex items-center gap-1.5 text-xs font-semibold text-trust-700">
                  <CurrencyCircleDollar aria-hidden="true" weight="fill" size={13} />
                  Price will be negotiated after booking request
                </p>
              )}
              {provider.services?.length === 0 && (
                <Alert tone="warning">This provider has no services listed yet.</Alert>
              )}

              <Field
                label="Preferred Scheduled Date"
                name="scheduledDate"
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />

              <Field
                label="Job Description / Address"
                name="description"
                as="textarea"
                rows={3}
                required
                placeholder="Describe what needs to be fixed or installed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Button type="submit" size="lg" loading={bookingLoading} className="w-full">
                {bookingLoading ? 'Submitting Request…' : 'Send Booking Request'}
                {!bookingLoading && <ShieldCheck aria-hidden="true" weight="fill" size={16} />}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
