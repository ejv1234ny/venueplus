import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => apiClient.post('/api/auth/register', data),
  login: (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Users API
export const usersAPI = {
  getMe: () => apiClient.get('/api/users/me'),
  getUser: (userId: number) => apiClient.get(`/api/users/${userId}`),
  updateMe: (data: any) => apiClient.put('/api/users/me', data),
};

// Venues API
export const venuesAPI = {
  create: (data: any) => apiClient.post('/api/venues/', data),
  search: (params?: any) => apiClient.get('/api/venues/', { params }),
  getById: (venueId: number) => apiClient.get(`/api/venues/${venueId}`),
  update: (venueId: number, data: any) => apiClient.put(`/api/venues/${venueId}`, data),
  delete: (venueId: number) => apiClient.delete(`/api/venues/${venueId}`),
  getMy: () => apiClient.get('/api/venues/my/venues'),
  addRequirement: (venueId: number, data: any) => 
    apiClient.post(`/api/venues/${venueId}/requirements`, data),
  getRequirements: (venueId: number) => 
    apiClient.get(`/api/venues/${venueId}/requirements`),
  deleteRequirement: (venueId: number, requirementId: number) =>
    apiClient.delete(`/api/venues/${venueId}/requirements/${requirementId}`),
  photoSuggestions: (query: string) =>
    apiClient.get('/api/venues/photo-suggestions', { params: { query } }),
};

// Services API
export const servicesAPI = {
  create: (data: any) => apiClient.post('/api/services/', data),
  search: (params?: any) => apiClient.get('/api/services/', { params }),
  getById: (serviceId: number) => apiClient.get(`/api/services/${serviceId}`),
  update: (serviceId: number, data: any) => apiClient.put(`/api/services/${serviceId}`, data),
  delete: (serviceId: number) => apiClient.delete(`/api/services/${serviceId}`),
  getMy: () => apiClient.get('/api/services/my/services'),
  getCategories: () => apiClient.get('/api/services/categories/list'),
};

// Events API
export const eventsAPI = {
  create: (data: any) => apiClient.post('/api/events/', data),
  getMy: () => apiClient.get('/api/events/'),
  getById: (eventId: number) => apiClient.get(`/api/events/${eventId}`),
  update: (eventId: number, data: any) => apiClient.put(`/api/events/${eventId}`, data),
  delete: (eventId: number) => apiClient.delete(`/api/events/${eventId}`),
};

// Bookings API
export const bookingsAPI = {
  create: (data: any) => apiClient.post('/api/bookings/', data),
  getMy: () => apiClient.get('/api/bookings/'),
  getHost: () => apiClient.get('/api/bookings/host'),
  getById: (id: number) => apiClient.get(`/api/bookings/${id}`),
  confirm: (id: number) => apiClient.post(`/api/bookings/${id}/confirm`),
  cancel: (id: number) => apiClient.post(`/api/bookings/${id}/cancel`),
  complete: (id: number) => apiClient.post(`/api/bookings/${id}/complete`),
  // Back-compat shims — provider job offers now live under matching API
  getMyJobs: () => apiClient.get('/api/matching/my-offers'),
  acceptJob: (offerId: number) => apiClient.post(`/api/matching/offers/${offerId}/accept`),
  declineJob: (offerId: number) => apiClient.post(`/api/matching/offers/${offerId}/decline`),
};

// Auth extras
export const authExtras = {
  me: () => apiClient.get('/api/auth/me'),
  verifyEmail: (token: string) => apiClient.post('/api/auth/verify-email', { token }),
  resendVerification: () => apiClient.post('/api/auth/resend-verification'),
  forgotPassword: (email: string) => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) =>
    apiClient.post('/api/auth/reset-password', { token, new_password }),
};

// Search API
export const searchAPI = {
  venues: (params: any) => apiClient.get('/api/search/venues', { params }),
  providers: (params: any) => apiClient.get('/api/search/providers', { params }),
  cities: () => apiClient.get('/api/search/cities'),
};

// Uploads API
export const uploadsAPI = {
  upload: (file: File, kind: string, venue_id?: number, provider_id?: number) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    if (venue_id) fd.append('venue_id', String(venue_id));
    if (provider_id) fd.append('provider_id', String(provider_id));
    return apiClient.post('/api/uploads/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => apiClient.delete(`/api/uploads/${id}`),
};

// Matching API
export const matchingAPI = {
  runForBooking: (bookingId: number) => apiClient.post(`/api/matching/run/${bookingId}`),
  myOffers: () => apiClient.get('/api/matching/my-offers'),
  accept: (offerId: number) => apiClient.post(`/api/matching/offers/${offerId}/accept`),
  decline: (offerId: number) => apiClient.post(`/api/matching/offers/${offerId}/decline`),
};

// Messages API
export const messagesAPI = {
  conversations: () => apiClient.get('/api/messages/conversations'),
  getConversation: (id: number) => apiClient.get(`/api/messages/conversations/${id}`),
  sendToBooking: (bookingId: number, body: string) =>
    apiClient.post(`/api/messages/booking/${bookingId}`, { body }),
  sendToConversation: (id: number, body: string) =>
    apiClient.post(`/api/messages/conversations/${id}/send`, { body }),
};

// Reviews API
export const reviewsAPI = {
  create: (data: any) => apiClient.post('/api/reviews/', data),
  forVenue: (venueId: number) => apiClient.get(`/api/reviews/venue/${venueId}`),
  forProvider: (providerId: number) => apiClient.get(`/api/reviews/provider/${providerId}`),
};

// Notifications API
export const notificationsAPI = {
  list: (unread_only = false) =>
    apiClient.get('/api/notifications/', { params: { unread_only } }),
  unreadCount: () => apiClient.get('/api/notifications/unread-count'),
  markRead: (id: number) => apiClient.post(`/api/notifications/${id}/read`),
  markAllRead: () => apiClient.post('/api/notifications/read-all'),
};

// Provider onboarding + claim
export const providersAPI = {
  onboardStart: (data: any) => apiClient.post('/api/providers/onboarding/start', data),
  onboardArea: (id: number, data: any) =>
    apiClient.post(`/api/providers/onboarding/${id}/area`, data),
  onboardPricing: (id: number, data: any) =>
    apiClient.post(`/api/providers/onboarding/${id}/pricing`, data),
  onboardAvailability: (id: number, data: any) =>
    apiClient.post(`/api/providers/onboarding/${id}/availability`, data),
  onboardPublish: (id: number) => apiClient.post(`/api/providers/onboarding/${id}/publish`),
  addBlackout: (id: number, data: any) => apiClient.post(`/api/providers/${id}/blackouts`, data),
  claimRequest: (data: any) => apiClient.post('/api/providers/claim/request', data),
  claimConfirm: (token: string, new_password: string) =>
    apiClient.post('/api/providers/claim/confirm', { token, new_password }),
};

// Payments API
export const paymentsAPI = {
  onboardingLink: () => apiClient.post('/api/payments/onboarding-link'),
  accountStatus: () => apiClient.get('/api/payments/account-status'),
  breakdown: (bookingId: number) => apiClient.get(`/api/payments/breakdown/${bookingId}`),
  checkout: (bookingId: number) => apiClient.post(`/api/payments/checkout/${bookingId}`),
  simConfirm: (bookingId: number) => apiClient.post(`/api/payments/sim-confirm/${bookingId}`),
  capture: (bookingId: number) => apiClient.post(`/api/payments/capture/${bookingId}`),
  refund: (bookingId: number, refund_pct = 100) =>
    apiClient.post(`/api/payments/refund/${bookingId}`, null, { params: { refund_pct } }),
  releasePayouts: (bookingId: number) =>
    apiClient.post(`/api/payments/release-payouts/${bookingId}`),
  myPayouts: () => apiClient.get('/api/payments/my/payouts'),
  myPayments: () => apiClient.get('/api/payments/my/payments'),
};

// Creator Events API ("influencer plugin" — ticketed gatherings)
export const creatorEventsAPI = {
  // Creator dashboard / management
  mine: () => apiClient.get('/api/creator-events/mine'),
  create: (data: any) => apiClient.post('/api/creator-events/', data),
  get: (id: number) => apiClient.get(`/api/creator-events/${id}`),
  update: (id: number, data: any) => apiClient.put(`/api/creator-events/${id}`, data),
  setTiers: (id: number, tiers: any[]) =>
    apiClient.post(`/api/creator-events/${id}/tiers`, tiers),
  holdDeposit: (id: number) => apiClient.post(`/api/creator-events/${id}/deposit/hold`),
  publish: (id: number) => apiClient.post(`/api/creator-events/${id}/publish`),
  cancel: (id: number) => apiClient.post(`/api/creator-events/${id}/cancel`),
  settle: (id: number) => apiClient.post(`/api/creator-events/${id}/settle`),
  attendees: (id: number) => apiClient.get(`/api/creator-events/${id}/attendees`),
  checkIn: (ticketId: number) =>
    apiClient.post(`/api/creator-events/tickets/${ticketId}/check-in`),
  // Public page + buyer
  public: (slug: string) => apiClient.get(`/api/creator-events/public/${slug}`),
  purchase: (slug: string, tier_id: number, quantity: number) =>
    apiClient.post(`/api/creator-events/public/${slug}/purchase`, { tier_id, quantity }),
  confirmTicket: (ticketId: number) =>
    apiClient.post(`/api/creator-events/tickets/${ticketId}/confirm`),
};

// Admin API
export const adminAPI = {
  stats: () => apiClient.get('/api/admin/stats'),
  users: (params: any) => apiClient.get('/api/admin/users', { params }),
  suspendUser: (id: number) => apiClient.post(`/api/admin/users/${id}/suspend`),
  reactivateUser: (id: number) => apiClient.post(`/api/admin/users/${id}/reactivate`),
  bookings: (params: any) => apiClient.get('/api/admin/bookings', { params }),
  forceStatus: (id: number, status: string) =>
    apiClient.post(`/api/admin/bookings/${id}/force-status/${status}`),
  flaggedMessages: () => apiClient.get('/api/admin/flagged-messages'),
  auditLog: () => apiClient.get('/api/admin/audit-log'),
  payments: (params: any = {}) => apiClient.get('/api/admin/payments', { params }),
  payment: (id: number) => apiClient.get(`/api/admin/payments/${id}`),
  payouts: (params: any = {}) => apiClient.get('/api/admin/payouts', { params }),
  manualRefund: (paymentId: number, refund_pct = 100) =>
    apiClient.post(`/api/admin/payments/${paymentId}/manual-refund`, null, { params: { refund_pct } }),
  retryPayout: (payoutId: number) =>
    apiClient.post(`/api/admin/payouts/${payoutId}/retry`),
};

// Agent control plane (admin only)
export const agentsAPI = {
  runGoal: (goal: string, city?: string) =>
    apiClient.post('/api/agents/goals', { goal, city: city || null }),
  runs: () => apiClient.get('/api/agents/runs'),
  run: (id: number) => apiClient.get(`/api/agents/runs/${id}`),
  escalations: () => apiClient.get('/api/agents/escalations'),
  approve: (id: number) => apiClient.post(`/api/agents/escalations/${id}/approve`),
  reject: (id: number) => apiClient.post(`/api/agents/escalations/${id}/reject`),
  kill: (enabled: boolean) => apiClient.post('/api/agents/kill', { enabled }),
};

// Admin Mission Control dashboard (admin only)
export const dashboardAPI = {
  metrics: () => apiClient.get('/api/admin/dashboard/metrics'),
  agentsStatus: () => apiClient.get('/api/admin/dashboard/agents/status'),
  escalations: (status: 'open' | 'all' = 'open') =>
    apiClient.get('/api/admin/dashboard/escalations', { params: { status } }),
  timeseries: (metric: 'bookings' | 'gmv' | 'new_venues' | 'new_providers', days = 30) =>
    apiClient.get('/api/admin/dashboard/timeseries', { params: { metric, days } }),
};
