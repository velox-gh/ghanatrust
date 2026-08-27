import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Ghana Trust Badge */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition transform">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Ghana<span className="text-emerald-600">Trust</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/50">
                  Velox 🇬🇭
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                Verified Service Marketplace
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 tour-home"
            >
              <span>🛡️</span> Home
            </Link>
            <Link
              to="/services"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 tour-find-services"
            >
              <span>🔍</span> Find Services
            </Link>
            <button
              onClick={() => {
                if (window.location.pathname !== '/') {
                  navigate('/');
                  setTimeout(startTour, 500); // Wait for navigation
                } else {
                  startTour();
                }
              }}
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5 tour-how-it-works"
            >
              <span>ℹ️</span> How Trust Works
            </button>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-4 py-2.5 rounded-xl border border-slate-200 transition tour-dashboard"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/disputes"
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-4 py-2.5 rounded-xl border border-slate-200 transition"
                >
                  <span>⚖️ Disputes</span>
                </Link>

                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-900">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    🚪
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5 tour-join"
                >
                  Join GhanaTrust
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 focus:outline-none"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-semibold py-2"
          >
            🔍 Find Services
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 font-semibold py-2"
              >
                📊 Dashboard ({user?.firstName})
              </Link>
              <Link
                to="/disputes"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 font-semibold py-2"
              >
                ⚖️ Disputes
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-rose-600 font-semibold py-2"
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 font-bold text-white bg-emerald-600 rounded-xl"
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