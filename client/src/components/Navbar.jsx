import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, MagnifyingGlass, Handshake, SquaresFour, Scales, SignOut, List, X, Info } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

// Home IS the marketplace feed now, so "Browse" and "Home" would be the same
// link. The second slot goes to the story page the old homepage became.
const NAV_LINKS = [
  { to: '/', label: 'Browse', icon: MagnifyingGlass, tourClass: 'tour-find-services', end: true },
  { to: '/how-it-works', label: 'How It Works', icon: Info, tourClass: 'tour-home', end: false },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && setMobileMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHowTrustWorks = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(startTour, 500); // Wait for navigation
    } else {
      startTour();
    }
  };

  const mobileLinkClass =
    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100';

  return (
    <header className="glass-nav sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo & Ghana Trust Badge */}
          <Link to="/" className="group flex items-center gap-3" aria-label="GhanaTrust home">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-trust-500 via-trust-600 to-trust-800 text-white shadow-cta transition duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100">
              <ShieldCheck weight="duotone" size={26} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-navy-900">
                  Ghana<span className="text-trust-600">Trust</span>
                </span>
                <span className="rounded-full border border-trust-200 bg-trust-50 px-2 py-0.5 text-[10px] font-bold text-trust-800">
                  Velox
                </span>
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Verified Service Marketplace
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            {NAV_LINKS.map(({ to, label, icon: Icon, tourClass, end }) => (
              <NavLink key={to} to={to} end={end}>
                {({ isActive }) => (
                  <span
                    className={[
                      'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition duration-150',
                      isActive ? 'bg-trust-50 text-trust-700' : 'text-slate-700 hover:bg-slate-50 hover:text-trust-600',
                    ].join(' ')}
                  >
                    <Icon
                      aria-hidden="true"
                      size={15}
                      weight={isActive ? 'fill' : 'regular'}
                      className={isActive ? 'text-trust-600' : 'text-slate-400'}
                    />
                    <span className={tourClass}>{label}</span>
                  </span>
                )}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleHowTrustWorks}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 transition duration-150 hover:bg-slate-50 hover:text-trust-600"
            >
              <Handshake aria-hidden="true" size={15} />
              <span className="tour-how-it-works">How Trust Works</span>
            </button>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="tour-dashboard flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-trust-500" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/disputes"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                >
                  <Scales aria-hidden="true" size={15} /> Disputes
                </Link>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-navy-900">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-trust-600">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sign out"
                    title="Sign Out"
                    className="cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <SignOut aria-hidden="true" size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-navy-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="tour-join inline-flex min-h-11 items-center rounded-xl bg-trust-600 px-5 py-2.5 text-sm font-bold text-white shadow-cta transition duration-150 hover:-translate-y-px hover:bg-trust-700 motion-reduce:hover:translate-y-0"
                >
                  Join GhanaTrust
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="cursor-pointer rounded-xl bg-slate-100 p-2.5 text-slate-700 transition hover:bg-slate-200"
            >
              {mobileMenuOpen ? <X size={18} weight="bold" aria-hidden="true" /> : <List size={18} weight="bold" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="space-y-1 border-b border-slate-200 bg-white px-4 py-4 md:hidden">
          <NavLink to="/" end className={({ isActive }) => `${mobileLinkClass} ${isActive ? 'bg-trust-50 text-trust-700' : ''}`}>
            <MagnifyingGlass aria-hidden="true" size={17} /> Browse
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `${mobileLinkClass} ${isActive ? 'bg-trust-50 text-trust-700' : ''}`}>
            <Info aria-hidden="true" size={17} /> How It Works
          </NavLink>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleHowTrustWorks();
            }}
            className={mobileLinkClass}
          >
            <Handshake aria-hidden="true" size={17} /> How Trust Works
          </button>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `${mobileLinkClass} ${isActive ? 'bg-trust-50 text-trust-700' : ''}`}>
                <SquaresFour aria-hidden="true" size={17} /> Dashboard ({user?.firstName})
              </NavLink>
              <NavLink to="/disputes" className={({ isActive }) => `${mobileLinkClass} ${isActive ? 'bg-trust-50 text-trust-700' : ''}`}>
                <Scales aria-hidden="true" size={17} /> Disputes
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <SignOut aria-hidden="true" size={17} /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                to="/login"
                className="rounded-xl bg-slate-100 py-2.5 text-center font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-trust-600 py-2.5 text-center font-bold text-white shadow-cta transition hover:bg-trust-700"
              >
                Join GhanaTrust
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
