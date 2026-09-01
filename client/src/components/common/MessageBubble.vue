<template>
  <div class="message-bubble" :class="{ own: isOwn, recalled: isRecalled }">
    <div v-if="!isOwn" class="avatar-wrapper">
      <el-avatar :size="36" :src="message.sender?.avatar_url || undefined" class="msg-avatar">
        {{ message.sender?.username?.charAt(0).toUpperCase() }}
      </el-avatar>
    </div>
    <div class="msg-body">
      <div v-if="!isOwn" class="msg-header">
        <span class="msg-username">{{ message.sender?.username }}</span>
      </div>

      <!-- Recalled state -->
      <div v-if="isRecalled" class="msg-content recalled-content">
        <span class="recalled-text">{{ isOwn ? '你撤回了一条消息' : '该消息已被撤回' }}</span>
      </div>

      <!-- Normal content -->
      <template v-else>
        <div v-if="isImage" class="msg-content image-content" :class="{ own: isOwn }">
          <el-image
            :src="message.image_url"
            :preview-src-list="[message.image_url]"
            fit="cover"
            class="msg-image"
            :preview-teleported="true"
          />
          <div v-if="message.content" class="image-caption">{{ message.content }}</div>
        </div>
        <div v-else class="msg-content">{{ message.content }}</div>
      </template>

      <div class="msg-footer" :class="{ 'own-footer': isOwn }">
        <span class="msg-time">{{ formatTime(message.created_at) }}</span>
        <span
          v-if="canRecall && !isRecalled"
          class="recall-btn"
          @click="handleRecall"
        >撤回</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { getSocket } from '../../services/socket.js';

const RECALL_WINDOW_MS = 2 * 60 * 1000;

const props = defineProps({
  message: { type: Object, required: true },
  currentUserId: { type: Number, default: null },
  roomId: { type: Number, default: null },
});

const isOwn = computed(() => props.message.user_id === props.currentUserId);
const isImage = computed(() => props.message.type === 'image' && props.message.image_url);
const isRecalled = computed(() => props.message.is_recalled);

const canRecall = computed(() => {
  if (!isOwn.value || isRecalled.value) return false;
  const created = new Date(props.message.created_at).getTime();
  return Date.now() - created <= RECALL_WINDOW_MS;
});

function formatTime(time) {
  if (!time) return '';
  return dayjs(time).format('HH:mm');
}

function handleRecall() {
  const socket = getSocket();
  if (!socket?.connected) return;
  socket.emit('message:recall', {
    roomId: props.roomId,
    messageId: props.message.id,
  });
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  animation: msgIn .35s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
.message-bubble.own {
  flex-direction: row-reverse;
}
.avatar-wrapper { flex-shrink: 0; }
.msg-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep)) !important;
  color: #fff !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  box-shadow: 0 4px 10px rgba(64,158,255,.30);
}
.msg-body {
  max-width: 60%;
  display: flex;
  flex-direction: column;
}
.own .msg-body {
  align-items: flex-end;
}
.msg-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 5px;
}
.msg-username {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.msg-time {
  font-size: 11px;
  color: var(--muted);
  font-family: var(--font-mono);
}
.msg-content {
  padding: 10px 14px;
  border-radius: 4px 14px 14px 14px;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
  background: var(--bg-2);
  color: var(--ink-2);
  border: 1px solid var(--hair);
  transition: transform .2s ease;
}
.message-bubble:not(.own):hover .msg-content {
  transform: translateY(-1px);
}
.own .msg-content {
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  color: #fff;
  border: 1px solid transparent;
  border-radius: 14px 4px 14px 14px;
  box-shadow: 0 8px 18px rgba(64,158,255,.30);
}

/* Footer: time + recall button */
.msg-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  padding: 0 4px;
}
.own-footer {
  justify-content: flex-end;
}
.recall-btn {
  font-size: 11px;
  color: var(--muted);
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  transition: color .15s ease;
}
.recall-btn:hover {
  color: var(--brand);
}

/* Recalled state */
.recalled-content {
  background: transparent !important;
  border: 1px dashed var(--hair) !important;
  color: var(--muted) !important;
  font-style: italic;
  padding: 8px 12px;
  box-shadow: none !important;
}
.own .recalled-content {
  background: transparent !important;
  border: 1px dashed var(--hair) !important;
  color: var(--muted) !important;
  box-shadow: none !important;
}

/* Image message styles */
.image-content {
  padding: 4px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
.image-content.own {
  background: transparent !important;
}
.msg-image {
  max-width: 320px;
  max-height: 320px;
  border-radius: 12px;
  cursor: pointer;
  display: block;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(11,30,63,.10);
}
.msg-image :deep(.el-image__inner) { border-radius: 12px; }
.image-caption {
  font-size: 14px;
  line-height: 1.5;
  margin-top: 6px;
  padding: 0 8px 4px;
  word-break: break-word;
  color: var(--ink-2);
}
.own .image-caption {
  color: var(--ink);
}
</style>
