import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Customer Portal
            </span>
            <h1 className="text-3xl font-bold mt-2">
              Akwaaba, {user?.firstName} {user?.lastName}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Find verified, trusted local artisans & service professionals across Ghana.
            </p>
          </div>
          <Link
            to="/services"
            className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition transform hover:-translate-y-0.5"
          >
            Find a Service Pro
          </Link>
        </div>
      </div>

      {/* Quick Stats & Trust Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            🛡️
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Trust Guarantee</h3>
            <p className="text-lg font-bold text-gray-900">Level 1 Verified</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
            📋
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Bookings</h3>
            <p className="text-lg font-bold text-gray-900">0 Pending</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-bold">
            ⭐
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Reviews Written</h3>
            <p className="text-lg font-bold text-gray-900">0 Reviews</p>
          </div>
        </div>
      </div>

      {/* Account Info & Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            Account Profile
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400 block text-xs">FULL NAME</span>
              <span className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">EMAIL ADDRESS</span>
              <span className="font-semibold text-gray-800">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">PHONE NUMBER</span>
              <span className="font-semibold text-gray-800">{user?.phoneNumber || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">ACCOUNT ROLE</span>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/services"
              className="p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
            >
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600">Browse Categories</h3>
              <p className="text-xs text-gray-500 mt-1">Electrical, Plumbing, AC Repair, Carpentry & more.</p>
            </Link>

            <Link
              to="/my-bookings"
              className="p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
            >
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600">My Bookings</h3>
              <p className="text-xs text-gray-500 mt-1">Track requested, scheduled, and completed jobs.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
