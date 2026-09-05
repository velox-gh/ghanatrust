import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { LockKey, ShieldCheck } from '@phosphor-icons/react';
import { authAPI } from '../services/api';
import { Button, Card, Field, Alert } from '../components/ui';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
        <Card padding="p-8" className="w-full max-w-md rounded-3xl text-center">
          <h1 className="text-xl font-black text-navy-900">Invalid reset link</h1>
          <p className="mt-2 text-sm text-slate-500">This link is missing its token. Request a fresh one.</p>
          <div className="mt-6">
            <Button to="/forgot-password">Request new link</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card padding="p-8" className="rounded-3xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-800 text-white shadow-cta">
              <LockKey weight="duotone" size={30} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-navy-900">Set a new password</h1>
            <p className="mt-1 text-xs text-slate-500">Choose something strong you don't use elsewhere.</p>
          </div>

          {error && (
            <Alert tone="error" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          )}

          {done ? (
            <Alert tone="success">
              Password updated! Redirecting you to sign in…
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="New Password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Field
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button type="submit" size="lg" loading={loading} className="w-full">
                Reset Password
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            <Link to="/login" className="font-bold text-trust-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
