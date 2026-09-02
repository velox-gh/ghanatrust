import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, SealCheck, UploadSimple } from '@phosphor-icons/react';
import { disputeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Field, StatusBadge, Spinner, Alert } from '../components/ui';

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
  const [feedback, setFeedback] = useState(null); // { tone, message }

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
      setFeedback({ tone: 'success', message: 'Evidence uploaded successfully.' });
      fetchDispute();
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.message || 'Failed to upload evidence' });
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleInvestigate = async () => {
    try {
      setSubmittingAdmin(true);
      await disputeAPI.investigateDispute(id, { adminNotes });
      setFeedback({ tone: 'success', message: 'Investigation started — dispute assigned to you.' });
      fetchDispute();
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution) {
      setFeedback({ tone: 'error', message: 'Resolution summary is required before closing a dispute.' });
      return;
    }
    try {
      setSubmittingAdmin(true);
      await disputeAPI.resolveDispute(id, { resolution, adminNotes });
      setFeedback({ tone: 'success', message: 'Dispute resolved and closed.' });
      fetchDispute();
    } catch (err) {
      setFeedback({ tone: 'error', message: err.response?.data?.message || 'Failed to resolve dispute' });
    } finally {
      setSubmittingAdmin(false);
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
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }
  if (!dispute) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Alert tone="warning">Dispute not found.</Alert>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Button variant="secondary" size="sm" to="/disputes" className="mb-6">
        <ArrowLeft aria-hidden="true" weight="bold" size={14} /> Back to Disputes
      </Button>

      {feedback && (
        <Alert tone={feedback.tone} onClose={() => setFeedback(null)} className="mb-6">
          {feedback.message}
        </Alert>
      )}

      <Card padding="p-6 md:p-8" className="mb-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">Dispute #{dispute.id}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {TYPE_CONFIG[dispute.type] || dispute.type} · Raised on {new Date(dispute.createdAt).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={dispute.status} domain="dispute" size="lg" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-2 font-bold text-navy-900">Complaint Details</h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-1 text-sm font-bold text-navy-900">
                Reason: <span className="font-normal text-slate-600">{dispute.reason}</span>
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {dispute.description || 'No additional description provided.'}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-bold text-navy-900">Booking Info</h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="mb-1"><span className="font-semibold text-navy-900">Service:</span> {dispute.booking?.service?.name}</p>
              <p className="mb-1"><span className="font-semibold text-navy-900">Customer:</span> {dispute.booking?.customer?.firstName} {dispute.booking?.customer?.lastName}</p>
              <p><span className="font-semibold text-navy-900">Provider:</span> {dispute.booking?.provider?.user?.firstName} {dispute.booking?.provider?.user?.lastName}</p>
              <Link
                to={`/my-bookings/${dispute.bookingId}`}
                className="mt-2 inline-flex items-center gap-1 font-semibold text-trust-600 hover:text-trust-700 hover:underline"
              >
                View Booking <ArrowRight aria-hidden="true" weight="bold" size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Resolution Box */}
        {dispute.status === 'RESOLVED' && (
          <div className="mb-8 rounded-xl border border-trust-200 bg-trust-50 p-5">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-trust-900">
              <SealCheck aria-hidden="true" weight="fill" size={18} className="text-trust-600" /> Resolution
            </h2>
            <p className="leading-relaxed text-trust-800">{dispute.resolution}</p>
            <p className="mt-3 text-xs font-medium text-trust-600 tabular-nums">
              Resolved on {new Date(dispute.resolvedAt).toLocaleDateString()} by Admin
            </p>
          </div>
        )}

        {/* Evidence Section */}
        <div className="mb-2">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-navy-900">Evidence &amp; Documentation</h2>
          {dispute.evidence?.length === 0 ? (
            <p className="mb-4 text-sm italic text-slate-500">No evidence uploaded yet.</p>
          ) : (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dispute.evidence.map((ev) => (
                <div key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    Uploaded by {ev.user.firstName} ({ev.user.role}) on {new Date(ev.createdAt).toLocaleDateString()}
                  </p>
                  <a
                    href={ev.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-2 block break-all font-semibold text-trust-600 hover:text-trust-700 hover:underline"
                  >
                    {ev.fileUrl}
                  </a>
                  {ev.description && <p className="text-sm leading-relaxed text-slate-600">{ev.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Upload Evidence Form (Only if not resolved/closed) */}
          {dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && !isAdmin && (
            <form onSubmit={handleEvidenceSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-3 font-bold text-navy-900">Upload New Evidence</h3>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="File URL / Image Link"
                  type="url"
                  required
                  size="sm"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Field
                  label="Description (Optional)"
                  type="text"
                  size="sm"
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Briefly describe this evidence"
                />
              </div>
              <Button type="submit" loading={submittingEvidence} size="sm">
                <UploadSimple aria-hidden="true" weight="bold" size={14} />
                {submittingEvidence ? 'Uploading…' : 'Upload Evidence'}
              </Button>
            </form>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && dispute.status !== 'RESOLVED' && dispute.status !== 'CLOSED' && (
          <div className="mt-8 rounded-2xl bg-navy-900 p-6 text-white shadow-navy">
            <h2 className="mb-4 text-lg font-bold tracking-tight">Admin Investigation Panel</h2>
            <div className="mb-4">
              <label
                htmlFor="admin-notes"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Internal Notes (Visible only to Admins)
              </label>
              <textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                aria-label="Internal investigation notes, visible only to admins"
                className="w-full rounded-xl border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-trust-500"
                placeholder="Investigation notes..."
              />
            </div>

            {dispute.status === 'OPEN' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleInvestigate}
                loading={submittingAdmin}
                className="mb-6"
              >
                Start Investigation (Assign to me)
              </Button>
            )}

            {(dispute.status === 'UNDER_INVESTIGATION' || dispute.status === 'OPEN') && (
              <div className="border-t border-navy-700 pt-6">
                <label
                  htmlFor="admin-resolution"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Final Resolution (Visible to users)
                </label>
                <textarea
                  id="admin-resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  aria-label="Final resolution summary, visible to users"
                  className="w-full rounded-xl border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-trust-500"
                  placeholder="Summarize the outcome (e.g. Refunded customer...)"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleResolve}
                  loading={submittingAdmin}
                  className="mt-4"
                >
                  Resolve &amp; Close Dispute
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DisputeDetail;
