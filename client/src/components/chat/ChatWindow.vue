<template>
  <div
    class="chat-window"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <MessageList />
    <TypingIndicator :typing-users="typingUsers" />
    <MessageInput @typing-start="onTypingStart" @typing-stop="onTypingStop" />

    <!-- Drag overlay -->
    <Transition name="fade">
      <div v-if="dragActive" class="drag-overlay">
        <div class="drag-overlay-content">
          <el-icon :size="48"><UploadFilled /></el-icon>
          <p>松开添加图片</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, provide } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { useRoomsStore } from '../../stores/rooms.js';
import { useMessagesStore } from '../../stores/messages.js';
import { getSocket } from '../../services/socket.js';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import TypingIndicator from './TypingIndicator.vue';

const roomsStore = useRoomsStore();
const messagesStore = useMessagesStore();
const typingUsers = ref([]);
const dragActive = ref(false);
let dragCounter = 0;

// Pending images: [{ id, file, previewUrl }]
const pendingImages = reactive([]);

let typingTimer = null;

function onNewMessage(message) {
  messagesStore.addMessage(message.roomId, message);
}

function onUserOnline(user) {
  // Also update member list's is_online in real-time
  const member = roomsStore.members.find(m => m.User?.id === user.userId || m.user_id === user.userId);
  if (member?.User) {
    member.User.is_online = true;
  }
}

function onUserOffline({ userId }) {
  // Also update member list's is_online in real-time
  const member = roomsStore.members.find(m => m.User?.id === userId || m.user_id === userId);
  if (member?.User) {
    member.User.is_online = false;
  }
}

function onTypingUpdate({ roomId, userId, username, isTyping }) {
  if (roomId !== roomsStore.currentRoomId) return;
  if (isTyping) {
    if (!typingUsers.value.some((u) => u.userId === userId)) {
      typingUsers.value.push({ userId, username });
    }
  } else {
    typingUsers.value = typingUsers.value.filter((u) => u.userId !== userId);
  }
}

function onSocketError({ message }) {
  ElMessage.warning(message || '连接错误');
}

function onMessageRecalled({ roomId, messageId }) {
  messagesStore.recallMessage(roomId, messageId);
}

function onTypingStart() {
  const socket = getSocket();
  if (!socket || !roomsStore.currentRoomId) return;
  socket.emit('typing:start', { roomId: roomsStore.currentRoomId });
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    onTypingStop();
  }, 3000);
}

function onTypingStop() {
  const socket = getSocket();
  if (!socket || !roomsStore.currentRoomId) return;
  socket.emit('typing:stop', { roomId: roomsStore.currentRoomId });
  clearTimeout(typingTimer);
}

// ─── Drag & drop → add to pending ──────────────────

function onDragOver() {
  dragCounter++;
  dragActive.value = true;
}

function onDragLeave() {
  dragCounter--;
  if (dragCounter <= 0) {
    dragActive.value = false;
    dragCounter = 0;
  }
}

function onDrop(e) {
  dragActive.value = false;
  dragCounter = 0;

  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const imageFiles = [...files].filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    ElMessage.warning('仅支持图片文件');
    return;
  }

  addPendingImages(imageFiles);
}

function addPendingImages(files) {
  for (const file of files) {
    const previewUrl = URL.createObjectURL(file);
    pendingImages.push({ id: Date.now() + Math.random(), file, previewUrl });
  }
}

function removePendingImage(id) {
  const idx = pendingImages.findIndex((img) => img.id === id);
  if (idx !== -1) {
    URL.revokeObjectURL(pendingImages[idx].previewUrl);
    pendingImages.splice(idx, 1);
  }
}

function clearPendingImages() {
  for (const img of pendingImages) {
    URL.revokeObjectURL(img.previewUrl);
  }
  pendingImages.splice(0);
}

// Provide to child MessageInput
provide('chatWindow', { pendingImages, addPendingImages, removePendingImage, clearPendingImages });

// Clear pending when switching rooms
watch(() => roomsStore.currentRoomId, () => {
  clearPendingImages();
});

// ─── Room lifecycle ─────────────────────────────

watch(() => roomsStore.currentRoomId, async (newId, oldId) => {
  const socket = getSocket();
  if (!socket) return;

  if (oldId) {
    socket.emit('room:leave', { roomId: oldId });
    messagesStore.clearRoom(oldId);
  }

  if (newId) {
    typingUsers.value = [];
    await messagesStore.fetchMessages(newId);
    socket.emit('room:join', { roomId: newId });
  }
});

onMounted(async () => {
  const socket = getSocket();
  if (!socket) return;

  socket.on('message:new', onNewMessage);
  socket.on('message:recalled', onMessageRecalled);
  socket.on('user:online', onUserOnline);
  socket.on('user:offline', onUserOffline);
  socket.on('typing:update', onTypingUpdate);
  socket.on('error', onSocketError);

  if (roomsStore.currentRoomId) {
    await messagesStore.fetchMessages(roomsStore.currentRoomId);
    socket.emit('room:join', { roomId: roomsStore.currentRoomId });
  }
});

onUnmounted(() => {
  const socket = getSocket();
  if (!socket) return;
  socket.off('message:new', onNewMessage);
  socket.off('message:recalled', onMessageRecalled);
  socket.off('user:online', onUserOnline);
  socket.off('user:offline', onUserOffline);
  socket.off('typing:update', onTypingUpdate);
  socket.off('error', onSocketError);
  clearTimeout(typingTimer);
  clearPendingImages();
});
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  min-width: 0;
  position: relative;
  background: var(--bg);
  overflow: hidden;
}

/* Drag overlay */
.drag-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: rgba(64, 158, 255, 0.10);
  border: 2px dashed var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  backdrop-filter: blur(4px);
}
.drag-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: var(--brand);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.drag-overlay-content :deep(.el-icon) {
  color: var(--brand);
  filter: drop-shadow(0 8px 18px rgba(64,158,255,.35));
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
