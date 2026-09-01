import { ref, computed, watch, onUnmounted } from 'vue';
import { useMessagesStore } from '../stores/messages.js';
import { getSocket } from '../services/socket.js';

export function useMessages(roomId) {
  const messagesStore = useMessagesStore();
  const typingUsers = ref([]);
  const socket = getSocket();

  const messages = computed(() => messagesStore.messages[roomId.value] || []);

  function loadMore(beforeId) {
    return messagesStore.fetchMessages(roomId.value, beforeId);
  }

  function sendMessage(content) {
    if (!socket) return;
    socket.emit('message:send', { roomId: roomId.value, content });
  }

  // Socket event handlers
  function onNewMessage(message) {
    if (message.roomId === roomId.value) {
      messagesStore.addMessage(roomId.value, message);
    }
  }

  function onTypingUpdate({ roomId: rId, userId, username, isTyping }) {
    if (rId !== roomId.value) return;
    if (isTyping) {
      if (!typingUsers.value.some((u) => u.userId === userId)) {
        typingUsers.value.push({ userId, username });
      }
    } else {
      typingUsers.value = typingUsers.value.filter((u) => u.userId !== userId);
    }
  }

  if (socket) {
    socket.on('message:new', onNewMessage);
    socket.on('typing:update', onTypingUpdate);
  }

  onUnmounted(() => {
    if (socket) {
      socket.off('message:new', onNewMessage);
      socket.off('typing:update', onTypingUpdate);
    }
  });

  return { messages, loadMore, sendMessage, typingUsers };
}
