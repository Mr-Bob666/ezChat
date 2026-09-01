<template>
  <div class="message-list" ref="listRef" @scroll="handleScroll">
    <div v-if="hasMore" class="load-more" @click="loadMore">
      <span v-if="!loadingMore">加载更早的消息</span>
      <span v-else>加载中...</span>
    </div>
    <template v-for="(msg, index) in currentMessages" :key="msg.id">
      <DateSeparator
        v-if="showDateSeparator(index)"
        :date="formatDate(msg.created_at)"
      />
      <MessageBubble
        :message="msg"
        :current-user-id="authStore.user?.id"
        :room-id="roomsStore.currentRoomId"
      />
    </template>
    <div v-if="currentMessages.length === 0 && !messagesStore.loading" class="no-messages">
      暂无消息，开始聊天吧
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useRoomsStore } from '../../stores/rooms.js';
import { useMessagesStore } from '../../stores/messages.js';
import { useAuthStore } from '../../stores/auth.js';
import MessageBubble from '../common/MessageBubble.vue';
import DateSeparator from './DateSeparator.vue';

const roomsStore = useRoomsStore();
const messagesStore = useMessagesStore();
const authStore = useAuthStore();
const listRef = ref(null);
const loadingMore = ref(false);

const currentMessages = computed(() => messagesStore.messages[roomsStore.currentRoomId] || []);
const hasMore = computed(() => {
  const msgs = currentMessages.value;
  return msgs.length > 0 && msgs.length >= 50;
});

function formatDate(time) {
  if (!time) return '';
  return dayjs(time).format('YYYY年MM月DD日');
}

function showDateSeparator(index) {
  if (index === 0) return true;
  const current = dayjs(currentMessages.value[index].created_at).startOf('day');
  const prev = dayjs(currentMessages.value[index - 1].created_at).startOf('day');
  return !current.isSame(prev, 'day');
}

async function loadMore() {
  if (loadingMore.value) return;
  const msgs = currentMessages.value;
  if (msgs.length === 0) return;

  loadingMore.value = true;
  const prevScrollHeight = listRef.value?.scrollHeight || 0;

  try {
    await messagesStore.fetchMessages(roomsStore.currentRoomId, msgs[0].id);
    await nextTick();
    // Keep scroll position stable after prepending messages
    if (listRef.value) {
      const newScrollHeight = listRef.value.scrollHeight;
      listRef.value.scrollTop = newScrollHeight - prevScrollHeight;
    }
  } finally {
    loadingMore.value = false;
  }
}

function handleScroll() {
  if (!listRef.value) return;
  if (listRef.value.scrollTop < 50 && hasMore.value && !loadingMore.value) {
    loadMore();
  }
}

// Auto-scroll to bottom on new messages
let isNearBottom = true;
watch(currentMessages, async () => {
  // Check if user is near bottom before adding message
  if (listRef.value) {
    const { scrollTop, scrollHeight, clientHeight } = listRef.value;
    isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
  }

  await nextTick();
  if (isNearBottom) {
    scrollToBottom();
  }
}, { deep: true });

function scrollToBottom() {
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight;
  }
}

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background:
    radial-gradient(circle at 100% 0%, rgba(64,158,255,.05), transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(108,180,255,.04), transparent 50%),
    var(--bg);
}
.message-list::-webkit-scrollbar { width: 8px; }
.message-list::-webkit-scrollbar-thumb {
  background: rgba(11,30,63,.10);
  border-radius: 4px;
}
.message-list::-webkit-scrollbar-thumb:hover {
  background: rgba(11,30,63,.18);
}
.load-more {
  text-align: center;
  padding: 10px;
  margin: 0 auto 8px;
  color: var(--brand);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .04em;
  cursor: pointer;
  border-radius: 999px;
  background: rgba(64,158,255,.08);
  border: 1px solid rgba(64,158,255,.18);
  max-width: 220px;
  transition: all .2s ease;
}
.load-more:hover {
  background: rgba(64,158,255,.14);
  transform: translateY(-1px);
}
.no-messages {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
}
</style>
