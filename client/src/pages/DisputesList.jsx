import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { disputeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  UNDER_INVESTIGATION: { label: 'Under Investigation', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-800 border-slate-300' },
};

const TYPE_CONFIG = {
  CUSTOMER_COMPLAINT: 'Customer Complaint',
  PROVIDER_COMPLAINT: 'Provider Complaint',
};

const DisputesList = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await disputeAPI.getDisputes();
      setDisputes(res.data.data);
    } catch (err) {
      setError('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto rounded-full"></div></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Disputes Center</h1>
          <p className="text-slate-600">Manage and track your disputes</p>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">⚖️</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Disputes Found</h3>
          <p className="text-slate-600 max-w-sm mx-auto">
            You don't have any active or past disputes.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Booking Service</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {disputes.map((dispute) => {
                const statusCfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.OPEN;
                return (
                  <tr key={dispute.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">#{dispute.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {TYPE_CONFIG[dispute.type] || dispute.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {dispute.booking?.service?.name || 'Unknown Service'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link
                        to={`/disputes/${dispute.id}`}
                        className="text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisputesList;
