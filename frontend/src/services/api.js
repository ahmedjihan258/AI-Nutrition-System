import axios from 'axios';

// Backend URL - modify if deployed elsewhere, otherwise standard local FastAPI port
const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Authentication
  login: async (email, password) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await apiClient.post('/register', { name, email, password });
    return response.data;
  },

  // Dashboard Summary
  getDashboard: async (userId) => {
    const response = await apiClient.get(`/dashboard/${userId}`);
    return response.data;
  },

  // Food Logging
  logFood: async (userId, foodName) => {
    const response = await apiClient.post('/food', {
      user_id: parseInt(userId, 10),
      food_name: foodName,
    });
    return response.data;
  },

  // Meal NLP Text Analysis
  logFoodText: async (userId, text) => {
    const response = await apiClient.post('/food/text', {
      user_id: parseInt(userId, 10),
      text: text,
    });
    return response.data;
  },

  // Food Image Analysis (Uses Form Data)
  logFoodImage: async (userId, file) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', file);

    const response = await apiClient.post('/food/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Recommendations
  getRecommendations: async (userId) => {
    const response = await apiClient.get(`/recommendation/${userId}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (userId) => {
    const response = await apiClient.get(`/analytics/${userId}`);
    return response.data;
  },

  // History (Bonus to see all logs)
  getHistory: async (userId) => {
    const response = await apiClient.get(`/food/history/${userId}`);
    return response.data;
  },

  // Profile (Phase 6)
  getProfile: async (userId) => {
    const response = await apiClient.get(`/food/profile/${userId}`);
    return response.data;
  }
};

export default apiClient;
