import axios from './axios';

const API_URL = '/api/upload';

export const uploadSingleImage = async (file, folder = 'images') => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_URL}/single?folder=${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const uploadMultipleImages = async (files, folder = 'images') => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await axios.post(`${API_URL}/multiple?folder=${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  // Return URLs array (backend now includes this)
  return {
    ...response.data,
    urls: response.data.urls || response.data.files?.map(file => file.url) || []
  };
};

export const deleteImage = async (imageUrl, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  
  const response = await axios.delete(`${API_URL}/delete`, {
    ...config,
    data: { imageUrl }
  });
  return response.data;
};

export const uploadAPI = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
};

// Default export for convenience
export default uploadAPI;