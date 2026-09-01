import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, getMe, uploadAvatar as uploadAvatarApi } from '../services/auth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    username: (state) => state.user?.username || '',
    avatarUrl: (state) => state.user?.avatar_url || '',
  },

  actions: {
    async login(email, password) {
      const { data } = await loginApi({ email, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    },

    async register(username, email, password, code) {
      const { data } = await registerApi({ username, email, password, code });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    },

    async fetchMe() {
      const { data } = await getMe();
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
    },

    async updateAvatar(file) {
      const { data } = await uploadAvatarApi(file);
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
