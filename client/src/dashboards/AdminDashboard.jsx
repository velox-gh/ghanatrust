import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await adminAPI.getVerifications();
      setVerifications(res.data.verifications || []);
    } catch (error) {
      console.error('Failed to load verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setActionLoading(id);
    try {
      await adminAPI.updateVerificationStatus(id, {
        status,
        adminNotes: `Status updated to ${status} by Admin`
      });
      // Refresh list
      fetchVerifications();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = verifications.filter(v => v.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              System Administration
            </span>
            <h1 className="text-3xl font-bold mt-2">
              GhanaTrust Admin Control Panel ⚙️
            </h1>
            <p className="text-gray-300 mt-1">
              Logged in as {user?.email} ({user?.firstName} {user?.lastName})
            </p>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Verification Queue</span>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount} Pending</p>
          <span className="text-xs text-gray-500 mt-1 block">ID & Skills review</span>
        </div>
      </div>

      {/* Verification Management Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Verification Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Provider</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Document/Details</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="animate-pulse">Loading requests...</div>
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No verification requests found.
                  </td>
                </tr>
              ) : (
                verifications.map((req) => (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {req.provider?.user?.firstName} {req.provider?.user?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{req.provider?.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                        {req.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate text-xs text-gray-600">
                        <span className="font-semibold">Doc:</span> {req.documentUrl || 'N/A'}
                        <br />
                        <span className="font-semibold">Note:</span> {req.notes || 'None'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'PENDING' && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                      {req.status === 'VERIFIED' && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 rounded-full">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'VERIFIED')}
                            disabled={actionLoading === req.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'REJECTED')}
                            disabled={actionLoading === req.id}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 disabled:opacity-50 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
