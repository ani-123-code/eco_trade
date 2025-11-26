import axios from './axios';

const API_URL = '/api/products';

export const getProducts = async (params) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};

export const getCollections = async () => {
  const response = await axios.get(`${API_URL}/collections`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createProduct = async (productData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  
  const formattedData = {
    ...productData,
    specifications: productData.specifications || {}
  };
  
  const response = await axios.post(API_URL, formattedData, config);
  return response.data;
};

export const updateProduct = async (id, productData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  
  const formattedData = {
    ...productData,
    specifications: productData.specifications || {}
  };
  
  const response = await axios.put(`${API_URL}/${id}`, formattedData, config);
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

export const getTypes = async () => {
  const response = await axios.get(`${API_URL}/types`);
  return response.data.map(type => ({ ...type, id: type._id }));
};

export const createType = async (typeData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.post(`${API_URL}/types`, typeData, config);
  return response.data;
};

export const updateType = async (id, typeData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.put(`${API_URL}/types/${id}`, typeData, config);
  return response.data;
};

export const deleteType = async (id, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.delete(`${API_URL}/types/${id}`, config);
  return response.data;
};

export const rateProduct = async (productId, ratingData, isAuthenticated = false) => {
  const endpoint = isAuthenticated ? 'rate-authenticated' : 'rate';
  const response = await axios.post(`${API_URL}/${productId}/${endpoint}`, ratingData);
  return response.data;
};

export const rateProductAuthenticated = async (productId, ratingData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.post(`${API_URL}/${productId}/rate-authenticated`, ratingData, config);
  return response.data;
};

export const getBestSellers = async () => {
  const response = await axios.get(`${API_URL}/best-sellers`);
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await axios.get(`${API_URL}/featured`);
  return response.data;
};

export const getNewArrivals = async () => {
  const response = await axios.get(`${API_URL}/new-arrivals`);
  return response.data;
};

export const productAPI = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  rateProduct,
  rateProductAuthenticated,
  deleteProduct,
  getTypes,
  createType,
  getCollections,
  updateType,
  deleteType,
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals
};