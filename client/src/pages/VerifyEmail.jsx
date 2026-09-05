import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Warning, EnvelopeSimple } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button, Card, Spinner, Alert } from '../components/ui';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('failed');
      setMessage('This link is missing its verification token.');
      return;
    }
    authAPI
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setState('failed');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  const resend = async () => {
    setMessage('');
    try {
      await authAPI.resendVerification();
      setMessage('A fresh verification email is on its way — check your inbox.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not resend right now. Try again shortly.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <Card padding="p-10" className="w-full max-w-md rounded-3xl text-center">
        {state === 'verifying' && (
          <>
            <Spinner size="lg" className="mx-auto text-trust-600" />
            <h1 className="mt-6 text-xl font-black text-navy-900">Verifying your email…</h1>
            <p className="mt-2 text-sm text-slate-500">This only takes a moment.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle weight="duotone" size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-xl font-black text-navy-900">Email verified 🎉</h1>
            <p className="mt-2 text-sm text-slate-500">
              Your account is fully unlocked — bookings, reviews, and payments are ready to go.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button to={isAuthenticated ? '/dashboard' : '/login'}>
                {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
              </Button>
            </div>
          </>
        )}
        {state === 'failed' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Warning weight="duotone" size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-xl font-black text-navy-900">Verification problem</h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            {message && <Alert tone="info" className="mt-4 text-left">{message}</Alert>}
            <div className="mt-6 flex flex-col items-center gap-3">
              {isAuthenticated && (
                <Button variant="secondary" onClick={resend}>
                  <EnvelopeSimple aria-hidden="true" weight="bold" size={15} />
                  Resend verification email
                </Button>
              )}
              <Link to={isAuthenticated ? '/dashboard' : '/login'} className="text-xs font-bold text-trust-600 hover:underline">
                {isAuthenticated ? 'Back to dashboard' : 'Back to sign in'}
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
