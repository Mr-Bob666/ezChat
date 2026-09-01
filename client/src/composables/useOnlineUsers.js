import { computed } from 'vue';
import { useUsersStore } from '../stores/users.js';

export function useOnlineUsers() {
  const usersStore = useUsersStore();
  const onlineUsers = computed(() => usersStore.onlineUsers);
  const isOnline = (userId) => usersStore.isOnline(userId);

  return { onlineUsers, isOnline };
}
