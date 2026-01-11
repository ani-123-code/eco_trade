import axios from './axios';

export const materialAPI = {
  getAll: async (params = {}) => {
    const response = await axios.get('/api/materials', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/materials/${id}`);
    return response.data;
  },

  getSellerMaterials: async (params = {}) => {
    const response = await axios.get('/api/materials/seller', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/api/materials', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/api/materials/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/api/materials/${id}`);
    return response.data;
  },

  verify: async (id) => {
    const response = await axios.put(`/api/materials/${id}/verify`);
    return response.data;
  }
};

