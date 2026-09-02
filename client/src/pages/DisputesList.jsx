import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scales, ArrowRight } from '@phosphor-icons/react';
import { disputeAPI } from '../services/api';
import { StatusBadge, EmptyState, Spinner, Alert } from '../components/ui';

const TYPE_CONFIG = {
  CUSTOMER_COMPLAINT: 'Customer Complaint',
  PROVIDER_COMPLAINT: 'Provider Complaint',
};

const DisputesList = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await disputeAPI.getDisputes();
      setDisputes(res.data.data);
    } catch {
      setError('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-trust-600">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-trust-50 text-trust-600">
            <Scales aria-hidden="true" weight="duotone" size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">Disputes Center</h1>
            <p className="text-sm text-slate-500">Manage and track your disputes</p>
          </div>
        </div>
      </div>

      {disputes.length === 0 ? (
        <EmptyState
          icon={Scales}
          title="No disputes filed"
          body="You don't have any active or past disputes. If something goes wrong with a booking, you can raise a dispute from the booking detail page."
          action={{ label: 'View My Bookings', to: '/my-bookings' }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Booking Service</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold tabular-nums text-slate-600">#{dispute.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-navy-900">
                      {TYPE_CONFIG[dispute.type] || dispute.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {dispute.booking?.service?.name || 'Unknown Service'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={dispute.status} domain="dispute" />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link
                        to={`/disputes/${dispute.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-trust-600 hover:text-trust-700 hover:underline"
                      >
                        View Details <ArrowRight aria-hidden="true" weight="bold" size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputesList;
