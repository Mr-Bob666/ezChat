<template>
  <header class="app-header">
    <div class="header-left">
      <el-button class="mobile-menu-btn" :icon="Menu" text @click="$emit('toggle-sidebar')" />
      <span class="head-hash">
        <el-icon v-if="roomsStore.currentRoom?.is_private"><Lock /></el-icon>
        <template v-else>#</template>
      </span>
      <div class="head-room">
        <span class="room-name">{{ roomsStore.currentRoom?.name || 'ezChat' }}</span>
        <span class="room-sub" v-if="roomsStore.currentRoom">
          {{ roomsStore.currentRoom?.is_private ? '私密房间' : '公开房间' }}
        </span>
      </div>
      <span
        v-if="roomsStore.currentRoom?.is_private && roomsStore.currentRoom?.invite_code"
        class="invite-code-tag"
      >
        <span class="code-label">邀请码</span>
        <code>{{ roomsStore.currentRoom.invite_code }}</code>
        <el-button :icon="CopyDocument" link size="small" @click="copyInviteCode" />
      </span>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click">
        <span class="user-menu">
          <el-avatar :size="32" :src="authStore.avatarUrl || undefined" class="user-avatar">
            {{ authStore.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="username">{{ authStore.username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="showSettings = true">个人设置</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <AvatarUpload v-model="showSettings" />
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, CopyDocument, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRoomsStore } from '../../stores/rooms.js';
import { disconnectSocket } from '../../services/socket.js';
import AvatarUpload from './AvatarUpload.vue';
import { ElMessage } from 'element-plus';

defineEmits(['toggle-sidebar']);

const router = useRouter();
const authStore = useAuthStore();
const roomsStore = useRoomsStore();
const showSettings = ref(false);

function copyInviteCode() {
  const code = roomsStore.currentRoom?.invite_code;
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      ElMessage.success('邀请码已复制');
    });
  }
}

function handleLogout() {
  disconnectSocket();
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 22px;
  background: var(--bg);
  border-bottom: 1px solid var(--hair);
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.mobile-menu-btn { display: none; }
.head-hash {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: rgba(64,158,255,.12);
  color: var(--brand);
  display: grid; place-items: center;
  font-weight: 700; font-size: 15px;
  flex-shrink: 0;
}
.head-hash :deep(.el-icon) {
  font-size: 17px;
}
.head-room {
  display: flex; flex-direction: column;
  min-width: 0;
}
.room-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.room-sub {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
  letter-spacing: .04em;
}
.invite-code-tag {
  margin-left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 12px;
  border-radius: 999px;
  background: rgba(64,158,255,.10);
  border: 1px solid rgba(64,158,255,.25);
}
.invite-code-tag .code-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--brand-lo);
}
.invite-code-tag code {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-lo);
  letter-spacing: 2px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  border: 1px solid var(--hair);
  background: rgba(255,255,255,.6);
  transition: all .2s ease;
}
.user-menu:hover {
  border-color: rgba(64,158,255,.4);
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(64,158,255,.12);
}
.user-avatar :deep(.el-avatar) {
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep)) !important;
  color: #fff !important;
  font-weight: 700;
}
.username {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
}

@media (max-width: 768px) {
  .mobile-menu-btn { display: inline-flex; }
  .username { display: none; }
  .invite-code-tag { display: none; }
}
</style>
