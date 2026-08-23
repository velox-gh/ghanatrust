import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center">
        <span className="text-5xl block mb-4">🛡️</span>
        <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested page doesn't exist or has been moved within GhanaTrust.
        </p>
        <Link
          to="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;