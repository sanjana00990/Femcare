// import axios from 'axios';

// // When deployed to Vercel, the backend will be available at /api
// // When running locally with Vite, it will connect to localhost:5000
// const api = axios.create({
//   baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:5001/api',
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;
import axios from 'axios';

const api = axios.create({
  // In dev: Vite proxies /api → localhost:5001 (no CORS issues)
  // In prod: VITE_API_URL already ends in /api (e.g. https://femcareidt.vercel.app/api)
  baseURL: import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || '/api')
    : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;