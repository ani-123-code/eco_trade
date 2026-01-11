import axios from './axios';

export const rfqAPI = {
  create: async (data) => {
    const response = await axios.post('/api/rfqs', data);
    return response.data;
  },

  getByMaterial: async (materialId) => {
    const response = await axios.get(`/api/rfqs/material/${materialId}`);
    return response.data;
  },

  getMyRFQs: async (params = {}) => {
    const response = await axios.get('/api/rfqs/my-rfqs', { params });
    return response.data;
  },

  getSellerRFQs: async (params = {}) => {
    const response = await axios.get('/api/rfqs/my-listings', { params });
    return response.data;
  },

  respond: async (id, data) => {
    const response = await axios.put(`/api/rfqs/${id}/respond`, data);
    return response.data;
  },

  accept: async (id) => {
    const response = await axios.put(`/api/rfqs/${id}/accept`);
    return response.data;
  },

  reject: async (id) => {
    const response = await axios.put(`/api/rfqs/${id}/reject`);
    return response.data;
  }
};

