const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const buildUrl = (path = '') => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const textPayload = await response.text();
  let data;
  try {
    data = textPayload ? JSON.parse(textPayload) : null;
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.detail || `Falha ao chamar ${path}`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
};

export const fetchOrders = () => request('/orders');

export const createOrder = (payload) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchDeliverers = () => request('/deliverers');

export const createDeliverer = (payload) =>
  request('/deliverers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const assignOrder = (orderId, delivererId) =>
  request(`/orders/${orderId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ deliverer_id: delivererId }),
  });

export const postTrackingPoint = (orderId, point) =>
  request(`/orders/${orderId}/track`, {
    method: 'POST',
    body: JSON.stringify(point),
  });

export const updateOrderStatus = (orderId, payload) =>
  request(`/orders/${orderId}/status`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const registerProofOfDelivery = (orderId, payload) =>
  request(`/orders/${orderId}/proof`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchDashboardSummary = () => request('/orders/dashboard');

export const fetchUsers = () => request('/users');

export const createUser = (payload) =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
