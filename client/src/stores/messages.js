import { defineStore } from 'pinia';
import { getMessages } from '../services/rooms.js';

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    messages: {},
    loading: false,
  }),

  actions: {
    async fetchMessages(roomId, before = null) {
      this.loading = true;
      try {
        const params = { limit: 50 };
        if (before) params.before = before;
        const { data } = await getMessages(roomId, params);
        if (before) {
          // Prepend older messages
          this.messages[roomId] = [...data.messages, ...(this.messages[roomId] || [])];
        } else {
          this.messages[roomId] = data.messages;
        }
        return data.messages;
      } finally {
        this.loading = false;
      }
    },

    addMessage(roomId, message) {
      if (!this.messages[roomId]) {
        this.messages[roomId] = [];
      }
      this.messages[roomId].push(message);
    },

    recallMessage(roomId, messageId) {
      const list = this.messages[roomId];
      if (!list) return;
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        msg.is_recalled = true;
      }
    },

    clearRoom(roomId) {
      delete this.messages[roomId];
    },
  },
});
