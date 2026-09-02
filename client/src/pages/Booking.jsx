import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarCheck, MapPin, ClipboardText, CheckCircle, ArrowLeft, ArrowRight,
  Wrench, HardHat, MagnifyingGlass, WarningCircle,
} from '@phosphor-icons/react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Field, Alert, Spinner, Rating, TrustBadge, EmptyState } from '../components/ui';

const STEPS = [
  { id: 1, label: 'Review Job', icon: Wrench },
  { id: 2, label: 'Schedule', icon: CalendarCheck },
  { id: 3, label: 'Confirm', icon: CheckCircle },
];

const Booking = () => {
  const { serviceId: routeServiceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const providerId = queryParams.get('provider');
  const serviceId = routeServiceId || queryParams.get('service');

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledEndDate: '',
    description: '',
    address: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    if (serviceId && providerId) {
      fetchBookingDetails();
    } else {
      setError('Missing service or provider information');
      setLoading(false);
    }
  }, [serviceId, providerId, isAuthenticated]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const [serviceRes, providerRes] = await Promise.all([
        api.get(`/services/${serviceId}`),
        api.get(`/providers/${providerId}`)
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
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep2 = () => {
    if (!formData.scheduledDate) return 'Please choose a preferred date and time.';
    if (!formData.address.trim()) return 'Please enter the address where the job will happen.';
    return '';
  };

  const handleNext = () => {
    if (step === 2) {
      const msg = validateStep2();
      if (msg) {
        setStepError(msg);
        return;
      }
    }
    setStepError('');
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setStepError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const bookingData = {
        serviceId: parseInt(serviceId),
        providerId: parseInt(providerId),
        ...formData,
      };

      const response = await api.post('/bookings', bookingData);
      // Redirect to booking confirmation or dashboard
      navigate(`/my-bookings/${response.data.booking.id}`);
    } catch (err) {
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
          <p className="mt-4 text-sm font-medium text-slate-500">Loading booking details…</p>
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
            action={{ label: 'Browse Services', to: '/services' }}
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
        <p className="mb-8 text-sm text-slate-500">
          Book <span className="font-semibold text-navy-900">{service?.name}</span> with{' '}
          <span className="font-semibold text-navy-900">
            {provider?.user?.firstName} {provider?.user?.lastName}
          </span>
        </p>

        {/* Step indicator */}
        <ol aria-label="Booking progress" className="mb-8 flex items-center">
          {STEPS.map(({ id, label, icon: Icon }, i) => {
            const isDone = step > id;
            const isCurrent = step === id;
            return (
              <li key={id} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
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
                    {isDone ? <CheckCircle aria-hidden="true" weight="fill" size={20} /> : <Icon aria-hidden="true" weight="bold" size={18} />}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isCurrent || isDone ? 'text-trust-700' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`mx-3 mb-5 h-0.5 flex-1 rounded ${isDone ? 'bg-trust-600' : 'bg-slate-200'}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Booking Summary (always visible, compact) */}
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
              {provider?.trustScore > 0 && (
                <Rating value={provider.trustScore} showValue size={12} />
              )}
            </div>
          </div>
        </Card>

        {/* Step panels */}
        <form onSubmit={handleSubmit}>
          <Card>
            {step === 1 && (
              <div aria-labelledby="step1-heading">
                <h2 id="step1-heading" className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
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

            {step === 2 && (
              <div aria-labelledby="step2-heading" className="space-y-5">
                <h2 id="step2-heading" className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
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
                  placeholder="Enter your address or location"
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

            {step === 3 && (
              <div aria-labelledby="step3-heading">
                <h2 id="step3-heading" className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900">
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

            {/* Errors */}
            {stepError && (
              <Alert tone="error" className="mt-5">
                {stepError}
              </Alert>
            )}
            {error && (
              <Alert tone="error" className="mt-5">
                {error}
              </Alert>
            )}

            {/* Nav buttons */}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              {step > 1 ? (
                <Button type="button" variant="secondary" onClick={handleBack}>
                  <ArrowLeft aria-hidden="true" weight="bold" size={14} /> Back
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Continue <ArrowRight aria-hidden="true" weight="bold" size={14} />
                </Button>
              ) : (
                <Button type="submit" loading={submitting}>
                  {submitting ? 'Booking…' : 'Confirm Booking'}
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
