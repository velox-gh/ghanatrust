import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import { serviceAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';
import { Button, EmptyState, Spinner, getCategoryIcon } from '../components/ui';

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchService = async () => {
    try {
      const res = await serviceAPI.getServiceById(id);
      setService(res.data.service);
    } catch (err) {
      console.error('Failed to load service details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <Spinner size="lg" className="text-trust-600" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-navy-900">Service Not Found</h2>
          <Button to="/" variant="secondary" size="md" className="mt-4">
            <ArrowLeft aria-hidden="true" weight="bold" size={14} />
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(service.category?.name);

  return (
    <div className="min-h-screen bg-navy-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button to="/" variant="ghost" size="sm" className="mb-4 -ml-2">
          <ArrowLeft aria-hidden="true" weight="bold" size={14} />
          All Services
        </Button>

        <div className="relative mb-10 overflow-hidden rounded-3xl border border-navy-700/50 bg-gradient-to-r from-navy-900 via-navy-800 to-trust-950 p-8 text-white shadow-navy">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-trust-500/15 blur-3xl"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-trust-400/30 bg-trust-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-trust-300">
              <CategoryIcon aria-hidden="true" weight="fill" size={13} />
              {service.category?.name || 'Category'}
            </span>
            <h1 className="mb-2 mt-3 text-3xl font-black tracking-tight">{service.name}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
              {service.description || 'Find verified professionals offering top-tier installation, repair, and maintenance services across Ghana.'}
            </p>
          </div>
        </div>

        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight text-navy-900">
          <CheckCircle aria-hidden="true" weight="fill" size={20} className="text-trust-600" />
          Verified Providers For {service.name}
        </h2>

        {service.providerServices?.length === 0 ? (
          <EmptyState
            icon={ getCategoryIcon(service.category?.name) }
            title="No Providers Yet"
            body="No verified professionals offer this specific service yet. Check back soon or browse similar services."
            action={{ label: 'Browse All Services', to: '/', variant: 'secondary' }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {service.providerServices?.map((ps) => (
              <ProviderCard key={ps.provider.id} provider={ps.provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
