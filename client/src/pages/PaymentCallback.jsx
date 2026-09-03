import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { paymentAPI } from '../services/api';
import { Button, Card, Spinner } from '../components/ui';

// Paystack redirects here after checkout: /payments/callback?reference=...
const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState('verifying'); // verifying | success | failed
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const run = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      if (!reference) {
        setState('failed');
        return;
      }
      try {
        const res = await paymentAPI.verifyPayment(reference);
        setPayment(res.data.payment);
        setState(res.data.status === 'COMPLETED' ? 'success' : 'failed');
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
            <h1 className="mt-6 text-xl font-black text-navy-900">Verifying your payment…</h1>
            <p className="mt-2 text-sm text-slate-500">Confirming the transaction with Paystack. This takes a moment.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle weight="duotone" size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-xl font-black text-navy-900">Payment Successful</h1>
            <p className="mt-2 text-sm text-slate-500">
              GH₵ {payment?.amount?.toFixed(2) || ''} paid{payment?.bookingId ? ` for booking #${payment.bookingId}` : ''}. The provider has been notified.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Button onClick={() => navigate(payment?.bookingId ? `/my-bookings/${payment.bookingId}` : '/payments')}>
                View Booking
              </Button>
              <Link to="/payments" className="text-xs font-bold text-trust-600 hover:underline">
                View transaction history
              </Link>
            </div>
          </>
        )}
        {state === 'failed' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <XCircle weight="duotone" size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-xl font-black text-navy-900">Payment Not Completed</h1>
            <p className="mt-2 text-sm text-slate-500">The transaction wasn't completed. You can try again from the booking page — you won't be charged twice for an unfinished payment.</p>
            <div className="mt-8">
              <Button variant="secondary" onClick={() => navigate('/my-bookings')}>
                Back to My Bookings
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentCallback;
