import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, MagnifyingGlass, SlidersHorizontal } from '@phosphor-icons/react';
import { serviceAPI, providerAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';
import { Field, EmptyState, Skeleton } from '../components/ui';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('categoryId') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentLocation = searchParams.get('locationId') || '';
  const currentVerified = searchParams.get('verifiedOnly') === 'true';

  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);
  const [verifiedOnly, setVerifiedOnly] = useState(currentVerified);

  async function fetchInitialData() {
    try {
      const [catRes, locRes] = await Promise.all([
        serviceAPI.getCategories(),
        serviceAPI.getLocations()
      ]);
      setCategories(catRes.data.categories || []);
      setRegions(locRes.data.regions || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }

  async function fetchFilteredProviders() {
    setLoading(true);
    try {
      const res = await providerAPI.getProviders({
        categoryId: selectedCategory || undefined,
        locationId: selectedLocation || undefined,
        verifiedOnly: verifiedOnly ? 'true' : undefined,
        search: searchTerm || undefined
      });
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFilteredProviders();

    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (selectedLocation) params.set('locationId', selectedLocation);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    setSearchParams(params);
  }, [selectedCategory, searchTerm, selectedLocation, verifiedOnly]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSelectedLocation('');
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-navy-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-navy-900">
            Browse Verified Service Professionals
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Search identity-checked electricians, plumbers, AC technicians &amp; artisans across Ghana.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <SlidersHorizontal aria-hidden="true" weight="bold" size={14} />
            Filter Results
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Field
                label="Search"
                type="text"
                placeholder="Search by artisan name, service keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Field as="select" label="Category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Field>

            <Field as="select" label="Location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">All Locations</option>
              {regions.map((region) => (
                <optgroup key={region.id} label={region.name}>
                  {region.locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </optgroup>
              ))}
            </Field>
          </div>

          <div className="mt-4 flex items-center border-t border-slate-100 pt-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-trust-600 focus:ring-trust-500"
              />
              <ShieldCheck aria-hidden="true" weight="fill" size={16} className="text-trust-600" />
              Show Verified Professionals Only
            </label>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} rounded="rounded-2xl" className="h-72" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon={MagnifyingGlass}
            title="No Verified Artisans Found"
            body="Try resetting your category, location, or search keyword filter to see more professionals."
            action={{ label: 'Reset Filters', onClick: resetFilters, variant: 'secondary' }}
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

export default Services;
