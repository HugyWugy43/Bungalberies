import axios from 'axios';

const apiRoot = process.env.REACT_APP_API_URL;
const baseURL = apiRoot ? `${apiRoot.replace(/\/+$/, '')}/api` : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default api;
