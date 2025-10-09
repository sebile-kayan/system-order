import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Backend hazır olduğunda aktif edilecek
const API_BASE_URL = 'http://localhost:3001/api';
// const API_BASE_URL = 'https://your-production-api.com/api';

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token süresi dolmuş, logout yap
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('auth');
    }
    return Promise.reject(error);
  }
);

// API fonksiyonları
export const api = {
  // Auth
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('auth');
    } catch (error) {
      // Hata olsa bile local storage'ı temizle
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('auth');
    }
  },

  async getProfile() {
    return apiClient.get('/auth/me');
  },

  // Orders
  async getOrders(filters = {}) {
    return apiClient.get('/staff/orders', { params: filters });
  },

  async getOrder(orderId) {
    return apiClient.get(`/staff/orders/${orderId}`);
  },

  async updateOrderStatus(orderId, status, notes = '') {
    return apiClient.put(`/staff/orders/${orderId}/status`, { status, notes });
  },

  // Tables
  async getTables() {
    return apiClient.get('/staff/tables');
  },

  async updateTableStatus(tableId, status) {
    return apiClient.put(`/staff/tables/${tableId}/status`, { status });
  },

  async markTableClean(tableId) {
    return apiClient.put(`/staff/tables/${tableId}/clean`);
  },

  // Menu (Admin)
  async getMenuItems() {
    return apiClient.get('/staff/menu');
  },

  async createMenuItem(itemData) {
    return apiClient.post('/staff/menu', itemData);
  },

  async updateMenuItem(itemId, itemData) {
    return apiClient.put(`/staff/menu/${itemId}`, itemData);
  },

  async deleteMenuItem(itemId) {
    return apiClient.delete(`/staff/menu/${itemId}`);
  },

  // Users (Admin)
  async getUsers() {
    return apiClient.get('/staff/users');
  },

  async createUser(userData) {
    return apiClient.post('/staff/users', userData);
  },

  async updateUser(userId, userData) {
    return apiClient.put(`/staff/users/${userId}`, userData);
  },

  async deleteUser(userId) {
    return apiClient.delete(`/staff/users/${userId}`);
  },

  // Payments
  async getPendingPayments() {
    return apiClient.get('/staff/payments/pending');
  },

  async processPayment(paymentData) {
    return apiClient.post('/staff/payments', paymentData);
  },

  async getDailyReport(date) {
    return apiClient.get('/staff/reports/daily', { params: { date } });
  },

  // Notifications
  async getNotifications() {
    return apiClient.get('/staff/notifications');
  },

  async markNotificationRead(notificationId) {
    return apiClient.put(`/staff/notifications/${notificationId}/read`);
  },

  async markAllNotificationsRead() {
    return apiClient.put('/staff/notifications/read-all');
  },

  // Business Settings (Admin)
  async getBusinessSettings() {
    return apiClient.get('/staff/business/settings');
  },

  async updateBusinessSettings(settings) {
    return apiClient.put('/staff/business/settings', settings);
  },

  // QR Codes (Admin)
  async generateQRCode(tableId) {
    return apiClient.post(`/staff/tables/${tableId}/qr`);
  },

  async getQRCode(tableId) {
    return apiClient.get(`/staff/tables/${tableId}/qr`);
  },
};
