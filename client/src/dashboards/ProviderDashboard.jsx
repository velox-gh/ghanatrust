import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { providerAPI } from '../services/api';

const VerificationBadge = ({ label, verified, pendingStatus }) => {
  const isPending = pendingStatus === 'PENDING';
  if (verified) {
    return (
      <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800">
        <span className="text-xs font-bold block uppercase">{label}</span>
        <span className="text-base font-bold mt-1 block">🟢 Verified</span>
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-800">
        <span className="text-xs font-bold block uppercase">{label}</span>
        <span className="text-base font-bold mt-1 block">🟡 Under Review</span>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 text-gray-500">
      <span className="text-xs font-bold block uppercase">{label}</span>
      <span className="text-base font-bold mt-1 block">⚪ Not Submitted</span>
    </div>
  );
};

const ProviderDashboard = () => {
  const { user } = useAuth();
  const provider = user?.provider;

  const [verifications, setVerifications] = useState([]);
  const [loadingVerifications, setLoadingVerifications] = useState(true);

  // Form state
  const [identityDoc, setIdentityDoc] = useState('');
  const [identityNote, setIdentityNote] = useState('');
  const [skillsDoc, setSkillsDoc] = useState('');
  const [skillsNote, setSkillsNote] = useState('');
  const [submitLoading, setSubmitLoading] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null);

  useEffect(() => {
    fetchMyVerifications();
  }, []);

  async function fetchMyVerifications() {
    try {
      const res = await providerAPI.getMyVerifications();
      setVerifications(res.data.verifications || []);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoadingVerifications(false);
    }
  }

  const getStatusForType = (type) => {
    const req = verifications.find(v => v.type === type);
    return req?.status || null;
  };

  const handleSubmit = async (type, documentUrl, notes) => {
    setSubmitLoading(type);
    setSubmitMessage(null);
    try {
      await providerAPI.submitVerification({ type, documentUrl, notes });
      setSubmitMessage({ type: 'success', text: `✅ ${type === 'IDENTITY' ? 'Identity' : 'Skills'} verification submitted! Our team will review it shortly.` });
      fetchMyVerifications();
      if (type === 'IDENTITY') { setIdentityDoc(''); setIdentityNote(''); }
      if (type === 'SKILLS') { setSkillsDoc(''); setSkillsNote(''); }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: `❌ Failed to submit. ${err.response?.data?.message || 'Try again.'}` });
    } finally {
      setSubmitLoading('');
    }
  };

  const identityStatus = getStatusForType('IDENTITY');
  const skillsStatus = getStatusForType('SKILLS');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Provider Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-emerald-500/30 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Service Provider Portal
            </span>
            <h1 className="text-3xl font-bold mt-2">
              Welcome, {user?.firstName}! 🔧
            </h1>
            <p className="text-emerald-100 mt-1">
              {provider?.businessName || 'Build your trusted reputation and expand your client base across Ghana.'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 text-center">
            <span className="text-xs text-emerald-200 block uppercase tracking-wider">Trust Score</span>
            <span className="text-2xl font-black text-amber-300">⭐ {provider?.trustScore || '0.0'} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Trust Badges & Verification Status */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🛡️</span> Trust & Verification Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VerificationBadge
            label="Ghana Card Identity"
            verified={provider?.identityVerified}
            pendingStatus={identityStatus}
          />
          <div className={`p-4 rounded-xl border ${provider?.phoneVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="text-xs font-bold block uppercase">Phone Verified</span>
            <span className="text-base font-bold mt-1 block">
              {provider?.phoneVerified ? '🟢 Verified' : '⚪ Not Verified'}
            </span>
          </div>
          <VerificationBadge
            label="Skills / Trade Cert"
            verified={provider?.skillsVerified}
            pendingStatus={skillsStatus}
          />
          <div className={`p-4 rounded-xl border ${provider?.locationVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="text-xs font-bold block uppercase">Location Verified</span>
            <span className="text-base font-bold mt-1 block">
              {provider?.locationVerified ? '🟢 Verified' : '⚪ Not Set'}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Submission Forms */}
      {submitMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold mb-6 ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {submitMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Identity Verification Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            🪪 Identity Verification
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Submit your Ghana Card details to get identity-verified.
          </p>
          {provider?.identityVerified ? (
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-semibold">
              ✅ Your identity is already verified!
            </div>
          ) : identityStatus === 'PENDING' ? (
            <div className="text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm font-semibold">
              🟡 Verification request is under review.
            </div>
          ) : identityStatus === 'REJECTED' ? (
            <div className="space-y-3">
              <div className="text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold">
                ❌ Previous request was rejected. Please resubmit with corrected details.
              </div>
              <IdentityForm
                doc={identityDoc} setDoc={setIdentityDoc}
                note={identityNote} setNote={setIdentityNote}
                loading={submitLoading === 'IDENTITY'}
                onSubmit={() => handleSubmit('IDENTITY', identityDoc, identityNote)}
              />
            </div>
          ) : (
            <IdentityForm
              doc={identityDoc} setDoc={setIdentityDoc}
              note={identityNote} setNote={setIdentityNote}
              loading={submitLoading === 'IDENTITY'}
              onSubmit={() => handleSubmit('IDENTITY', identityDoc, identityNote)}
            />
          )}
        </div>

        {/* Skills Verification Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            📜 Skills / Trade Certificate
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Upload your NVTI certificate or relevant trade qualification.
          </p>
          {provider?.skillsVerified ? (
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-sm font-semibold">
              ✅ Your skills are already verified!
            </div>
          ) : skillsStatus === 'PENDING' ? (
            <div className="text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl text-sm font-semibold">
              🟡 Skills verification request is under review.
            </div>
          ) : skillsStatus === 'REJECTED' ? (
            <div className="space-y-3">
              <div className="text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold">
                ❌ Previous request was rejected. Please resubmit with the correct certificate.
              </div>
              <SkillsForm
                doc={skillsDoc} setDoc={setSkillsDoc}
                note={skillsNote} setNote={setSkillsNote}
                loading={submitLoading === 'SKILLS'}
                onSubmit={() => handleSubmit('SKILLS', skillsDoc, skillsNote)}
              />
            </div>
          ) : (
            <SkillsForm
              doc={skillsDoc} setDoc={setSkillsDoc}
              note={skillsNote} setNote={setSkillsNote}
              loading={submitLoading === 'SKILLS'}
              onSubmit={() => handleSubmit('SKILLS', skillsDoc, skillsNote)}
            />
          )}
        </div>
      </div>

      {/* Verification History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900">Verification Request History</h2>
        </div>
        {loadingVerifications ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading history...</div>
        ) : verifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No verification requests submitted yet.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Submitted</th>
                <th className="px-6 py-3 font-semibold">Admin Notes</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {req.status === 'PENDING' && <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full text-xs font-bold">Pending</span>}
                    {req.status === 'VERIFIED' && <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full text-xs font-bold">Verified ✓</span>}
                    {req.status === 'REJECTED' && <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-full text-xs font-bold">Rejected</span>}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(req.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {req.adminNotes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Jobs Completed</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">{provider?.jobsCompleted || 0}</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">{provider?.completionRate || 0}% Completion Rate</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Trust Score</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">⭐ {provider?.trustScore || 0}</p>
          <span className="text-xs text-gray-500 mt-1 block">Based on reviews & jobs</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Years Experience</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">{provider?.experienceYears || 0} Yrs</p>
          <span className="text-xs text-gray-500 mt-1 block">Ghana Registered Pro</span>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Identity form
function IdentityForm({ doc, setDoc, note, setNote, loading, onSubmit }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">GHANA CARD ID NUMBER</label>
        <input
          type="text"
          required
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          placeholder="GHA-XXXXXXXXX-X"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">NOTES (Optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any additional information..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Identity Request 🪪'}
      </button>
    </form>
  );
}

// Sub-component: Skills form
function SkillsForm({ doc, setDoc, note, setNote, loading, onSubmit }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">CERTIFICATE / DOCUMENT URL</label>
        <input
          type="text"
          required
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
          placeholder="https://drive.google.com/your-certificate"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">TRADE / SKILL DESCRIPTION</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. NVTI Level 2 Electrician, 2019"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Skills Request 📜'}
      </button>
    </form>
  );
}

export default ProviderDashboard;
