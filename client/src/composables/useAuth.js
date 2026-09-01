import { useAuthStore } from '../stores/auth.js';
import { storeToRefs } from 'pinia';

export function useAuth() {
  const authStore = useAuthStore();
  const { user, isAuthenticated, username } = storeToRefs(authStore);

  return {
    user,
    isAuthenticated,
    username,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    fetchMe: authStore.fetchMe,
  };
}
