
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, SealCheck, Star } from '@phosphor-icons/react';
import { TrustLevelDots } from './ui/TrustBadge';

const Footer = () => {
  return (
    <footer className="border-t border-navy-800 bg-navy-900 pb-12 pt-16 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trust-600 text-white shadow-cta">
                <ShieldCheck weight="duotone" size={24} aria-hidden="true" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Ghana<span className="text-trust-400">Trust</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Ghana's premier trust-first service marketplace connecting households and businesses with
              identity-verified, skilled local artisans &amp; professionals.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-trust-700/50 bg-trust-900/50 px-3 py-1 text-xs font-semibold text-trust-300">
                <TrustLevelDots identity skills track size={12} />
                Verified Local Professionals
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Explore Services</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/services" className="transition hover:text-trust-400">Electrical &amp; Solar Systems</Link></li>
              <li><Link to="/services" className="transition hover:text-trust-400">Plumbing &amp; Borehole Repair</Link></li>
              <li><Link to="/services" className="transition hover:text-trust-400">Air Conditioning &amp; Fridge Repair</Link></li>
              <li><Link to="/services" className="transition hover:text-trust-400">Carpentry &amp; Roofing</Link></li>
              <li><Link to="/services" className="transition hover:text-trust-400">Painting &amp; Wall Finishes</Link></li>
            </ul>
          </div>

          {/* Supported Regions */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Ghana Service Regions</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2"><MapPin aria-hidden="true" size={14} className="shrink-0 text-trust-500" /> Ashanti Region (Kumasi, Obuasi)</li>
              <li className="flex items-center gap-2"><MapPin aria-hidden="true" size={14} className="shrink-0 text-trust-500" /> Greater Accra (Accra, Tema)</li>
              <li className="flex items-center gap-2"><MapPin aria-hidden="true" size={14} className="shrink-0 text-trust-500" /> Western Region (Takoradi)</li>
              <li className="flex items-center gap-2"><MapPin aria-hidden="true" size={14} className="shrink-0 text-trust-500" /> Central Region (Cape Coast)</li>
              <li className="flex items-center gap-2"><MapPin aria-hidden="true" size={14} className="shrink-0 text-trust-500" /> Northern Region (Tamale)</li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">The Trust Standard</h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-navy-700/60 bg-navy-800/80 p-3.5">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-trust-400">
                  <SealCheck aria-hidden="true" weight="fill" size={14} /> Level 1 Ghana Card ID Verified
                </div>
                <p className="text-xs text-slate-400">Government identity validation before job dispatch.</p>
              </div>

              <div className="rounded-xl border border-navy-700/60 bg-navy-800/80 p-3.5">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gold-400">
                  <Star aria-hidden="true" weight="fill" size={14} /> Verified Review History
                </div>
                <p className="text-xs text-slate-400">Only real customers after completed jobs can review.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-navy-800 pt-8 text-xs text-slate-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} GhanaTrust Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/" className="transition hover:text-slate-300">Privacy Policy</Link>
            <Link to="/" className="transition hover:text-slate-300">Terms of Service</Link>
            <Link to="/" className="transition hover:text-slate-300">Trust &amp; Safety Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
