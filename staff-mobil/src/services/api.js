// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Basit API fonksiyonları
export const api = {
  // Auth
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  // Orders
  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    return response.json();
  },

  async updateOrderStatus(orderId, status) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  // Tables
  async getTables() {
    const response = await fetch(`${API_BASE_URL}/tables`);
    return response.json();
  },

  // Menu
  async getMenuItems() {
    const response = await fetch(`${API_BASE_URL}/menu/items`);
    return response.json();
  },

  // Notifications
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`);
    return response.json();
  },
};
