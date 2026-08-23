import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">🟡 REQUESTED</span>;
      case 'ACCEPTED':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-300">🔵 ACCEPTED</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">🟢 COMPLETED</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          My Bookings & Service Requests
        </h1>
        <p className="text-sm text-slate-600 mb-8">
          Track requested jobs, provider acceptance, and service completion history.
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="text-4xl block mb-3">📅</span>
            <h3 className="text-lg font-bold text-slate-800">No Bookings Yet</h3>
            <p className="text-xs text-slate-500 mt-1">Browse verified service providers to request your first job.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{b.service?.name}</h3>
                    {getStatusBadge(b.status)}
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{b.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>👤 Pro: {b.provider?.user?.firstName} {b.provider?.user?.lastName}</span>
                    <span>🗓️ Scheduled: {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                  </div>
                </div>

                <div className="text-right border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto">
                  <span className="text-xs text-slate-400 font-bold uppercase block">Rate</span>
                  <span className="text-lg font-black text-emerald-600">GH₵ {b.price || 80.00}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;