import axios from './axios';

export const auctionAPI = {
  getAll: async (params = {}) => {
    const response = await axios.get('/api/auctions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/auctions/${id}`);
    return response.data;
  },

  getBidHistory: async (id) => {
    const response = await axios.get(`/api/auctions/${id}/bids`);
    return response.data;
  },

  placeBid: async (id, amount) => {
    const response = await axios.post(`/api/auctions/${id}/bid`, { amount });
    return response.data;
  },

  endAuction: async (id) => {
    const response = await axios.put(`/api/auctions/${id}/end`);
    return response.data;
  },

  getMyBids: async () => {
    const response = await axios.get('/api/auctions/my-bids');
    return response.data;
  },

  getClosedBids: async () => {
    const response = await axios.get('/api/auctions/closed-bids');
    return response.data;
  },

  getSellerAuctions: async () => {
    const response = await axios.get('/api/auctions/seller-auctions');
    return response.data;
  },

  acceptBidSeller: async (id) => {
    const response = await axios.put(`/api/auctions/${id}/accept-bid-seller`);
    return response.data;
  },

  deleteBidSeller: async (auctionId, bidId) => {
    const response = await axios.delete(`/api/auctions/${auctionId}/bids/${bidId}`);
    return response.data;
  },
  getUpcoming: async (params = {}) => {
    const response = await axios.get('/api/auctions/upcoming', { params });
    return response.data;
  },
  getAnalytics: async (auctionId = null) => {
    const params = {};
    if (auctionId) {
      params.auctionId = auctionId;
    }
    const response = await axios.get('/api/auctions/analytics', { params });
    return response.data;
  }
};

