import axios from './axios';

export const notificationAPI = {
  getAll: async (params = {}) => {
    const response = await axios.get('/api/notifications', { params });
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await axios.put(`/api/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await axios.put('/api/notifications/read-all');
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`/api/notifications/${id}`);
    return response.data;
  }
};

