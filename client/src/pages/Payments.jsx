import React, { useState, useEffect, useCallback } from 'react';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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
      <div className="min-h-screen bg-slate-50 py-10 flex items-center justify-center">
        <div className="text-slate-500 animate-pulse font-semibold">Loading transactions...</div>
      </div>
    );
  }

  const role = user?.role;
  const totalSpent = role === 'CUSTOMER' ? payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0) : 0;
  const totalEarned = role === 'PROVIDER' ? payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transaction History</h1>
            <p className="text-sm text-slate-500 mt-1">View your mobile money payments and service earnings.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total {role === 'CUSTOMER' ? 'Spent' : 'Earnings'}</p>
            <p className="text-3xl font-black text-emerald-600">GH₵ {role === 'CUSTOMER' ? totalSpent.toFixed(2) : totalEarned.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Transactions</p>
            <p className="text-3xl font-black text-slate-800">{payments.length}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6 border border-red-200">{error}</div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Transaction ID</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Service</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">{role === 'CUSTOMER' ? 'Paid To' : 'Received From'}</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Method</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(payment.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {payment.transactionId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <Link to={`/my-bookings/${payment.bookingId}`} className="hover:text-blue-600">
                          {payment.booking?.service?.name || 'Service'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {role === 'CUSTOMER'
                          ? `${payment.booking?.provider?.user?.firstName} ${payment.booking?.provider?.user?.lastName}`
                          : `${payment.booking?.customer?.firstName} ${payment.booking?.customer?.lastName}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                          {payment.method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        GH₵ {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${
                          payment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          payment.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
