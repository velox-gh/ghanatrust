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
};

// Booking endpoints
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings'),
};

export default api;