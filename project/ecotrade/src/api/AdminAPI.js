import axios from './axios';

const API_URL = '/api/admin';

// Get dashboard stats
const getDashboardStats = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/dashboard`, config);
  return response.data;
};

// Get all users
const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

export const adminAPI = {
  getDashboardStats,
  getUsers
};