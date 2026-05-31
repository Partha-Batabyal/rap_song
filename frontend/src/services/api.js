import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor to inject JWT token in Authorization headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Custom helper endpoints for easy client usage
export const authService = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
  checkStatus: () => API.get('/status'),
};

export const songService = {
  getAll: (params = {}) => API.get('/songs', { params }),
  getById: (id) => API.get(`/songs/${id}`),
  create: (songData) => API.post('/songs', songData),
  update: (id, songData) => API.put(`/songs/${id}`, songData),
  delete: (id) => API.delete(`/songs/${id}`),
  duplicate: (id) => API.post(`/songs/${id}/duplicate`),
};

export default API;
