import axios from './axios';

export const serviceRequestAPI = {
  sell: {
    create: async (data) => {
      const response = await axios.post('/api/sell', data);
      return response.data;
    },
    getAll: async (params) => {
      const response = await axios.get('/api/sell', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axios.get(`/api/sell/${id}`);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axios.put(`/api/sell/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await axios.delete(`/api/sell/${id}`);
      return response.data;
    }
  },

  repair: {
    create: async (data) => {
      const response = await axios.post('/api/repair', data);
      return response.data;
    },
    getAll: async (params) => {
      const response = await axios.get('/api/repair', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axios.get(`/api/repair/${id}`);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axios.put(`/api/repair/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await axios.delete(`/api/repair/${id}`);
      return response.data;
    }
  },

  recycle: {
    create: async (data) => {
      const response = await axios.post('/api/recycle', data);
      return response.data;
    },
    getAll: async (params) => {
      const response = await axios.get('/api/recycle', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axios.get(`/api/recycle/${id}`);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axios.put(`/api/recycle/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await axios.delete(`/api/recycle/${id}`);
      return response.data;
    }
  },

  business: {
    create: async (data) => {
      const response = await axios.post('/api/business', data);
      return response.data;
    },
    getAll: async (params) => {
      const response = await axios.get('/api/business', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axios.get(`/api/business/${id}`);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axios.put(`/api/business/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await axios.delete(`/api/business/${id}`);
      return response.data;
    },
    getStats: async () => {
      const response = await axios.get('/api/business/stats');
      return response.data;
    }
  }
};

export default serviceRequestAPI;
