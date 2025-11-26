import axios from './axios';

const stockNotificationAPI = {
  requestNotification: async (productId, email, phone, notificationChannels) => {
    const response = await axios.post('/api/stock-notifications/request', {
      productId,
      email,
      phone,
      notificationChannels
    });
    return response.data;
  },
  // Admin
  getAll: async (params) => {
    const response = await axios.get('/api/stock-notifications', { params });
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/api/stock-notifications/${id}`);
    return response.data;
  },
  markNotified: async (id) => {
    const response = await axios.patch(`/api/stock-notifications/${id}/mark-notified`);
    return response.data;
  }
};

export default stockNotificationAPI;
