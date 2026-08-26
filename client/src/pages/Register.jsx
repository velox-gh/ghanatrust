import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { serviceAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'CUSTOMER',
    // Provider fields
    businessName: '',
    description: '',
    experienceYears: '',
    categoryId: '',
    serviceId: '',
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();

  // Load categories when provider role selected
  useEffect(() => {
    if (formData.role === 'PROVIDER' && categories.length === 0) {
      serviceAPI.getCategories()
        .then(res => setCategories(res.data.categories || []))
        .catch(() => {});
    }
  }, [formData.role]);

  // Load services when category changes
  useEffect(() => {
    if (formData.categoryId) {
      serviceAPI.getServices({ categoryId: formData.categoryId })
        .then(res => {
          setServices(res.data.services || []);
          setFormData(f => ({ ...f, serviceId: '' }));
        })
        .catch(() => {});
    } else {
      setServices([]);
    }
  }, [formData.categoryId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleToggle = (role) => {
    setFormData({ ...formData, role, categoryId: '', serviceId: '' });
    setServices([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'PROVIDER' && !formData.serviceId) {
      setError('Please select your main profession/service');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);
      if (result.success) {
        navigate('/dashboard');
        setTimeout(() => {
          startTour();
        }, 1000); // give it a sec to mount dashboard and navbar user menu
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const isProvider = formData.role === 'PROVIDER';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`w-full ${isProvider ? 'max-w-2xl' : 'max-w-md'} transition-all duration-300`}>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
              🛡️
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Your GhanaTrust Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Join Ghana's leading verified service marketplace
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl font-semibold mb-6">
              {error}
            </div>
          )}

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleToggle('CUSTOMER')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${!isProvider ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              🙋‍♂️ I Need a Service
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('PROVIDER')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${isProvider ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              🔧 I provide sevice
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Two-column layout for providers */}
            <div className={`grid gap-6 ${isProvider ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* --- LEFT COLUMN: Basic Info --- */}
              <div className="space-y-4">
                {isProvider && (
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Personal Information
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">FIRST NAME</label>
                    <input
                      type="text" name="firstName" required
                      placeholder="Kwame"
                      value={formData.firstName} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">LAST NAME</label>
                    <input
                      type="text" name="lastName" required
                      placeholder="Mensah"
                      value={formData.lastName} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email" name="email" required
                    placeholder="name@example.com"
                    value={formData.email} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">GHANA PHONE NUMBER</label>
                  <input
                    type="tel" name="phoneNumber"
                    placeholder="+233 24 123 4567"
                    value={formData.phoneNumber} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">PASSWORD</label>
                    <input
                      type="password" name="password" required
                      placeholder="••••••••"
                      value={formData.password} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">CONFIRM</label>
                    <input
                      type="password" name="confirmPassword" required
                      placeholder="••••••••"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN: Provider Profession Info --- */}
              {isProvider && (
                <div className="space-y-4">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Your Profession
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">BUSINESS / TRADE NAME</label>
                    <input
                      type="text" name="businessName"
                      placeholder="e.g. Mensah Electrical Works"
                      value={formData.businessName} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">SERVICE CATEGORY *</label>
                    <select
                      name="categoryId" required={isProvider}
                      value={formData.categoryId} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">Select a category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">YOUR MAIN PROFESSION *</label>
                    <select
                      name="serviceId" required={isProvider}
                      value={formData.serviceId} onChange={handleChange}
                      disabled={!formData.categoryId}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.categoryId ? 'Select your profession...' : 'Select a category first'}
                      </option>
                      {services.map(svc => (
                        <option key={svc.id} value={svc.id}>{svc.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">You can add more services later from your dashboard.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">YEARS OF EXPERIENCE</label>
                    <select
                      name="experienceYears"
                      value={formData.experienceYears} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">Select years...</option>
                      {[1,2,3,4,5,6,7,8,9,10,15,20].map(y => (
                        <option key={y} value={y}>{y}+ year{y > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">BRIEF PROFILE DESCRIPTION</label>
                    <textarea
                      name="description"
                      rows="3"
                      placeholder="Describe your skills and the type of work you do..."
                      value={formData.description} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Provider note */}
            {isProvider && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-medium">
                🛡️ After registration, complete your <strong>Identity Verification</strong> from the Provider Dashboard to unlock Level 2 Verified status and appear higher in search results.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : `Register as ${isProvider ? 'Artisan / Pro 🔧' : 'Customer 🛡️'}`}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;