import axios from './axios';

const API_URL = '/api';

// Newsletter subscription
export const subscribeNewsletter = async (emailData) => {
  console.log("Sending newsletter subscribe data:", emailData);
  const { data } = await axios.post(`${API_URL}/newsletter/subscribe`, emailData);
  return data;
};

// Contact form submission
export const submitContactForm = async (contactData) => {
  const response = await axios.post(`${API_URL}/contact/submit`, contactData);
  return response.data;
};

// Get newsletter subscribers (admin only)
export const getSubscribers = async () => {
  const response = await axios.get(`${API_URL}/newsletter/subscribers`);
  return response.data;
};

// Get contact submissions (admin only)
export const getContactSubmissions = async () => {
  const response = await axios.get(`${API_URL}/contact/submissions`);
  return response.data;
};

export const updateContactSubmission = async (id, updateData) => {
  const response = await axios.put(`${API_URL}/contact/${id}`, updateData);
  return response.data;
};

// Delete contact submission
export const deleteContactSubmission = async (id) => {
  const response = await axios.delete(`${API_URL}/contact/${id}`);
  return response.data;
};

export const newsletterContactAPI = {
  subscribeNewsletter,
  submitContactForm,
  getSubscribers,
  getContactSubmissions,
  updateContactSubmission,
  deleteContactSubmission
};