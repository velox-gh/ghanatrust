import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                🛡️
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Ghana<span className="text-emerald-500">Trust</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ghana's premier trust-first service marketplace connecting households and businesses with identity-verified, skilled local artisans & professionals.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                <span>🇬🇭</span> Verified Local Professionals
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Services
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/services" className="hover:text-emerald-400 transition">Electrical & Solar Systems</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Plumbing & Borehole Repair</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Air Conditioning & Fridge Repair</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Carpentry & Roofing</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Painting & Wall Finishes</Link></li>
            </ul>
          </div>

          {/* Supported Regions */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Ghana Service Regions
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2"><span>📍</span> Ashanti Region (Kumasi, Obuasi)</li>
              <li className="flex items-center gap-2"><span>📍</span> Greater Accra (Accra, Tema)</li>
              <li className="flex items-center gap-2"><span>📍</span> Western Region (Takoradi)</li>
              <li className="flex items-center gap-2"><span>📍</span> Central Region (Cape Coast)</li>
              <li className="flex items-center gap-2"><span>📍</span> Northern Region (Tamale)</li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              The Trust Standard
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span>🟢</span> Level 1 Ghana Card ID Verified
                </div>
                <p className="text-xs text-slate-400">Government identity validation before job dispatch.</p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <span>⭐</span> Verified Review History
                </div>
                <p className="text-xs text-slate-400">Only real customers after completed jobs can review.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} GhanaTrust Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Trust & Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;