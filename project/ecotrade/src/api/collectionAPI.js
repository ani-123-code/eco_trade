import axios from './axios';

const API_URL = '/api/collections';

export const getCollections = async (params) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};

export const getCollectionsGrouped = async () => {
  const response = await axios.get(`${API_URL}/grouped`);
  return response.data;
};

export const getCollectionById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const getCollectionBySlug = async (slug) => {
  const response = await axios.get(`${API_URL}/slug/${slug}`);
  return response.data;
};

export const createCollection = async (collectionData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.post(API_URL, collectionData, config);
  return response.data;
};

export const updateCollection = async (id, collectionData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.put(`${API_URL}/${id}`, collectionData, config);
  return response.data;
};

export const deleteCollection = async (id, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

export const reorderCollections = async (collections, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const response = await axios.post(`${API_URL}/reorder`, { collections }, config);
  return response.data;
};

export const collectionAPI = {
  getCollections,
  getCollectionsGrouped,
  getCollectionById,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections
};
