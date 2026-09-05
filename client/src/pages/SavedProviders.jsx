import { useState, useEffect } from 'react';
import { BookmarkSimple } from '@phosphor-icons/react';
import { savedAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';
import { EmptyState, Skeleton } from '../components/ui';

const SavedProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savedAPI
      .list()
      .then((res) => setProviders(res.data.providers || []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-navy-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-navy-900">
            <BookmarkSimple aria-hidden="true" weight="duotone" size={26} className="text-trust-600" />
            Saved Professionals
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Your shortlist of trusted pros — ready when you need them.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} rounded="rounded-2xl" className="h-72" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon={BookmarkSimple}
            title="Nothing saved yet"
            body="Tap the bookmark icon on any provider card to keep them here for quick access."
            action={{ label: 'Browse Professionals', to: '/services' }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProviders;
