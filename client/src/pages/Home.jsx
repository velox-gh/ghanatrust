import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlass, ShieldCheck, SlidersHorizontal, X, Storefront, Info,
} from '@phosphor-icons/react';
import { serviceAPI, providerAPI } from '../services/api';
import { useUserLocation } from '../hooks/useUserLocation';
import ProviderCard from '../components/ProviderCard';
import CategoryStrip from '../components/CategoryStrip';
import LocationPicker from '../components/LocationPicker';
import { Button, Skeleton, EmptyState } from '../components/ui';

/**
 * The homepage IS the marketplace feed.
 *
 * Someone arriving to book a plumber should see plumbers, not a pitch. The
 * verification story that used to occupy the first three screens now lives at
 * /how-it-works and is summarised in one strip below the results, because it
 * earns trust for people who go looking for it and costs nothing to those who
 * came only to book.
 */
const Home = () => {
  // Deep links from the footer, old /services URLs and shared searches land
  // here with their filters in the query string.
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [submittedSearch, setSubmittedSearch] = useState(() => searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(() => searchParams.get('verifiedOnly') === 'true');

  const { location, setLocation, detect, detecting, error: locationError } = useUserLocation();
  const locationId = location?.id;

  useEffect(() => {
    serviceAPI
      .getCategories()
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await providerAPI.getProviders({
        categoryId: categoryId || undefined,
        locationId: locationId || undefined,
        search: submittedSearch || undefined,
        verifiedOnly: verifiedOnly ? 'true' : undefined,
      });
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error('Failed to load providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, locationId, submittedSearch, verifiedOnly]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Mirror the active filters into the URL so a result set can be shared or
  // reloaded. `replace` keeps filter tweaks out of the back-button history.
  useEffect(() => {
    const next = new URLSearchParams();
    if (submittedSearch) next.set('search', submittedSearch);
    if (categoryId) next.set('categoryId', categoryId);
    if (verifiedOnly) next.set('verifiedOnly', 'true');
    setSearchParams(next, { replace: true });
  }, [submittedSearch, categoryId, verifiedOnly, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm.trim());
  };

  const clearAll = () => {
    setSearchTerm('');
    setSubmittedSearch('');
    setCategoryId('');
    setVerifiedOnly(false);
  };

  const activeCategory = categories.find((c) => String(c.id) === String(categoryId));
  const hasFilters = Boolean(submittedSearch || categoryId || verifiedOnly);

  const heading = activeCategory
    ? `${activeCategory.name} professionals`
    : submittedSearch
      ? `Results for "${submittedSearch}"`
      : location
        ? `Available in ${location.name}`
        : 'Available across Ghana';

  return (
    <div className="min-h-screen bg-navy-50">
      {/* ===== SEARCH BAR — the first thing on the page, and it stays there ===== */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} role="search" aria-label="Find a service professional">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-trust-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-trust-500/25">
                <MagnifyingGlass aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
                <label htmlFor="feed-search" className="sr-only-x">
                  Search for a service or professional
                </label>
                <input
                  id="feed-search"
                  type="search"
                  placeholder="What do you need? Electrician, AC repair, plumbing..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-navy-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <LocationPicker
                location={location}
                onChange={setLocation}
                onDetect={detect}
                detecting={detecting}
                error={locationError}
                className="sm:w-56"
              />

              <Button type="submit" className="sm:!px-7">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ===== CATEGORIES ===== */}
        <div className="mb-6">
          <CategoryStrip categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
        </div>

        {/* ===== RESULT HEADER + QUICK FILTERS ===== */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight text-navy-900 sm:text-2xl">
              {heading}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500" aria-live="polite">
              {loading
                ? 'Loading professionals...'
                : `${providers.length} verified professional${providers.length === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVerifiedOnly((v) => !v)}
              aria-pressed={verifiedOnly}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                verifiedOnly
                  ? 'border-trust-500 bg-trust-50 text-trust-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-trust-300'
              }`}
            >
              <ShieldCheck aria-hidden="true" weight="fill" size={14} />
              Verified only
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-slate-400"
              >
                <X aria-hidden="true" weight="bold" size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ===== THE FEED ===== */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} rounded="rounded-2xl" className="h-80" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="Nobody matches that yet"
            body={
              location
                ? `We could not find professionals in ${location.name} for this search. Try widening to all of Ghana.`
                : 'Try a different category or search keyword.'
            }
            action={
              hasFilters
                ? { label: 'Clear filters', onClick: clearAll, variant: 'secondary' }
                : { label: 'Show all of Ghana', onClick: () => setLocation(null), variant: 'secondary' }
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}

        {/* ===== TRUST STRIP — the pitch, compressed, below the results ===== */}
        <section
          aria-label="Why GhanaTrust"
          className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight text-navy-900">
                Every professional here is verified before they reach you
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                Ghana Card identity checks, trade certification, and a track record of completed jobs —
                three levels, checked by us. You pay only after the work is done.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button to="/how-it-works" variant="secondary" size="sm">
                <Info aria-hidden="true" weight="duotone" size={15} />
                How it works
              </Button>
              <Button to="/register?role=provider" size="sm">
                <Storefront aria-hidden="true" weight="duotone" size={15} />
                Offer your services
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Browsing is free and needs no account.{' '}
          <Link to="/how-it-works" className="font-semibold text-trust-600 hover:underline">
            See how booking works
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Home;
