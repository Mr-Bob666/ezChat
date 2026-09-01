import { defineStore } from 'pinia';

export const useUsersStore = defineStore('users', {
  state: () => ({
    onlineUsers: [],
  }),

  getters: {
    onlineUsernames: (state) => state.onlineUsers.map((u) => u.username),
    isOnline: (state) => (userId) => state.onlineUsers.some((u) => u.userId === userId),
  },

  actions: {
    setOnline(users) {
      this.onlineUsers = users;
    },
    addOnline(user) {
      if (!this.onlineUsers.some((u) => u.userId === user.userId)) {
        this.onlineUsers.push(user);
      }
    },
    removeOnline(userId) {
      this.onlineUsers = this.onlineUsers.filter((u) => u.userId !== userId);
    },
  },
});
