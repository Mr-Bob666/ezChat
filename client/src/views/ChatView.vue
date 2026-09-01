<template>
  <div class="chat-layout">
    <div class="chat-shell">
      <!-- Mobile overlay -->
      <div v-if="sidebarOpen" class="mobile-overlay" @click="sidebarOpen = false"></div>
      <AppSidebar :mobile-open="sidebarOpen" @close="sidebarOpen = false" />
      <div class="chat-main">
        <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
        <div class="chat-content">
          <template v-if="roomsStore.currentRoomId">
            <ChatWindow />
            <MemberPanel />
          </template>
          <div v-else class="chat-empty">
            <el-icon size="64"><ChatDotRound /></el-icon>
            <p>选择一个房间开始聊天</p>
          </div>
        </div>
      </div>
    </div>
    <VoiceCall />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ChatDotRound } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth.js';
import { useRoomsStore } from '../stores/rooms.js';
import { useUsersStore } from '../stores/users.js';
import { useSocket } from '../composables/useSocket.js';
import { useVoiceCall } from '../composables/useVoiceCall.js';
import { disconnectSocket, getSocket } from '../services/socket.js';
import AppHeader from '../components/common/AppHeader.vue';
import AppSidebar from '../components/common/AppSidebar.vue';
import ChatWindow from '../components/chat/ChatWindow.vue';
import MemberPanel from '../components/chat/MemberPanel.vue';
import VoiceCall from '../components/chat/VoiceCall.vue';

const router = useRouter();
const authStore = useAuthStore();
const roomsStore = useRoomsStore();
const usersStore = useUsersStore();
const { connect } = useSocket();
const { registerSocketEvents, unregisterSocketEvents } = useVoiceCall();
const sidebarOpen = ref(false);

onMounted(async () => {
  // Verify auth by fetching user info
  try {
    await authStore.fetchMe();
  } catch {
    authStore.logout();
    router.push('/login');
    return;
  }

  // Connect socket AFTER auth is verified
  connect(authStore.token);

  // Register online users listeners immediately so we don't miss
  // the user:online_list event that fires on socket connection
  const socket = getSocket();
  if (socket) {
    const onOnlineList = (users) => usersStore.setOnline(users);
    const onUserOnline = (user) => usersStore.addOnline(user);
    const onUserOffline = ({ userId }) => usersStore.removeOnline(userId);

    socket.on('user:online_list', onOnlineList);
    socket.on('user:online', onUserOnline);
    socket.on('user:offline', onUserOffline);

    // Register voice call events
    registerSocketEvents();

    // If socket is already connected, request the online list again
    // (in case we registered listeners after the initial event)
    if (socket.connected) {
      socket.emit('user:request_online');
    }
  }

  // Load rooms
  try {
    await roomsStore.fetchRooms();
  } catch (err) {
    ElMessage.error('加载房间列表失败');
  }
});

onUnmounted(() => {
  unregisterSocketEvents();
  disconnectSocket();
});
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  padding: 16px;
  background:
    radial-gradient(60% 50% at 0% 0%, rgba(64,158,255,.08), transparent 60%),
    radial-gradient(50% 40% at 100% 100%, rgba(108,180,255,.10), transparent 65%),
    var(--bg-2);
  position: relative;
  isolation: isolate;
}
.chat-layout::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(64,158,255,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64,158,255,.06) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 30%, transparent 90%);
  z-index: -1;
}
.chat-shell {
  flex: 1;
  display: flex;
  min-width: 0;
  background: var(--bg);
  border: 1px solid var(--hair);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px -40px rgba(64,158,255,.30), 0 12px 30px -16px rgba(11,30,63,.08);
  position: relative;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.chat-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  min-height: 0;
}
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background: var(--bg);
  position: relative;
  overflow: hidden;
}
.chat-empty::before {
  content: "";
  position: absolute;
  inset: -50%;
  background:
    radial-gradient(35% 35% at 50% 30%, rgba(64,158,255,.14), transparent 60%),
    radial-gradient(30% 30% at 30% 70%, rgba(108,180,255,.10), transparent 60%);
  filter: blur(40px);
  pointer-events: none;
}
.chat-empty :deep(.el-icon) {
  color: var(--brand) !important;
  opacity: .5;
  position: relative;
}
.chat-empty p {
  margin-top: 18px;
  font-size: 16px;
  font-weight: 500;
  color: var(--ink-3);
  position: relative;
}
.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .chat-layout {
    padding: 0;
  }
  .chat-shell {
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(11,30,63,0.45);
    backdrop-filter: blur(4px);
    z-index: 999;
  }
}
</style>
