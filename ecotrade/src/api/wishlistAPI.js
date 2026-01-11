import axios from './axios';

export const wishlistAPI = {
  getWishlist: async () => {
    const response = await axios.get('/api/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await axios.post('/api/wishlist/add', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await axios.delete(`/api/wishlist/${productId}`);
    return response.data;
  },

  toggleWishlist: async (productId) => {
    const response = await axios.post('/api/wishlist/toggle', { productId });
    return response.data;
  }
};
