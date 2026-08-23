import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              System Administration
            </span>
            <h1 className="text-3xl font-bold mt-2">
              GhanaTrust Admin Control Panel ⚙️
            </h1>
            <p className="text-gray-300 mt-1">
              Logged in as {user?.email} ({user?.firstName} {user?.lastName})
            </p>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Users</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">3 Active</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Customer, Provider, Admin</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Verification Queue</span>
          <p className="text-3xl font-bold text-amber-600 mt-1">1 Pending</p>
          <span className="text-xs text-gray-500 mt-1 block">ID & Skills review</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Service Categories</span>
          <p className="text-3xl font-bold text-gray-900 mt-1">6 Active</p>
          <span className="text-xs text-blue-600 font-semibold mt-1 block">Electrical, Plumbing, etc.</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Dispute System</span>
          <p className="text-3xl font-bold text-emerald-600 mt-1">0 Open</p>
          <span className="text-xs text-gray-500 mt-1 block">All clear</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
