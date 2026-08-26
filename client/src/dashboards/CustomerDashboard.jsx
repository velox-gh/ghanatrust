import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';

const STATUS_CONFIG = {
  REQUESTED:   { label: 'Requested',   cls: 'bg-amber-100 text-amber-800 border-amber-300',      icon: '🟡' },
  ACCEPTED:    { label: 'Accepted',    cls: 'bg-blue-100 text-blue-800 border-blue-300',          icon: '🔵' },
  SCHEDULED:   { label: 'Scheduled',   cls: 'bg-indigo-100 text-indigo-800 border-indigo-300',   icon: '📅' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-orange-100 text-orange-800 border-orange-300',   icon: '🔧' },
  COMPLETED:   { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✅' },
  PAID:        { label: 'Paid',        cls: 'bg-green-100 text-green-800 border-green-300',       icon: '💰' },
  REVIEWED:    { label: 'Reviewed',    cls: 'bg-purple-100 text-purple-800 border-purple-300',    icon: '⭐' },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-800 border-red-300',             icon: '❌' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200', icon: '●' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }

  const pending   = bookings.filter(b => b.status === 'REQUESTED').length;
  const active    = bookings.filter(b => ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(b.status)).length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const reviews   = bookings.filter(b => b.review).length;

  // Most recent 4 bookings for the dashboard panel
  const recentBookings = bookings.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Welcome Banner ───────────────────────────────────────────────── */}
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
            className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            Find a Service Pro
          </Link>
        </div>
      </div>

      {/* ── Action Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/services"
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            🔍
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Find Service</h3>
          <p className="text-sm text-slate-500">Browse verified professionals</p>
        </Link>

        <Link
          to="/my-bookings"
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            📅
          </div>
          <h3 className="font-bold text-slate-800 mb-1">My Bookings</h3>
          <p className="text-sm text-slate-500">View and manage appointments</p>
        </Link>

        <Link
          to="/payments"
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-300 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            💳
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Payments</h3>
          <p className="text-sm text-slate-500">Transaction history</p>
        </Link>
      </div>

      {/* ── Live Stats Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            🟡
          </div>
          <div>
            <h3 className="text-xs text-gray-500 font-medium">Pending</h3>
            <p className="text-2xl font-black text-amber-600">{pending}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            🔧
          </div>
          <div>
            <h3 className="text-xs text-gray-500 font-medium">Active Jobs</h3>
            <p className="text-2xl font-black text-blue-600">{active}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            ✅
          </div>
          <div>
            <h3 className="text-xs text-gray-500 font-medium">Completed</h3>
            <p className="text-2xl font-black text-emerald-600">{completed}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            ⭐
          </div>
          <div>
            <h3 className="text-xs text-gray-500 font-medium">Reviews Given</h3>
            <p className="text-2xl font-black text-purple-600">{reviews}</p>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Recent Bookings Panel (2/3 width) ─────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
              <Link
                to="/my-bookings"
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View All →
              </Link>
            </div>

            <div className="p-6">
              {loadingBookings ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl block mb-3">📅</span>
                  <h3 className="font-bold text-slate-700 mb-1">No Bookings Yet</h3>
                  <p className="text-xs text-slate-500 mb-4">Browse verified professionals and request your first job.</p>
                  <Link
                    to="/services"
                    className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map(b => (
                    <Link
                      key={b.id}
                      to={`/my-bookings/${b.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700 truncate">
                            {b.service?.name}
                          </span>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>
                            👤 {b.provider?.user?.firstName} {b.provider?.user?.lastName}
                          </span>
                          <span>
                            🗓️{' '}
                            {b.scheduledDate
                              ? new Date(b.scheduledDate).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })
                              : 'TBD'}
                          </span>
                          {b.price && (
                            <span className="text-emerald-700 font-bold">GH₵ {b.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-blue-500 text-sm ml-3">→</span>
                    </Link>
                  ))}

                  {bookings.length > 4 && (
                    <Link
                      to="/my-bookings"
                      className="block text-center text-sm text-blue-600 hover:underline font-semibold pt-2"
                    >
                      View {bookings.length - 4} more bookings →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar (1/3 width) ────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Account Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400 block text-xs uppercase font-semibold">Full Name</span>
                <span className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase font-semibold">Email</span>
                <span className="font-semibold text-gray-800 break-all">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase font-semibold">Phone</span>
                <span className="font-semibold text-gray-800">{user?.phoneNumber || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase font-semibold">Account Type</span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                to="/services"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
              >
                <span className="text-xl">🔍</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">Browse Services</h3>
                  <p className="text-xs text-gray-500">Electrical, Plumbing, AC & more</p>
                </div>
              </Link>

              <Link
                to="/my-bookings"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
              >
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">All Bookings</h3>
                  <p className="text-xs text-gray-500">Track all your service requests</p>
                </div>
                {(pending + active) > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {pending + active}
                  </span>
                )}
              </Link>

              <Link
                to="/my-bookings?filter=COMPLETED"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition group"
              >
                <span className="text-xl">⭐</span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-600">Leave Reviews</h3>
                  <p className="text-xs text-gray-500">Rate your completed jobs</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
