import axios from 'axios';

const useApi = () => {
  const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
  });

  // Add a request interceptor to include the token in headers
  instance.interceptors.request.use(
    (config) => {
      // Check if localStorage is available (for Nuxt SSR)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useApi; 