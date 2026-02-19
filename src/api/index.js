import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  timeout: 30000,
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Customers
export const customerApi = {
  me: () => api.get('/customers/me'),
  search: (q) => api.get('/customers/search', { params: { q } }),
  get: (code) => api.get(`/customers/${code}`),
  getCreditDetail: (custCode) => api.get('/customers/getCustomerCreditDetail', { params: { cust_code: custCode } }),
};

// Transactions
export const transactionApi = {
  sales: (params) => api.get('/transactions/sales', { params }),
  saleDetail: (docNo) => api.get(`/transactions/sales/${docNo}/detail`),
  returns: (params) => api.get('/transactions/returns', { params }),
  returnDetail: (docNo) => api.get(`/transactions/returns/${docNo}/detail`),
};

// Points
export const pointApi = {
  movement: (params) => api.get('/points/movement', { params }),
  movementDetail: (docNo) => api.get(`/points/movement/${docNo}/detail`),
  add: (data) => api.post('/points/add', data),
  use: (data) => api.post('/points/use', data),
  cancelUse: (data) => api.post('/points/cancel-use', data),
  recalc: (data) => api.post('/points/recalc', data),
  processAll: () => api.post('/points/process-all'),
};

// Point Period Config
export const pointConfigApi = {
  list: () => api.get('/point-config'),
  create: (data) => api.post('/point-config', data),
  update: (id, data) => api.put(`/point-config/${id}`, data),
  remove: (id) => api.delete(`/point-config/${id}`),
};
