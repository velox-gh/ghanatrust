import axios from 'axios';

// Same-origin by default: vite proxies /api to the backend, so localhost, LAN
// devices and ngrok tunnels all reach the right API without env changes.
// Set VITE_API_URL only to point every client at one fixed server.
const rawApiUrl = import.meta.env.VITE_API_URL || window.location.origin;
const API_URL = rawApiUrl.replace(/\/+$/, '') + '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    // Bypass ngrok's browser warning interstitial page
    'ngrok-skip-browser-warning': 'true',
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
  verifyEmail: (token) => api.get('/auth/verify-email', { params: { token } }),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
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
  getMyStats: () => api.get('/providers/me/stats'),
  addService: (data) => api.post('/providers/services', data),
  removeService: (id) => api.delete(`/providers/services/${id}`),
};

// Booking endpoints
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  agreePrice: (id, price) => api.patch(`/bookings/${id}/agree-price`, { price }),
  completeBooking: (id) => api.patch(`/bookings/${id}/complete`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  getMessages: (id) => api.get(`/bookings/${id}/messages`),
  sendMessage: (id, content) => api.post(`/bookings/${id}/messages`, { content }),
  createReview: (data) => api.post('/reviews', data),
};

// Payment endpoints (Paystack)
export const paymentAPI = {
  initializePayment: (bookingId) => api.post('/payments/initialize', { bookingId }),
  verifyPayment: (reference) => api.get(`/payments/verify/${reference}`),
  getTransactionHistory: () => api.get('/payments/history'),
};

// Subscription endpoints (Pro/Featured plans via Paystack)
export const subscriptionAPI = {
  initializeSubscription: (plan) => api.post('/subscriptions/initialize', { plan }),
  verifySubscription: (reference) => api.get(`/subscriptions/verify/${reference}`),
  getMySubscriptions: () => api.get('/subscriptions/me'),
};

// Admin endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getProviders: (params) => api.get('/admin/providers', { params }),
  updateProvider: (id, data) => api.put(`/admin/providers/${id}`, data),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  adminCancelBooking: (id, reason) => api.patch(`/admin/bookings/${id}/cancel`, { reason }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  refundPayment: (id, reason) => api.patch(`/admin/payments/${id}/refund`, { reason }),
  getDisputes: (params) => api.get('/admin/disputes', { params }),
  getVerifications: () => api.get('/admin/verifications'),
  updateVerificationStatus: (id, data) => api.put(`/admin/verifications/${id}/status`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

// Dispute endpoints
export const disputeAPI = {
  createDispute: (data) => api.post('/disputes', data),
  getDisputes: () => api.get('/disputes'),
  getDisputeById: (id) => api.get(`/disputes/${id}`),
  uploadEvidence: (id, data) => api.post(`/disputes/${id}/evidence`, data),
  investigateDispute: (id, data) => api.patch(`/disputes/${id}/investigate`, data),
  resolveDispute: (id, data) => api.patch(`/disputes/${id}/resolve`, data),
};

// Saved providers (customer bookmarks)
export const savedAPI = {
  list: () => api.get('/users/saved-providers'),
  save: (providerId) => api.post(`/users/saved-providers/${providerId}`),
  unsave: (providerId) => api.delete(`/users/saved-providers/${providerId}`),
  savedIds: (providerIds) => api.get('/users/saved-providers/ids', { params: { providerIds: providerIds.join(',') } }),
};

// Notifications
export const notificationAPI = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export default api;