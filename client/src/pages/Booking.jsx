import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get('service');
  const providerId = queryParams.get('provider');

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledEndDate: '',
    description: '',
    address: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    if (serviceId && providerId) {
      fetchBookingDetails();
    } else {
      setError('Missing service or provider information');
      setLoading(false);
    }
  }, [serviceId, providerId, isAuthenticated]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const [serviceRes, providerRes] = await Promise.all([
        api.get(`/services/${serviceId}`),
        api.get(`/providers/${providerId}`)
      ]);
      setService(serviceRes.data.service);
      setProvider(providerRes.data.provider);
      setError('');
    } catch (err) {
      setError('Failed to load booking details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const bookingData = {
        serviceId: parseInt(serviceId),
        providerId: parseInt(providerId),
        ...formData,
      };

      const response = await api.post('/bookings', bookingData);
      
      // Redirect to booking confirmation or dashboard
      navigate(`/my-bookings/${response.data.booking.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading booking details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl">{error}</p>
          <button
            onClick={() => navigate('/services')}
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book a Service</h1>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Service:</span> {service?.name}</p>
            <p><span className="font-medium">Provider:</span> {provider?.user?.firstName} {provider?.user?.lastName}</p>
            {provider?.businessName && (
              <p><span className="font-medium">Business:</span> {provider.businessName}</p>
            )}
            {provider?.trustScore > 0 && (
              <p><span className="font-medium">Trust Score:</span> ⭐ {provider.trustScore.toFixed(1)}/5.0</p>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Your Service</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date *
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred End Date
              </label>
              <input
                type="datetime-local"
                name="scheduledEndDate"
                value={formData.scheduledEndDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Optional - for multi-day jobs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location / Address *
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address or location"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe the job in detail..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {submitting ? 'Booking...' : 'Book Now'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Booking;