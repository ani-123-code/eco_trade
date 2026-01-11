import axios from './axios';

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await axios.get('/api/admin/dashboard');
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get('/api/admin/users');
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axios.put(`/api/admin/users/${id}`, data);
    return response.data;
  },

  warnUser: async (id, message) => {
    const response = await axios.post(`/api/admin/users/${id}/warn`, { message });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  getPendingVerifications: async (params = {}) => {
    const response = await axios.get('/api/admin/verifications', { params });
    return response.data;
  },

  verifyUser: async (id) => {
    const response = await axios.put(`/api/admin/verifications/${id}/approve`);
    return response.data;
  },

  rejectUser: async (id, reason) => {
    const response = await axios.put(`/api/admin/verifications/${id}/reject`, { reason });
    return response.data;
  },

  getAllMaterials: async (params = {}) => {
    const response = await axios.get('/api/admin/materials', { params });
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await axios.delete(`/api/admin/materials/${id}`);
    return response.data;
  },

  getAllAuctions: async (params = {}) => {
    const response = await axios.get('/api/admin/auctions', { params });
    return response.data;
  },

  getPendingAuctionRequests: async (params = {}) => {
    const response = await axios.get('/api/admin/auctions/pending', { params });
    return response.data;
  },

  approveScheduledAuction: async (id) => {
    const response = await axios.put(`/api/admin/auctions/${id}/approve-scheduled`);
    return response.data;
  },

  rejectAuctionRequest: async (id, reason = '') => {
    const response = await axios.put(`/api/admin/auctions/${id}/reject-request`, { reason });
    return response.data;
  },

  acceptBid: async (id) => {
    const response = await axios.put(`/api/admin/auctions/${id}/accept-bid`);
    return response.data;
  },

  closeAuction: async (id) => {
    const response = await axios.put(`/api/admin/auctions/${id}/close`);
    return response.data;
  },

  getAllRFQs: async (params = {}) => {
    const response = await axios.get('/api/admin/rfqs', { params });
    return response.data;
  },

  approveRFQ: async (id) => {
    const response = await axios.put(`/api/admin/rfqs/${id}/approve`);
    return response.data;
  },

  rejectRFQ: async (id, reason) => {
    const response = await axios.put(`/api/admin/rfqs/${id}/reject`, { reason });
    return response.data;
  },

  updateRFQStatus: async (id, data) => {
    const response = await axios.put(`/api/admin/rfqs/${id}/status`, data);
    return response.data;
  },

  createBid: async (auctionId, bidderId, amount, timestamp, status) => {
    const response = await axios.post(`/api/admin/auctions/${auctionId}/bids`, { 
      bidderId, 
      amount,
      timestamp,
      status
    });
    return response.data;
  },

  updateBid: async (bidId, data) => {
    const response = await axios.put(`/api/admin/bids/${bidId}`, data);
    return response.data;
  },

  deleteBid: async (bidId) => {
    const response = await axios.delete(`/api/admin/bids/${bidId}`);
    return response.data;
  },

  deleteAuction: async (auctionId) => {
    const response = await axios.delete(`/api/admin/auctions/${auctionId}`);
    return response.data;
  },

  createAuction: async (auctionData) => {
    const response = await axios.post('/api/admin/auctions/create', auctionData);
    return response.data;
  },

  markTokenReceived: async (auctionId) => {
    const response = await axios.put(`/api/admin/auctions/${auctionId}/token-payment`);
    return response.data;
  }
};
