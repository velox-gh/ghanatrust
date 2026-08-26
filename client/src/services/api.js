import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Service & Category endpoints
export const serviceAPI = {
  getCategories: () => api.get('/categories'),
  getServices: (params) => api.get('/services', { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  getLocations: () => api.get('/locations'),
};

// Provider endpoints
export const providerAPI = {
  getProviders: (params) => api.get('/providers', { params }),
  getProviderById: (id) => api.get(`/providers/${id}`),
  submitVerification: (data) => api.post('/providers/verifications', data),
  getMyVerifications: () => api.get('/providers/verifications/me'),
  addService: (data) => api.post('/providers/services', data),
  removeService: (id) => api.delete(`/providers/services/${id}`),
};

// Booking endpoints
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  completeBooking: (id) => api.patch(`/bookings/${id}/complete`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  createReview: (data) => api.post('/reviews', data),
};

// Admin endpoints
export const adminAPI = {
  getVerifications: () => api.get('/admin/verifications'),
  updateVerificationStatus: (id, data) => api.put(`/admin/verifications/${id}/status`, data),
};

export default api;