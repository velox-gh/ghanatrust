import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarCheck, MapPin, ClipboardText, CheckCircle, ArrowLeft, ArrowRight,
  Wrench, HardHat, MagnifyingGlass, WarningCircle, UserCircle,
} from '@phosphor-icons/react';
import api, { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useGuestDetails } from '../hooks/useGuestDetails';
import { Button, Card, Field, Alert, Spinner, Rating, TrustBadge, EmptyState } from '../components/ui';

const REVIEW_STEP = { id: 'review', label: 'Review Job', icon: Wrench };
const SCHEDULE_STEP = { id: 'schedule', label: 'Schedule', icon: CalendarCheck };
const DETAILS_STEP = { id: 'details', label: 'Your Details', icon: UserCircle };
const CONFIRM_STEP = { id: 'confirm', label: 'Confirm', icon: CheckCircle };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Ghanaian mobile numbers: 0XXXXXXXXX, or +233XXXXXXXXX.
const PHONE_RE = /^(\+233|0)\d{9}$/;

const Booking = () => {
  const { serviceId: routeServiceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, adoptSession } = useAuth();
  const { details: savedGuest, save: saveGuest, hasSaved } = useGuestDetails();

  const queryParams = new URLSearchParams(location.search);
  const providerId = queryParams.get('provider');
  const serviceId = routeServiceId || queryParams.get('service');

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [accountExists, setAccountExists] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledEndDate: '',
    description: '',
    address: '',
  });

  // Prefilled from the last guest booking on this device, so a repeat customer
  // only has to confirm rather than retype.
  const [guest, setGuest] = useState(savedGuest);

  // Guests get one extra step for their contact details; signed-in customers
  // already gave us all of it.
  const steps = useMemo(
    () =>
      isAuthenticated
        ? [REVIEW_STEP, SCHEDULE_STEP, CONFIRM_STEP]
        : [REVIEW_STEP, SCHEDULE_STEP, DETAILS_STEP, CONFIRM_STEP],
    [isAuthenticated]
  );

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const fetchBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [serviceRes, providerRes] = await Promise.all([
        api.get(`/services/${serviceId}`),
        api.get(`/providers/${providerId}`),
      ]);
      setService(serviceRes.data.service);
      setProvider(providerRes.data.provider);
      setError('');
    } catch (err) {
      setError('Failed to load booking details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [serviceId, providerId]);

  useEffect(() => {
    if (!serviceId || !providerId) {
      setError('Missing service or provider information');
      setLoading(false);
      return;
    }
    fetchBookingDetails();
  }, [serviceId, providerId, fetchBookingDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuestChange = (e) => {
    setGuest({ ...guest, [e.target.name]: e.target.value });
  };

  const validateSchedule = () => {
    if (!formData.scheduledDate) return 'Please choose a preferred date and time.';
    if (new Date(formData.scheduledDate) < new Date()) return 'Please choose a date in the future.';
    if (!formData.address.trim()) return 'Please enter the address where the job will happen.';
    return '';
  };

  const validateGuest = () => {
    if (!guest.firstName.trim() || !guest.lastName.trim()) return 'Please enter your first and last name.';
    if (!EMAIL_RE.test(guest.email.trim())) return 'Please enter a valid email address.';
    if (!PHONE_RE.test(guest.phoneNumber.trim().replace(/\s/g, '')))
      return 'Please enter a valid Ghanaian phone number, e.g. 0244123456.';
    return '';
  };

  const validateCurrentStep = () => {
    if (currentStep.id === 'schedule') return validateSchedule();
    if (currentStep.id === 'details') return validateGuest();
    return '';
  };

  const handleNext = () => {
    const msg = validateCurrentStep();
    if (msg) {
      setStepError(msg);
      return;
    }
    setStepError('');
    setAccountExists(false);
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  };

  const handleBack = () => {
    setStepError('');
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setAccountExists(false);

    const payload = {
      serviceId: parseInt(serviceId),
      providerId: parseInt(providerId),
      ...formData,
    };

    try {
      if (isAuthenticated) {
        const res = await bookingAPI.createBooking(payload);
        navigate(`/my-bookings/${res.data.booking.id}`);
        return;
      }

      const cleanedGuest = {
        firstName: guest.firstName.trim(),
        lastName: guest.lastName.trim(),
        email: guest.email.trim(),
        phoneNumber: guest.phoneNumber.trim().replace(/\s/g, ''),
      };

      const res = await bookingAPI.createGuestBooking({ ...payload, ...cleanedGuest });

      if (rememberMe) saveGuest(cleanedGuest);

      // The server signs the guest in so they can follow the job straight away.
      adoptSession(res.data.token, res.data.user);
      navigate(`/my-bookings/${res.data.booking.id}`, { state: { justBookedAsGuest: true } });
    } catch (err) {
      // The email belongs to a real account — we will not sign anyone into it
      // on the strength of a typed address.
      if (err.response?.data?.code === 'ACCOUNT_EXISTS') {
        setAccountExists(true);
        setStepIndex(steps.findIndex((s) => s.id === 'details'));
      }
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto text-trust-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
        <div className="w-full max-w-md">
          <EmptyState
            icon={WarningCircle}
            title="Something went wrong"
            body={error}
            action={{ label: 'Browse professionals', to: '/' }}
          />
        </div>
      </div>
    );
  }

  const trustLevel = provider?.skillsVerified ? 2 : provider?.identityVerified ? 1 : 0;

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 !px-2">
          <ArrowLeft aria-hidden="true" weight="bold" size={14} /> Back
        </Button>
        <h1 className="mb-2 text-3xl font-black tracking-tight text-navy-900">Book a Service</h1>
        <p className="mb-6 text-sm text-slate-500">
          Book <span className="font-semibold text-navy-900">{service?.name}</span> with{' '}
          <span className="font-semibold text-navy-900">
            {provider?.user?.firstName} {provider?.user?.lastName}
          </span>
        </p>

        {!isAuthenticated && (
          <Alert tone="info" className="mb-6 text-xs">
            <span className="font-semibold">No account needed.</span> Book as a guest — we only need
            your name and phone so the professional can reach you. Already registered?{' '}
            <Link
              to="/login"
              state={{ from: location }}
              className="font-bold text-trust-700 underline"
            >
              Sign in
            </Link>
            .
          </Alert>
        )}

        {/* Step indicator */}
        <ol aria-label="Booking progress" className="mb-8 flex items-center">
          {steps.map(({ id, label, icon: Icon }, i) => {
            const isDone = stepIndex > i;
            const isCurrent = stepIndex === i;
            return (
              <li key={id} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    aria-current={isCurrent ? 'step' : undefined}
                    className={[
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition duration-200',
                      isDone
                        ? 'border-trust-600 bg-trust-600 text-white'
                        : isCurrent
                          ? 'border-trust-600 bg-white text-trust-700 ring-4 ring-trust-100'
                          : 'border-slate-300 bg-white text-slate-400',
                    ].join(' ')}
                  >
                    {isDone ? (
                      <CheckCircle aria-hidden="true" weight="fill" size={20} />
                    ) : (
                      <Icon aria-hidden="true" weight="bold" size={18} />
                    )}
                  </span>
                  <span
                    className={`text-center text-[10px] font-bold uppercase tracking-wider sm:text-[11px] ${
                      isCurrent || isDone ? 'text-trust-700' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`mx-2 mb-5 h-0.5 flex-1 rounded sm:mx-3 ${isDone ? 'bg-trust-600' : 'bg-slate-200'}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Booking summary */}
        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Service Details</h2>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-trust-50 text-trust-600">
                <Wrench aria-hidden="true" weight="duotone" size={22} />
              </span>
              <div>
                <p className="font-bold text-navy-900">{service?.name}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <HardHat aria-hidden="true" weight="duotone" size={13} className="text-slate-400" />
                  {provider?.businessName || `${provider?.user?.firstName} ${provider?.user?.lastName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {trustLevel > 0 && <TrustBadge level={trustLevel} />}
              {provider?.trustScore > 0 && <Rating value={provider.trustScore} showValue size={12} />}
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            {currentStep.id === 'review' && (
              <div aria-labelledby="step-review">
                <h2 id="step-review" className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
                  <MagnifyingGlass aria-hidden="true" weight="duotone" size={20} className="text-trust-600" />
                  Review Your Job
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-slate-600">
                  You are about to request <strong>{service?.name}</strong> from{' '}
                  <strong>
                    {provider?.user?.firstName} {provider?.user?.lastName}
                  </strong>
                  {provider?.businessName ? ` (${provider.businessName})` : ''}. Next, pick when and where
                  the work should happen.
                </p>
                {service?.description && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </div>
                )}
              </div>
            )}

            {currentStep.id === 'schedule' && (
              <div aria-labelledby="step-schedule" className="space-y-5">
                <h2 id="step-schedule" className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
                  <CalendarCheck aria-hidden="true" weight="duotone" size={20} className="text-trust-600" />
                  Schedule &amp; Describe the Job
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Preferred Date *"
                    name="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="Preferred End Date"
                    name="scheduledEndDate"
                    type="datetime-local"
                    value={formData.scheduledEndDate}
                    onChange={handleChange}
                    hint="Optional — for multi-day jobs"
                  />
                </div>
                <Field
                  label="Location / Address *"
                  name="address"
                  type="text"
                  placeholder="e.g. House 12, Ahodwo Road, Kumasi"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <Field
                  label="Job Description"
                  name="description"
                  as="textarea"
                  rows={4}
                  placeholder="Describe the job in detail..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            )}

            {currentStep.id === 'details' && (
              <div aria-labelledby="step-details" className="space-y-5">
                <h2 id="step-details" className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
                  <UserCircle aria-hidden="true" weight="duotone" size={20} className="text-trust-600" />
                  How should we reach you?
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  The professional needs this to confirm your job. You are not creating a password —
                  you can do that later if you want to.
                </p>

                {accountExists && (
                  <Alert tone="warning" title="This email already has an account">
                    <span className="text-xs">
                      Please{' '}
                      <Link to="/login" state={{ from: location }} className="font-bold underline">
                        sign in
                      </Link>{' '}
                      to continue, or use a different email address.
                    </span>
                  </Alert>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="First Name *"
                    name="firstName"
                    value={guest.firstName}
                    onChange={handleGuestChange}
                    autoComplete="given-name"
                    required
                  />
                  <Field
                    label="Last Name *"
                    name="lastName"
                    value={guest.lastName}
                    onChange={handleGuestChange}
                    autoComplete="family-name"
                    required
                  />
                </div>
                <Field
                  label="Phone Number *"
                  name="phoneNumber"
                  type="tel"
                  placeholder="0244123456"
                  value={guest.phoneNumber}
                  onChange={handleGuestChange}
                  autoComplete="tel"
                  hint="The professional will call this number to confirm."
                  required
                />
                <Field
                  label="Email *"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={guest.email}
                  onChange={handleGuestChange}
                  autoComplete="email"
                  hint="We send your booking updates here."
                  required
                />

                <label className="flex cursor-pointer items-start gap-2.5 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-trust-600 focus:ring-trust-500"
                  />
                  <span>
                    Save my details on this device
                    <span className="block text-xs font-normal text-slate-500">
                      So your next booking takes one tap. Stored only in this browser.
                    </span>
                  </span>
                </label>

                {hasSaved && (
                  <p className="text-xs text-slate-500">
                    Details filled in from your last booking on this device.
                  </p>
                )}
              </div>
            )}

            {currentStep.id === 'confirm' && (
              <div aria-labelledby="step-confirm">
                <h2 id="step-confirm" className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
                  <ClipboardText aria-hidden="true" weight="duotone" size={20} className="text-trust-600" />
                  Confirm Your Booking
                </h2>
                <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60">
                  {[
                    ['Service', service?.name],
                    ['Provider', `${provider?.user?.firstName ?? ''} ${provider?.user?.lastName ?? ''}`.trim()],
                    ['Preferred date', formData.scheduledDate && new Date(formData.scheduledDate).toLocaleString()],
                    ['End date', formData.scheduledEndDate ? new Date(formData.scheduledEndDate).toLocaleString() : '—'],
                    ['Address', formData.address],
                    ['Description', formData.description || '—'],
                    ...(isAuthenticated
                      ? []
                      : [
                          ['Your name', `${guest.firstName} ${guest.lastName}`.trim()],
                          ['Your phone', guest.phoneNumber],
                          ['Your email', guest.email],
                        ]),
                  ].map(([term, value]) => (
                    <div key={term} className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3">
                      <dt className="w-32 shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">{term}</dt>
                      <dd className="min-w-0 flex-1 break-words text-sm font-medium text-navy-900">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                  <MapPin aria-hidden="true" size={13} className="mt-0.5 shrink-0 text-trust-600" />
                  The provider will accept your request before any work is scheduled. Payment happens
                  only after the job is completed.
                </p>
              </div>
            )}

            {stepError && (
              <Alert tone="error" className="mt-5">
                {stepError}
              </Alert>
            )}
            {error && !accountExists && (
              <Alert tone="error" className="mt-5">
                {error}
              </Alert>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              {stepIndex > 0 ? (
                <Button type="button" variant="secondary" onClick={handleBack}>
                  <ArrowLeft aria-hidden="true" weight="bold" size={14} /> Back
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              )}
              {!isLastStep ? (
                <Button type="button" onClick={handleNext}>
                  Continue <ArrowRight aria-hidden="true" weight="bold" size={14} />
                </Button>
              ) : (
                <Button type="submit" loading={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                  <CheckCircle aria-hidden="true" weight="bold" size={15} />
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Booking;
