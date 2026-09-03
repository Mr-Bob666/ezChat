import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router/index.js';

const api = axios.create({
  baseURL: '/api/admin',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || '请求失败';
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      router.push('/login');
    }
    ElMessage.error(message);
    return Promise.reject(error);
  },
);

export default api;
