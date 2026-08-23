import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const provider = user?.provider;

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
            <span className="text-2xl font-black text-amber-300">⭐ {provider?.trustScore || '4.9'} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Trust Badges & Verification Status */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🛡️</span> Trust & Verification Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${provider?.identityVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="text-xs font-bold block">IDENTITY VERIFIED</span>
            <span className="text-lg font-bold mt-1 block">
              {provider?.identityVerified ? '🟢 Verified' : '⚪ Pending ID'}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${provider?.phoneVerified !== false ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="text-xs font-bold block">PHONE VERIFIED</span>
            <span className="text-lg font-bold mt-1 block">
              🟢 Verified (+233)
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${provider?.skillsVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <span className="text-xs font-bold block">SKILLS VERIFIED</span>
            <span className="text-lg font-bold mt-1 block">
              {provider?.skillsVerified ? '🟢 Level 2 Certified' : '🟡 Under Review'}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${provider?.locationVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="text-xs font-bold block">LOCATION VERIFIED</span>
            <span className="text-lg font-bold mt-1 block">
              {provider?.locationVerified ? '🟢 Kumasi / Ashanti' : '⚪ Not Set'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Jobs Completed</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">{provider?.jobsCompleted || 127}</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">98.5% Completion Rate</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Active Bookings</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">2 Requests</p>
          <span className="text-xs text-blue-600 font-semibold mt-1 block">Requires Action</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Years Experience</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">{provider?.experienceYears || 8} Yrs</p>
          <span className="text-xs text-gray-500 mt-1 block">Ghana Registered Pro</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
