import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
              🛡️
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to GhanaTrust
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Access your trust dashboard or manage service bookings
            </p>
          </div>

          {/* Quick Demo Credentials Help */}
          <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl mb-6 text-xs text-emerald-900">
            <span className="font-bold block mb-1">🔑 Quick Demo Accounts:</span>
            <div className="space-y-1 text-[11px]">
              <div><strong>Admin:</strong> admin@ghanatrust.com | Password123!</div>
              <div><strong>Provider:</strong> kwame@ghanatrust.com | Password123!</div>
              <div><strong>Customer:</strong> customer@ghanatrust.com | Password123!</div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl font-semibold mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="e.g. kwame@ghanatrust.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In 🛡️'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;