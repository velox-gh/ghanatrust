import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Eye, EyeSlash, Key } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Field, Alert } from '../components/ui';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const googleError = searchParams.get('error') === 'google';
  // Set by the 401 interceptor when a token is rejected mid-session.
  const sessionExpired = searchParams.get('expired') === '1';
  // ProtectedRoute stashes the page the user was trying to reach.
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from || '/dashboard', { replace: true });
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card padding="p-8" className="rounded-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-800 text-white shadow-cta">
              <ShieldCheck weight="duotone" size={30} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-navy-900">Sign In to GhanaTrust</h1>
            <p className="mt-1 text-xs text-slate-500">Access your trust dashboard or manage service bookings</p>
          </div>

          {sessionExpired && (
            <Alert tone="warning" title="Your session expired" className="mb-6 text-xs">
              Sign in again to pick up where you left off.
            </Alert>
          )}

          {/* Quick Demo Credentials Help */}
          <Alert
            tone="info"
            title={
              <span className="inline-flex items-center gap-1.5">
                <Key aria-hidden="true" weight="fill" size={13} /> Quick Demo Accounts
              </span>
            }
            className="mb-6 text-xs"
          >
            <div className="space-y-1 text-[11px] leading-relaxed">
              <div><strong>Admin:</strong> admin@ghanatrust.com | Password123!</div>
              <div><strong>Provider:</strong> kwame@ghanatrust.com | Password123!</div>
              <div><strong>Customer:</strong> customer@ghanatrust.com | Password123!</div>
            </div>
          </Alert>

          {error && (
            <Alert tone="error" onClose={() => setError('')} className="mb-6">
              {error}
            </Alert>
          )}

          {googleError && !error && (
            <Alert tone="error" className="mb-6">
              Google sign-in failed. Please try again.
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <Field
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="e.g. kwame@ghanatrust.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <Field
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-8 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {showPassword ? <EyeSlash aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
              </button>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Signing In…' : 'Sign In'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A8.99 8.99 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A8.99 8.99 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </a>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-trust-600 hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
