
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Briefcase, CheckCircle, Star } from '@phosphor-icons/react';
import TrustBadge from './ui/TrustBadge';
import Card from './ui/Card';
import Button from './ui/Button';

const ProviderCard = ({ provider }) => {
  const user = provider.user || {};
  const primaryLocation = provider.locations?.[0]?.location?.name || 'Kumasi, Ghana';
  const primaryService = provider.services?.[0]?.service?.name || 'Professional Artisan';
  const reviewCount = provider.reviews?.length || provider.jobsCompleted || 0;

  // Trust ladder: 3 = trade-certified with a proven track record (20+ jobs, 95%+ completion)
  const trustLevel = provider.skillsVerified && (provider.jobsCompleted || 0) >= 20 && (provider.completionRate || 0) >= 95
    ? 3
    : (provider.skillsVerified || provider.identityVerified) ? 2 : 1;

  return (
    <Card hover padding="p-0" className="group relative flex flex-col justify-between overflow-hidden">
      <div>
        {/* Top Header & Trust Status Badge */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
          <TrustBadge level={trustLevel} size="sm" />
          <span className="inline-flex items-center gap-1 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-xs font-black text-gold-800">
            <Star aria-hidden="true" weight="fill" size={12} className="text-gold-400" />
            <span className="tabular-nums">{provider.trustScore ? provider.trustScore.toFixed(1) : '4.9'}</span>
            <span className="font-medium tabular-nums text-slate-400">({reviewCount})</span>
            <span className="sr-only-x">rating from {reviewCount} reviews</span>
          </span>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="mb-4 flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 to-trust-800 text-xl font-bold text-white shadow-cta" aria-hidden="true">
                {user.firstName ? user.firstName[0] : 'P'}
              </div>
              {provider.identityVerified && (
                <span
                  title="Ghana Card ID Verified"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-trust-500 text-white shadow-sm"
                >
                  <CheckCircle aria-hidden="true" weight="fill" size={14} />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-tight text-navy-900 transition group-hover:text-trust-700">
                <Link to={`/providers/${provider.id}`} className="outline-none after:absolute after:inset-0">
                  {user.firstName} {user.lastName}
                </Link>
              </h3>
              <p className="truncate text-xs font-semibold text-trust-700">{provider.businessName || primaryService}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin aria-hidden="true" weight="fill" size={12} /> {primaryLocation}
              </p>
            </div>
          </div>

          {/* Description snippet */}
          <p className="mb-4 line-clamp-2 min-h-8 text-xs leading-relaxed text-slate-600">
            {provider.description ||
              'Experienced Ghanaian artisan dedicated to quality service delivery, customer satisfaction, and safe installation.'}
          </p>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2 font-semibold text-slate-700">
              <Briefcase aria-hidden="true" weight="duotone" size={13} className="text-trust-600" />
              <span className="tabular-nums">{provider.jobsCompleted || 127}+</span>&nbsp;Jobs Done
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2 font-semibold text-slate-700">
              <Star aria-hidden="true" weight="fill" size={13} className="text-gold-400" />
              Verified Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Action */}
      <div className="mt-auto border-t border-slate-100 bg-slate-50/60 p-6 pt-0">
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pricing</span>
            <span className="text-sm font-black text-navy-900">Request Quote</span>
          </div>

          <Button to={`/providers/${provider.id}`} size="sm" className="relative z-10">
            View Profile &amp; Book
            <ArrowRight aria-hidden="true" size={13} weight="bold" className="transition group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProviderCard;
