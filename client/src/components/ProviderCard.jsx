import React from 'react';
import { Link } from 'react-router-dom';

const ProviderCard = ({ provider }) => {
  const user = provider.user || {};
  const primaryLocation = provider.locations?.[0]?.location?.name || 'Kumasi, Ghana';
  const primaryService = provider.services?.[0]?.service?.name || 'Professional Artisan';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Top Header & Trust Status Badge */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300/60">
            <span>🛡️</span> Level {provider.identityVerified ? '2 Verified' : '1 Member'}
          </div>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full">
            <span>⭐</span> {provider.trustScore ? provider.trustScore.toFixed(1) : '4.9'}
            <span className="text-slate-400 font-medium">({provider.reviews?.length || provider.jobsCompleted || 0})</span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {user.firstName ? user.firstName[0] : 'P'}
              </div>
              {provider.identityVerified && (
                <span
                  title="Ghana Card ID Verified"
                  className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  ✓
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-xs font-semibold text-emerald-700">
                {provider.businessName || primaryService}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span>📍</span> {primaryLocation}
              </div>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {provider.description || 'Experienced Ghanaian artisan dedicated to quality service delivery, customer satisfaction, and safe installation.'}
          </p>

          {/* Trust Badges Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5 text-slate-700">
              <span className="text-emerald-500">✓</span> ID Verified
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5 text-slate-700">
              <span className="text-emerald-500">✓</span> {provider.jobsCompleted || 127}+ Jobs
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Action */}
      <div className="p-6 pt-0 border-t border-slate-100 mt-auto bg-slate-50/50">
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Pricing</span>
            <span className="text-sm font-black text-slate-900">Request Quote</span>
          </div>

          <Link
            to={`/providers/${provider.id}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition transform hover:-translate-y-0.5"
          >
            View Profile & Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
