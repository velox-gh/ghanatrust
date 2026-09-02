import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
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
