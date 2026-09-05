import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeSimple, ShieldCheck } from '@phosphor-icons/react';
import { authAPI } from '../services/api';
import { Button, Card, Field, Alert } from '../components/ui';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      await authAPI.forgotPassword(email);
      setStatus('sent');
    } catch {
      setError('Could not send the reset email. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card padding="p-8" className="rounded-3xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-800 text-white shadow-cta">
              <ShieldCheck weight="duotone" size={30} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-navy-900">Forgot your password?</h1>
            <p className="mt-1 text-xs text-slate-500">Enter your email and we'll send you a reset link.</p>
          </div>

          {error && (
            <Alert tone="error" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          )}

          {status === 'sent' ? (
            <Alert tone="success" className="mb-4">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox
              (and spam folder). The link expires in 1 hour.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Email Address"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" size="lg" loading={status === 'sending'} className="w-full">
                <EnvelopeSimple aria-hidden="true" weight="bold" size={16} />
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-trust-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
