import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, HardHat, Eye, EyeSlash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { serviceAPI } from '../services/api';
import { Button, Card, Field, Alert } from '../components/ui';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'CUSTOMER',
    // Provider fields
    businessName: '',
    description: '',
    experienceYears: '',
    categoryId: '',
    serviceId: '',
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();

  // Load categories when provider role selected
  useEffect(() => {
    if (formData.role === 'PROVIDER' && categories.length === 0) {
      serviceAPI.getCategories()
        .then(res => setCategories(res.data.categories || []))
        .catch(() => {});
    }
  }, [formData.role]);

  // Load services when category changes
  useEffect(() => {
    if (formData.categoryId) {
      serviceAPI.getServices({ categoryId: formData.categoryId })
        .then(res => {
          setServices(res.data.services || []);
          setFormData(f => ({ ...f, serviceId: '' }));
        })
        .catch(() => {});
    } else {
      setServices([]);
    }
  }, [formData.categoryId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleToggle = (role) => {
    setFormData({ ...formData, role, categoryId: '', serviceId: '' });
    setServices([]);
  };

  // Arrow-key navigation for the role radiogroup
  const handleRoleKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    handleRoleToggle(formData.role === 'CUSTOMER' ? 'PROVIDER' : 'CUSTOMER');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'PROVIDER' && !formData.serviceId) {
      setError('Please select your main profession/service');
      return;
    }

    setLoading(true);
    try {
      const userData = { ...formData };
      delete userData.confirmPassword; // never sent to the API
      const result = await register(userData);
      if (result.success) {
        navigate('/dashboard');
        setTimeout(() => {
          startTour();
        }, 1000); // give it a sec to mount dashboard and navbar user menu
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const isProvider = formData.role === 'PROVIDER';

  const ROLE_OPTIONS = [
    { value: 'CUSTOMER', label: 'I Need a Service', icon: User },
    { value: 'PROVIDER', label: 'I Provide Service', icon: HardHat },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className={`w-full transition-all duration-300 ${isProvider ? 'max-w-2xl' : 'max-w-md'}`}>
        <Card padding="p-8" className="rounded-3xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-800 text-white shadow-cta">
              <ShieldCheck weight="duotone" size={30} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-navy-900">Create Your GhanaTrust Account</h1>
            <p className="mt-1 text-xs text-slate-500">Join Ghana's leading verified service marketplace</p>
          </div>

          {error && (
            <Alert tone="error" onClose={() => setError('')} className="mb-6">
              {error}
            </Alert>
          )}

          {/* Role Toggle — radiogroup, keyboard operable */}
          <div
            role="radiogroup"
            aria-label="Account type"
            onKeyDown={handleRoleKeyDown}
            className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1.5"
          >
            {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = formData.role === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => handleRoleToggle(value)}
                  className={[
                    'flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition duration-150',
                    selected
                      ? value === 'PROVIDER'
                        ? 'bg-trust-600 text-white shadow-cta'
                        : 'bg-white text-navy-900 shadow-card'
                      : 'text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                >
                  <Icon aria-hidden="true" weight="duotone" size={17} />
                  {label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Two-column layout for providers */}
            <div className={`grid gap-6 ${isProvider ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* --- LEFT COLUMN: Basic Info --- */}
              <div className="space-y-4">
                {isProvider && (
                  <p className="border-b border-slate-100 pb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Personal Information
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="First Name" name="firstName" required size="sm"
                    placeholder="Kwame"
                    value={formData.firstName} onChange={handleChange}
                  />
                  <Field
                    label="Last Name" name="lastName" required size="sm"
                    placeholder="Mensah"
                    value={formData.lastName} onChange={handleChange}
                  />
                </div>

                <Field
                  label="Email Address" type="email" name="email" autoComplete="email" required size="sm"
                  placeholder="name@example.com"
                  value={formData.email} onChange={handleChange}
                />

                <Field
                  label="Ghana Phone Number" type="tel" name="phoneNumber" autoComplete="tel" size="sm"
                  placeholder="+233 24 123 4567"
                  value={formData.phoneNumber} onChange={handleChange}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Field
                      label="Password" type={showPassword ? 'text' : 'password'} name="password"
                      autoComplete="new-password" required size="sm"
                      placeholder="••••••••"
                      value={formData.password} onChange={handleChange}
                      className="pr-10"
                    />
                    <PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} compact />
                  </div>
                  <div className="relative">
                    <Field
                      label="Confirm" type={showPassword ? 'text' : 'password'} name="confirmPassword"
                      autoComplete="new-password" required size="sm"
                      placeholder="••••••••"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="pr-10"
                    />
                    <PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} compact />
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN: Provider Profession Info --- */}
              {isProvider && (
                <div className="space-y-4">
                  <p className="border-b border-slate-100 pb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Your Profession
                  </p>

                  <Field
                    label="Business / Trade Name" name="businessName" size="sm"
                    placeholder="e.g. Mensah Electrical Works"
                    value={formData.businessName} onChange={handleChange}
                  />

                  <Field
                    as="select"
                    label="Service Category"
                    name="categoryId"
                    required={isProvider}
                    size="sm"
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Field>

                  <Field
                    as="select"
                    label="Your Main Profession"
                    name="serviceId"
                    required={isProvider}
                    size="sm"
                    disabled={!formData.categoryId}
                    value={formData.serviceId}
                    onChange={handleChange}
                    hint={formData.categoryId ? undefined : 'Select a category first'}
                  >
                    <option value="">
                      {formData.categoryId ? 'Select your profession...' : 'Select a category first'}
                    </option>
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>{svc.name}</option>
                    ))}
                  </Field>
                  <p className="-mt-2 text-[10px] text-slate-500">You can add more services later from your dashboard.</p>

                  <Field
                    as="select"
                    label="Years of Experience"
                    name="experienceYears"
                    size="sm"
                    value={formData.experienceYears}
                    onChange={handleChange}
                  >
                    <option value="">Select years...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((y) => (
                      <option key={y} value={y}>{y}+ year{y > 1 ? 's' : ''}</option>
                    ))}
                  </Field>

                  <Field
                    as="textarea"
                    label="Brief Profile Description"
                    name="description"
                    rows={3}
                    size="sm"
                    placeholder="Describe your skills and the type of work you do..."
                    value={formData.description}
                    onChange={handleChange}
                    className="resize-none"
                  />
                </div>
              )}
            </div>

            {/* Provider note */}
            {isProvider && (
              <Alert
                tone="success"
                title={
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck aria-hidden="true" weight="fill" size={13} /> Level 2 Verification
                  </span>
                }
              >
                After registration, complete your <strong>Identity Verification</strong> from the Provider
                Dashboard to unlock Level 2 Verified status and appear higher in search results.
              </Alert>
            )}

            <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
              {loading ? 'Creating Account…' : `Register as ${isProvider ? 'Artisan / Pro' : 'Customer'}`}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-trust-600 hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* Compact eye toggle for the two-up password fields */
const PasswordToggle = ({ show, onToggle, compact = false }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={show ? 'Hide password' : 'Show password'}
    className={[
      'absolute flex cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600',
      compact ? 'right-2 top-[26px] h-7 w-7' : 'right-3 top-8 h-8 w-8',
    ].join(' ')}
  >
    {show ? <EyeSlash aria-hidden="true" size={15} /> : <Eye aria-hidden="true" size={15} />}
  </button>
);

export default Register;
