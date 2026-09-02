import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass, MapPin, ShieldCheck, SealCheck, Trophy, ArrowRight,
  Handshake, Phone, IdentificationCard, Certificate, TrendUp, UsersThree,
} from '@phosphor-icons/react';
import { serviceAPI, providerAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';
import ServiceCard from '../components/ServiceCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import TrustBadge from '../components/ui/TrustBadge';

// Proof-strip content — the numbers behind the trust claim
const PROOF_STATS = [
  { icon: ShieldCheck, value: '3-Level', label: 'Verification System' },
  { icon: UsersThree, value: '1,000+', label: 'Verified Artisans' },
  { icon: TrendUp, value: '95%+', label: 'Job Completion Rate' },
  { icon: Handshake, value: '100%', label: 'Ghana Card Checked' },
];

// The 3-level verification ladder — Level 3 earns the gold treatment
const TRUST_LEVELS = [
  {
    level: 1,
    icon: IdentificationCard,
    title: 'Identity Verified',
    color: 'blue',
    points: ['Government-issued Ghana Card validation', 'Phone number verified via MoMo', 'Residence & emergency contact records'],
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    level: 2,
    icon: Certificate,
    title: 'Profession Verified',
    color: 'emerald',
    points: ['Trade certifications checked', 'Master apprenticeship evidence', 'Workplace or shop inspection'],
    badge: 'bg-trust-50 text-trust-700 border-trust-200',
    iconBg: 'bg-trust-100 text-trust-700',
  },
  {
    level: 3,
    icon: Trophy,
    title: 'Trusted Professional',
    color: 'gold',
    points: ['20+ completed jobs on record', '95%+ completion rate', 'Verified customer star reviews'],
    badge: 'bg-gold-50 text-gold-700 border-gold-200',
    iconBg: 'bg-gold-100 text-gold-700',
  },
];

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
    <div className="bg-navy-50">
      {/* ============ HERO — one primary CTA: search ============ */}
      <section className="relative overflow-hidden bg-navy-900 py-20 text-white lg:py-28">
        {/* Decorative Background Gradients */}
        <div className="pointer-events-none absolute -z-0 right-0 top-0 h-96 w-96 rounded-full bg-trust-600/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -z-0 bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Trust Pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-800/80 px-4 py-1.5 text-xs font-semibold text-trust-300">
              <ShieldCheck aria-hidden="true" weight="fill" size={14} />
              Ghana's Trust-First Service Marketplace
            </div>

            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Who Can You{' '}
              <span className="bg-gradient-to-r from-trust-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                Trust
              </span>{' '}
              To Do The Job?
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Connect with identity-verified local electricians, plumbers, AC technicians, and carpenters
              across Ghana. Verified Ghana Card profiles, transparent trust scores.
            </p>

            {/* Hero Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              aria-label="Find a service professional"
              className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-200/50 bg-white p-3 shadow-2xl sm:flex-row sm:p-4"
            >
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-trust-500 focus-within:ring-2 focus-within:ring-trust-500/30">
                <MagnifyingGlass aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
                <label htmlFor="hero-search" className="sr-only-x">What service do you need?</label>
                <input
                  id="hero-search"
                  type="text"
                  placeholder="e.g. Electrician, AC Repair, Plumbing..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-navy-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-trust-500 sm:w-48">
                <MapPin aria-hidden="true" weight="fill" size={18} className="shrink-0 text-slate-400" />
                <label htmlFor="hero-region" className="sr-only-x">Select region</label>
                <select
                  id="hero-region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium text-navy-900 focus:outline-none"
                >
                  <option value="">All Regions</option>
                  <option value="Ashanti">Ashanti (Kumasi)</option>
                  <option value="Accra">Greater Accra</option>
                  <option value="Western">Western (Takoradi)</option>
                  <option value="Central">Central (Cape Coast)</option>
                </select>
              </div>

              <Button type="submit" size="lg" className="sm:!px-6">
                Search Pros
              </Button>
            </form>

            {/* Quick Badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" weight="fill" size={13} className="text-trust-400" /> Ghana Card ID Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Phone aria-hidden="true" weight="fill" size={13} className="text-trust-400" /> MoMo Phone Verified
              </span>
              <span className="flex items-center gap-1.5">
                <SealCheck aria-hidden="true" weight="fill" size={13} className="text-trust-400" /> Trade Skill Certified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <section aria-label="GhanaTrust by the numbers" className="border-b border-navy-800 bg-navy-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-navy-800 px-4 py-8 sm:px-6 md:grid-cols-4 md:divide-x lg:px-8">
          {PROOF_STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 px-4 py-2">
              <Icon aria-hidden="true" weight="duotone" size={28} className="text-trust-500" />
              <div>
                <p className="text-xl font-black tracking-tight text-white tabular-nums">{value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ THE TRUST LADDER — solution ============ */}
      <section id="how-it-works" className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-trust-600">
              The GhanaTrust Differentiator
            </h2>
            <h3 className="text-3xl font-black tracking-tight text-navy-900">
              Our 3-Level Verification System
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We eliminate uncertainty by thoroughly vetting every professional before they serve your home or business.
            </p>
          </div>

          {/* Connected ladder: each level builds on the last */}
          <ol className="relative mx-auto max-w-4xl space-y-6">
            {TRUST_LEVELS.map(({ level, icon: Icon, title, points, badge, iconBg }, i) => (
              <li key={level} className="relative">
                {/* Connector line to the next level */}
                {i < TRUST_LEVELS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-7 top-16 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-slate-300 to-slate-200"
                  />
                )}
                <div className="relative flex gap-5 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-card transition duration-200 hover:shadow-lift sm:p-8">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                    <Icon aria-hidden="true" weight="duotone" size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <TrustBadge level={level} />
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badge}`}>
                        Level {level}
                      </span>
                    </div>
                    <h4 className="mb-1.5 text-lg font-bold tracking-tight text-navy-900">{title}</h4>
                    <ul className="grid gap-1.5 sm:grid-cols-3">
                      {points.map((point) => (
                        <li key={point} className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-600">
                          <SealCheck aria-hidden="true" weight="fill" size={13} className="mt-0.5 shrink-0 text-trust-500" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ FEATURED VERIFIED ARTISANS ============ */}
      <section className="bg-navy-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between items-start md:flex-row md:items-end">
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-trust-600">
                Verified Professionals
              </span>
              <h3 className="text-3xl font-black tracking-tight text-navy-900">
                Featured Ghanaian Artisans
              </h3>
            </div>
            <Link
              to="/services"
              className="group mt-4 flex items-center gap-1 text-sm font-bold text-trust-600 transition hover:text-trust-700 md:mt-0"
            >
              View All Verified Pros
              <ArrowRight aria-hidden="true" weight="bold" size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <p className="text-slate-500">No verified providers found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {providers.slice(0, 3).map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ CATEGORIES GRID ============ */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-trust-600">
              Top Categories
            </span>
            <h3 className="text-3xl font-black tracking-tight text-navy-900">
              Explore Services By Category
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((category) => (
              <ServiceCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="bg-navy-900 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Ready to hire with confidence?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Join thousands of Ghanaian households and businesses who never have to ask
            &ldquo;who can I trust?&rdquo; again.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/services" size="lg">
              Find a Professional
              <ArrowRight aria-hidden="true" weight="bold" size={15} />
            </Button>
            <Button to="/register" variant="onDark" size="lg">
              Become a Verified Pro
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
