import { useState, useEffect, useCallback } from 'react';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { CurrencyCircleDollar, Receipt, CheckCircle } from '@phosphor-icons/react';
import { Alert, Card, EmptyState, Spinner, StatCard, StatusBadge } from '../components/ui';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentAPI.getTransactionHistory();
      setPayments(res.data.payments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50 py-10">
        <Spinner size="lg" className="text-trust-600" />
      </div>
    );
  }

  const role = user?.role;
  const totalSpent = role === 'CUSTOMER' ? payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0) : 0;
  const totalEarned = role === 'PROVIDER' ? payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0) : 0;
  const completedCount = payments.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-navy-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-navy-900">Transaction History</h1>
            <p className="mt-1 text-sm text-slate-600">View your mobile money payments and service earnings.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={CurrencyCircleDollar}
            tone="trust"
            label={role === 'CUSTOMER' ? 'Total Spent' : 'Total Earned'}
            value={`GH₵ ${(role === 'CUSTOMER' ? totalSpent : totalEarned).toFixed(2)}`}
          />
          <StatCard icon={Receipt} tone="blue" label="Total Transactions" value={payments.length} />
          <StatCard
            icon={CheckCircle}
            tone="emerald"
            label="Completed Payments"
            value={completedCount}
            sublabel={payments.length ? `${Math.round((completedCount / payments.length) * 100)}% of all transactions` : undefined}
          />
        </div>

        {error && <Alert tone="error" className="mb-6">{error}</Alert>}

        {/* Transactions List */}
        {payments.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No Transactions Yet"
            body="Your mobile money payments and service earnings will appear here once you transact."
            action={role === 'CUSTOMER' ? { label: 'Browse Services', to: '/' } : undefined}
          />
        ) : (
          <Card padding="p-0" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Transaction ID</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Service</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{role === 'CUSTOMER' ? 'Paid To' : 'Received From'}</th>
                    <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Method</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(payment.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {payment.transactionId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-navy-900">
                        <Link to={`/my-bookings/${payment.bookingId}`} className="transition hover:text-trust-600">
                          {payment.booking?.service?.name || 'Service'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {role === 'CUSTOMER'
                          ? `${payment.booking?.provider?.user?.firstName} ${payment.booking?.provider?.user?.lastName}`
                          : `${payment.booking?.customer?.firstName} ${payment.booking?.customer?.lastName}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {payment.method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black tabular-nums text-navy-900">
                        GH₵ {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={payment.status} domain="payment" size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Payments;
