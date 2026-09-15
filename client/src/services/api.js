import axios from 'axios';

const apiUrl =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const cleanApiUrl = apiUrl.replace(/\/+$/, '');

const baseURL = cleanApiUrl.endsWith('/api')
  ? cleanApiUrl
  : `${cleanApiUrl}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;