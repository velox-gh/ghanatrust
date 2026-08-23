import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { serviceAPI, providerAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('categoryId') || '';
  const currentSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFilteredProviders();
  }, [selectedCategory, searchTerm]);

  const fetchInitialData = async () => {
    try {
      const catRes = await serviceAPI.getCategories();
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchFilteredProviders = async () => {
    setLoading(true);
    try {
      const res = await providerAPI.getProviders({
        categoryId: selectedCategory || undefined,
        search: searchTerm || undefined
      });
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Browse Verified Service Professionals
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Search identity-checked electricians, plumbers, AC technicians & artisans across Ghana.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="Search by artisan name, service keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                <option value="">All Service Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat._count?.services || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-lg font-bold text-slate-800">No Verified Artisans Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your category or search keyword filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
              }}
              className="mt-4 inline-block text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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