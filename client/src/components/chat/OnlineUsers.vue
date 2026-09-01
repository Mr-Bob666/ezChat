<template>
  <div class="online-users">
    <div class="online-header">在线用户 ({{ onlineUsers.length }})</div>
    <div class="online-list">
      <div v-for="user in onlineUsers" :key="user.userId" class="online-item">
        <div class="online-avatar">
          <img v-if="user.avatar_url" :src="user.avatar_url" class="online-avatar-img" />
          <span v-else class="online-avatar-letter">{{ user.username?.charAt(0)?.toUpperCase() }}</span>
          <span class="online-dot"></span>
        </div>
        <span class="online-name">{{ user.username }}</span>
        <button
          v-if="user.userId !== currentUserId"
          class="call-icon-btn"
          title="语音通话"
          @click="$emit('call-user', user)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z"/></svg>
        </button>
      </div>
      <div v-if="onlineUsers.length === 0" class="online-empty">暂无在线用户</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  onlineUsers: { type: Array, default: () => [] },
  currentUserId: { type: Number, default: null },
});
defineEmits(['call-user']);
</script>

<style scoped>
.online-users {
  width: 200px;
  background: var(--bg-white);
  border-left: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.online-header {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-light);
}
.online-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.online-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 14px;
}
.online-item:hover .call-icon-btn {
  opacity: 1;
}
.online-avatar {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.online-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.online-avatar-letter {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.online-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  border: 2px solid var(--bg-white);
  flex-shrink: 0;
}
.online-name {
  color: var(--text-regular);
}
.call-icon-btn {
  opacity: 0;
  margin-left: auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--primary);
  transition: opacity 0.15s, background 0.15s;
  flex-shrink: 0;
}
.call-icon-btn:hover {
  background: var(--primary-light);
}
.call-icon-btn svg {
  width: 16px;
  height: 16px;
}
.online-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
