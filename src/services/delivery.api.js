import { api, unwrap, unwrapWithMeta } from '@/lib/api';

export const authApi = {
  me: () => unwrap(api.get('/auth/me')).then((d) => d.user),
  login: (body) => unwrap(api.post('/auth/login', body)).then((d) => d.user),
  logout: () => api.post('/auth/logout'),
  refresh: () => unwrap(api.post('/auth/refresh')).then((d) => d.user),
  changePassword: (body) => api.post('/auth/change-password', body),
};

export const deliveryApi = {
  list: (tab, page = 1) => unwrapWithMeta(api.get('/delivery/orders', { params: { tab, page, limit: 20 } })),
  get: (orderId) => unwrap(api.get(`/delivery/orders/${orderId}`)),
  pickup: (orderId) => unwrap(api.post(`/delivery/orders/${orderId}/pickup`)),
  outForDelivery: (orderId) => unwrap(api.post(`/delivery/orders/${orderId}/out-for-delivery`)),
  deliver: (orderId, otp) => unwrap(api.post(`/delivery/orders/${orderId}/deliver`, { otp })),
  fail: (orderId, reason) => unwrap(api.post(`/delivery/orders/${orderId}/fail`, { reason })),
  summary: (date) => unwrap(api.get('/delivery/summary', { params: { date } })),
};
