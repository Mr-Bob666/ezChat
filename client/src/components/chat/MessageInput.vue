<template>
  <div class="message-input">
    <!-- Pending image previews -->
    <div v-if="pendingImages.length" class="preview-bar">
      <div v-for="img in pendingImages" :key="img.id" class="preview-item">
        <img :src="img.previewUrl" class="preview-thumb" />
        <div class="preview-remove" @click="removePendingImage(img.id)">&times;</div>
      </div>
    </div>

    <div class="input-row" :class="{ disabled: isMuted || sending }">
      <button
        class="icon-btn pic-btn"
        :disabled="isMuted || sending"
        title="发送图片"
        @click="triggerFileInput"
      >
        <el-icon><Picture /></el-icon>
      </button>
      <input
        v-model="text"
        class="text-input"
        :placeholder="inputPlaceholder"
        :disabled="isMuted || sending"
        @keydown.enter.exact.prevent="handleSend"
        @input="handleInput"
      />
      <button
        class="send-btn"
        :disabled="isMuted || !canSend || sending"
        title="发送"
        @click="handleSend"
      >
        <el-icon v-if="!sending"><Promotion /></el-icon>
        <el-icon v-else class="is-loading"><Loading /></el-icon>
      </button>
    </div>
    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple style="display: none" @change="handleFileChange" />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { Promotion, Picture, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRoomsStore } from '../../stores/rooms.js';
import { useAuthStore } from '../../stores/auth.js';
import { getSocket } from '../../services/socket.js';
import { uploadImage } from '../../services/upload.js';
import { compressImage } from '../../utils/compressImage.js';

const emit = defineEmits(['typing-start', 'typing-stop']);
const roomsStore = useRoomsStore();
const authStore = useAuthStore();
const text = ref('');
const fileInput = ref(null);
const sending = ref(false);

const { pendingImages, addPendingImages, removePendingImage, clearPendingImages } = inject('chatWindow');

const isMuted = computed(() => {
  const me = roomsStore.members.find(
    m => m.User?.id === authStore.user?.id || m.user_id === authStore.user?.id
  );
  return me?.is_muted || false;
});

const canSend = computed(() => text.value.trim() || pendingImages.length);

const inputPlaceholder = computed(() => {
  if (isMuted.value) return '你已被禁言';
  if (pendingImages.length) return '添加消息（可选），Enter 发送';
  return '输入消息，Enter 发送 · 拖拽图片发送';
});

function handleInput() {
  if (text.value.trim()) {
    emit('typing-start');
  }
}

async function handleSend() {
  const hasText = text.value.trim();
  const hasImages = pendingImages.length > 0;
  if (!hasText && !hasImages) return;

  const socket = getSocket();
  if (!socket?.connected) return;

  sending.value = true;
  try {
    // Send text message
    if (hasText) {
      socket.emit('message:send', {
        roomId: roomsStore.currentRoomId,
        content: text.value.trim(),
      });
      text.value = '';
    }

    // Send pending images
    if (hasImages) {
      const images = [...pendingImages];
      clearPendingImages();

      for (const img of images) {
        const compressed = await compressImage(img.file);

        const sock = getSocket();
        if (!sock?.connected) {
          ElMessage.error('连接已断开，部分图片未发送');
          break;
        }

        const imageUrl = await uploadImage(roomsStore.currentRoomId, compressed);

        sock.emit('message:send', {
          roomId: roomsStore.currentRoomId,
          content: '',
          type: 'image',
          imageUrl,
        });
      }
    }

    emit('typing-stop');
  } catch (err) {
    ElMessage.error(err.message || err.response?.data?.message || '发送失败');
  } finally {
    sending.value = false;
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileChange(e) {
  const files = [...(e.target.files || [])];
  e.target.value = '';
  if (files.length === 0) return;

  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    ElMessage.warning('仅支持图片文件');
    return;
  }

  addPendingImages(imageFiles);
}
</script>

<style scoped>
.message-input {
  padding: 16px 22px 18px;
  background: var(--bg);
  border-top: 1px solid var(--hair);
  position: relative;
}

/* Pill row */
.input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 48px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--bg-2);
  border: 1px solid var(--hair);
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.input-row:focus-within {
  background: #fff;
  border-color: rgba(64,158,255,.5);
  box-shadow: 0 0 0 4px rgba(64,158,255,.10);
}
.input-row.disabled {
  opacity: .6;
}

.text-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 6px;
  border: none;
  background: transparent;
  outline: none;
  color: var(--ink);
  font-size: 14px;
  font-family: var(--font-sans);
}
.text-input::placeholder {
  color: var(--muted);
}
.text-input:disabled {
  cursor: not-allowed;
}

.icon-btn {
  flex-shrink: 0;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--ink-3);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background .2s ease, color .2s ease;
}
.icon-btn :deep(.el-icon) { font-size: 17px; }
.icon-btn:hover:not(:disabled) {
  background: rgba(64,158,255,.12);
  color: var(--brand);
}
.icon-btn:disabled { cursor: not-allowed; }

.send-btn {
  flex-shrink: 0;
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(64,158,255,.40);
  transition: all .2s ease;
}
.send-btn :deep(.el-icon) { font-size: 16px; }
.send-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, var(--brand), var(--brand-lo));
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(64,158,255,.50);
}
.send-btn:disabled {
  background: var(--bg-3);
  color: var(--muted);
  box-shadow: none;
  cursor: not-allowed;
}
.send-btn .is-loading {
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Preview bar */
.preview-bar {
  display: flex;
  gap: 8px;
  padding-bottom: 12px;
  overflow-x: auto;
}
.preview-bar::-webkit-scrollbar { height: 4px; }
.preview-bar::-webkit-scrollbar-thumb {
  background: rgba(11,30,63,.12);
  border-radius: 2px;
}
.preview-item {
  position: relative;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--hair);
  box-shadow: 0 4px 10px rgba(11,30,63,.06);
  transition: transform .2s ease;
}
.preview-item:hover {
  transform: translateY(-2px);
  border-color: rgba(64,158,255,.4);
}
.preview-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(11,30,63,0.65);
  color: #fff;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background .15s;
}
.preview-remove:hover {
  background: rgba(245,108,108,0.9);
}
</style>
