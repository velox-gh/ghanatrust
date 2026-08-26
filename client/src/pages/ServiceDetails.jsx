import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Service Not Found</h2>
          <Link to="/services" className="mt-4 text-emerald-600 font-bold block">
            ← Browse All Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-8 rounded-3xl mb-10 shadow-xl border border-slate-700/50">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {service.category?.name || 'Category'}
          </span>
          <h1 className="text-3xl font-black mt-3 mb-2">{service.name}</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            {service.description || 'Find verified professionals offering top-tier installation, repair, and maintenance services across Ghana.'}
          </p>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Verified Providers For {service.name}
        </h2>

        {service.providerServices?.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <p className="text-slate-500">No providers available for this specific service yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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