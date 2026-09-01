<template>
  <!-- Incoming call dialog -->
  <div v-if="callState.status === 'incoming'" class="call-overlay">
    <div class="call-card">
      <div class="call-avatar">
        <img v-if="callState.peerAvatar" :src="callState.peerAvatar" />
        <span v-else class="avatar-letter">{{ callState.peerName?.charAt(0)?.toUpperCase() }}</span>
      </div>
      <div class="call-info">
        <div class="call-name">{{ callState.peerName }}</div>
        <div class="call-hint">邀请你语音通话...</div>
      </div>
      <div class="call-actions">
        <button class="call-btn accept" @click="acceptCall" title="接听">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z"/></svg>
        </button>
        <button class="call-btn reject" @click="rejectCall" title="拒绝">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 010-1.36C3.53 8.46 7.52 6.5 12 6.5s8.47 1.96 11.71 5.22c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Calling / Connecting / Connected floating panel -->
  <div v-if="callState.status === 'calling' || callState.status === 'connecting' || callState.status === 'connected'" class="call-floating">
    <div class="call-avatar small">
      <img v-if="callState.peerAvatar" :src="callState.peerAvatar" />
      <span v-else class="avatar-letter">{{ callState.peerName?.charAt(0)?.toUpperCase() }}</span>
    </div>
    <div class="call-detail">
      <div class="call-name">{{ callState.peerName }}</div>
      <div class="call-status">
        <template v-if="callState.status === 'calling'">呼叫中...</template>
        <template v-else-if="callState.status === 'connecting'">连接中...</template>
        <template v-else>{{ formattedDuration }}</template>
      </div>
    </div>
    <div class="call-controls">
      <button
        class="ctrl-btn"
        :class="{ active: callState.muted }"
        @click="toggleMute"
        :title="callState.muted ? '取消静音' : '静音'"
      >
        <svg v-if="!callState.muted" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>
      </button>
      <button class="ctrl-btn hangup" @click="endCall" title="挂断">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 010-1.36C3.53 8.46 7.52 6.5 12 6.5s8.47 1.96 11.71 5.22c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useVoiceCall } from '../../composables/useVoiceCall.js';

const {
  state: callState,
  formattedDuration,
  acceptCall,
  rejectCall,
  endCall,
  toggleMute,
} = useVoiceCall();
</script>

<style scoped>
/* Incoming call overlay */
.call-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.call-card {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 280px;
}
.call-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  overflow: hidden;
}
.call-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.call-avatar .avatar-letter {
  font-size: 32px;
  font-weight: 600;
  color: var(--primary);
}
.call-avatar.small {
  width: 40px;
  height: 40px;
  margin: 0;
}
.call-avatar.small .avatar-letter {
  font-size: 16px;
}
.call-info {
  margin-bottom: 24px;
}
.call-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.call-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.call-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
}
.call-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: transform 0.15s;
}
.call-btn:hover {
  transform: scale(1.1);
}
.call-btn svg {
  width: 28px;
  height: 28px;
}
.call-btn.accept {
  background: var(--success);
}
.call-btn.reject {
  background: var(--danger);
}

/* Floating call panel */
.call-floating {
  position: fixed;
  top: 16px;
  right: 16px;
  background: var(--bg-white);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  min-width: 240px;
}
.call-detail {
  flex: 1;
  min-width: 0;
}
.call-detail .call-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.call-status {
  font-size: 12px;
  color: var(--text-secondary);
}
.call-controls {
  display: flex;
  gap: 8px;
}
.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text-regular);
  transition: background 0.15s;
}
.ctrl-btn:hover {
  background: var(--border-light);
}
.ctrl-btn.active {
  background: var(--warning);
  color: #fff;
}
.ctrl-btn.hangup {
  background: var(--danger);
  color: #fff;
}
.ctrl-btn.hangup:hover {
  background: #e04040;
}
.ctrl-btn svg {
  width: 20px;
  height: 20px;
}
</style>
