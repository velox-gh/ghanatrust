import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceAPI, providerAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [catRes, provRes] = await Promise.all([
        serviceAPI.getCategories(),
        providerAPI.getProviders({ verifiedOnly: 'true' })
      ]);
      setCategories(catRes.data.categories || []);
      setProviders(provRes.data.providers || []);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(searchQuery)}&region=${encodeURIComponent(selectedRegion)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-20 lg:py-28">
        {/* Decorative Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-0 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-400 mb-6 shadow-inner">
              <span>🇬🇭</span> Ghana's Trust-First Service Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              Who Can You <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300">Trust</span> To Do The Job?
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with identity-verified local electricians, plumbers, AC technicians, and carpenters across Ghana. Verified Ghana Card profiles, transparent trust scores.
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-200/50 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="e.g. Electrician, AC Repair, Plumbing..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="sm:w-44 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-lg">📍</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-transparent text-slate-900 text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="">All Regions</option>
                  <option value="Ashanti">Ashanti (Kumasi)</option>
                  <option value="Accra">Greater Accra</option>
                  <option value="Western">Western (Takoradi)</option>
                  <option value="Central">Central (Cape Coast)</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
              >
                Search Pros
              </button>
            </form>

            {/* Quick Badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">🟢 Ghana Card ID Verified</span>
              <span className="flex items-center gap-1.5">🟢 MoMo Phone Verified</span>
              <span className="flex items-center gap-1.5">🟢 Trade Skill Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Levels Section */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              The GhanaTrust Differentiator
            </h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Our 3-Level Verification System
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              We eliminate uncertainty by thoroughly vetting every professional before they serve your home or business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Level 1 — Identity Verified</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Government-issued Ghana Card & Phone Number verification. Validates real identity, residence, and emergency contact records.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Level 2 — Profession Verified</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trade certifications, master apprenticeship evidence, past job references, and physical workplace inspection.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Level 3 — Trusted Professional</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consistent track record of 20+ completed jobs, 95%+ completion rate, and verified customer star reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Artisans */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Verified Professionals
              </span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                Featured Ghanaian Artisans
              </h3>
            </div>
            <Link
              to="/services"
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition mt-4 md:mt-0 flex items-center gap-1"
            >
              View All Verified Pros →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500">No verified providers found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {providers.slice(0, 3).map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
              Top Categories
            </span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Explore Services By Category
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <ServiceCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;