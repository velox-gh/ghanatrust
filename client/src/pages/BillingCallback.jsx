import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Rocket } from '@phosphor-icons/react';
import { subscriptionAPI } from '../services/api';
import { Button, Card, Spinner } from '../components/ui';

// Paystack redirects here after a plan checkout: /billing/callback?reference=...
const BillingCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState('verifying'); // verifying | success | failed

  useEffect(() => {
    const run = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      if (!reference) {
        setState('failed');
        return;
      }
      try {
        const res = await subscriptionAPI.verifySubscription(reference);
        setState(res.data.status === 'ACTIVE' ? 'success' : 'failed');
      } catch {
        setState('failed');
      }
    };
    run();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4">
      <Card padding="p-10" className="w-full max-w-md rounded-3xl text-center">
        {state === 'verifying' && (
          <>
            <Spinner size="lg" className="mx-auto text-trust-600" />
            <h1 className="mt-6 text-xl font-black text-navy-900">Activating your plan…</h1>
            <p className="mt-2 text-sm text-slate-500">Confirming your subscription payment with Paystack.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-trust-100 text-trust-700">
              <Rocket weight="duotone" size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-xl font-black text-navy-900">You're Boosted! 🚀</h1>
            <p className="mt-2 text-sm text-slate-500">
              Your plan is active. Your profile now ranks higher in customer searches and shows your new badge.
            </p>
            <div className="mt-8">
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
        {state === 'failed' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <XCircle weight="duotone" size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-xl font-black text-navy-900">Payment Not Completed</h1>
            <p className="mt-2 text-sm text-slate-500">The subscription payment wasn't completed. No charge was made — you can try upgrading again anytime.</p>
            <div className="mt-8">
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default BillingCallback;
