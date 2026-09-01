import api from './api';

export function sendCode(email, type) {
  return api.post('/auth/send-code', { email, type });
}

export function register(data) {
  return api.post('/auth/register', data);
}

export function login(data) {
  return api.post('/auth/login', data);
}

export function resetPassword(data) {
  return api.post('/auth/reset-password', data);
}

export function getMe() {
  return api.get('/auth/me');
}

export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
