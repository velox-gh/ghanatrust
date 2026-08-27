import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const DisputeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Forms state
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const [adminNotes, setAdminNotes] = useState('');
  const [resolution, setResolution] = useState('');
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [id]);

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const res = await disputeAPI.getDisputeById(id);
      setDispute(res.data.data);
      if (res.data.data.adminNotes) {
        setAdminNotes(res.data.data.adminNotes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dispute details');
    } finally {
      setLoading(false);
    }
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEvidence(true);
      await disputeAPI.uploadEvidence(id, { fileUrl: evidenceUrl, description: evidenceDesc });
      setEvidenceUrl('');
      setEvidenceDesc('');
      fetchDispute();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload evidence');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleInvestigate = async () => {
    try {
      setSubmittingAdmin(true);
      await disputeAPI.investigateDispute(id, { adminNotes });
      fetchDispute();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution) {
      alert('Resolution summary is required');
      return;
    }
    try {
      setSubmittingAdmin(true);
      await disputeAPI.resolveDispute(id, { resolution, adminNotes });
      fetchDispute();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto rounded-full"></div></div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!dispute) return <div className="p-8 text-center">Dispute not found</div>;

  const statusCfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.OPEN;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/disputes" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Disputes</Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dispute #{dispute.id}</h1>
            <p className="text-slate-600 mt-1">{TYPE_CONFIG[dispute.type] || dispute.type} - Raised on {new Date(dispute.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-bold ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Complaint Details</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm font-bold text-slate-900 mb-1">Reason: <span className="font-normal text-slate-700">{dispute.reason}</span></p>
              <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{dispute.description || 'No additional description provided.'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Booking Info</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm">
              <p className="mb-1"><span className="font-semibold">Service:</span> {dispute.booking?.service?.name}</p>
              <p className="mb-1"><span className="font-semibold">Customer:</span> {dispute.booking?.customer?.firstName} {dispute.booking?.customer?.lastName}</p>
              <p><span className="font-semibold">Provider:</span> {dispute.booking?.provider?.user?.firstName} {dispute.booking?.provider?.user?.lastName}</p>
              <Link to={`/my-bookings/${dispute.bookingId}`} className="text-blue-600 hover:underline mt-2 inline-block">View Booking &rarr;</Link>
            </div>
          </div>
        </div>

        {/* Resolution Box */}
        {dispute.status === 'RESOLVED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
            <h3 className="text-emerald-900 font-bold mb-2">Resolution</h3>
            <p className="text-emerald-800">{dispute.resolution}</p>
            <p className="text-xs text-emerald-600 mt-3">Resolved on {new Date(dispute.resolvedAt).toLocaleDateString()} by Admin</p>
          </div>
        )}

        {/* Evidence Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Evidence & Documentation</h3>
          {dispute.evidence?.length === 0 ? (
            <p className="text-slate-500 italic mb-4">No evidence uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {dispute.evidence.map((ev) => (
                <div key={ev.id} className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    Uploaded by {ev.user.firstName} ({ev.user.role}) on {new Date(ev.createdAt).toLocaleDateString()}
                  </p>
                  <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline break-all block mb-2">
                    {ev.fileUrl}
                  </a>
                  {ev.description && <p className="text-sm text-slate-700">{ev.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Upload Evidence Form (Only if not resolved/closed) */}
          {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && !isAdmin && (
            <form onSubmit={handleEvidenceSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">Upload New Evidence</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">File URL / Image Link *</label>
                  <input
                    type="url"
                    required
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={evidenceDesc}
                    onChange={(e) => setEvidenceDesc(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Briefly describe this evidence"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submittingEvidence}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingEvidence ? 'Uploading...' : 'Upload Evidence'}
              </button>
            </form>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
          <div className="bg-slate-900 text-white rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Admin Investigation Panel</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Internal Notes (Visible only to Admins)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Investigation notes..."
              />
            </div>
            
            {dispute.status === 'OPEN' && (
              <button
                onClick={handleInvestigate}
                disabled={submittingAdmin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 mb-6"
              >
                Start Investigation (Assign to me)
              </button>
            )}

            {(dispute.status === 'UNDER_INVESTIGATION' || dispute.status === 'OPEN') && (
              <div className="pt-6 border-t border-slate-800">
                <label className="block text-sm font-medium text-slate-300 mb-2">Final Resolution (Visible to users)</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
                  placeholder="Summarize the outcome (e.g. Refunded customer...)"
                />
                <button
                  onClick={handleResolve}
                  disabled={submittingAdmin}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Resolve & Close Dispute
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetail;
