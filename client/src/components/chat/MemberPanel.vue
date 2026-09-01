<template>
  <aside class="member-panel" :class="{ 'panel-collapsed': panelCollapsed }">
    <!-- Collapsed state: only show toggle button -->
    <div v-if="panelCollapsed" class="panel-toggle-bar" @click="panelCollapsed = false">
      <el-icon><User /></el-icon>
      <span class="toggle-count">{{ members.length }}</span>
    </div>

    <!-- Expanded state -->
    <template v-else>
    <div class="panel-header">
      <h4>房间成员 ({{ members.length }})</h4>
      <div class="panel-header-actions">
        <el-button
          v-if="myRole === 'owner'"
          size="small"
          text
          @click="showBanDialog = true"
        >黑名单</el-button>
        <el-button size="small" text :icon="DArrowRight" @click="panelCollapsed = true" />
      </div>
    </div>

    <!-- Invite code section (private rooms, owner only) -->
    <div
      v-if="roomsStore.currentRoom?.is_private && roomsStore.currentRoom?.invite_code && myRole === 'owner'"
      class="invite-code-section"
    >
      <div class="invite-code-label">邀请码</div>
      <div class="invite-code-row">
        <code class="invite-code-value">{{ roomsStore.currentRoom.invite_code }}</code>
        <el-button size="small" :icon="CopyDocument" link @click="copyInviteCode" />
        <el-button size="small" :icon="RefreshRight" link @click="handleRegenerateCode" />
      </div>
    </div>

    <div v-if="roomsStore.membersLoading" class="panel-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>

    <div v-else class="member-list">
      <!-- owner group -->
      <div v-if="owners.length" class="member-group">
        <div class="group-label" @click="toggleGroup('owner')">
          <el-icon class="group-arrow" :class="{ collapsed: collapsed.owner }"><ArrowDown /></el-icon>
          <span>房主</span>
        </div>
        <transition name="collapse">
          <div v-show="!collapsed.owner" class="group-items">
            <MemberItem
              v-for="m in owners" :key="m.id" :member="m"
              :my-role="myRole" :my-id="authStore.user?.id"
              @set-role="handleSetRole" @mute="handleMute" @unmute="handleUnmute" @kick="handleKick" @call="handleCall"
            />
          </div>
        </transition>
      </div>
      <!-- admin group -->
      <div v-if="admins.length" class="member-group">
        <div class="group-label" @click="toggleGroup('admin')">
          <el-icon class="group-arrow" :class="{ collapsed: collapsed.admin }"><ArrowDown /></el-icon>
          <span>管理员 — {{ admins.length }}</span>
        </div>
        <transition name="collapse">
          <div v-show="!collapsed.admin" class="group-items">
            <MemberItem
              v-for="m in admins" :key="m.id" :member="m"
              :my-role="myRole" :my-id="authStore.user?.id"
              @set-role="handleSetRole" @mute="handleMute" @unmute="handleUnmute" @kick="handleKick" @call="handleCall"
            />
          </div>
        </transition>
      </div>
      <!-- member group -->
      <div v-if="regulars.length" class="member-group">
        <div class="group-label" @click="toggleGroup('member')">
          <el-icon class="group-arrow" :class="{ collapsed: collapsed.member }"><ArrowDown /></el-icon>
          <span>成员 — {{ regulars.length }}</span>
        </div>
        <transition name="collapse">
          <div v-show="!collapsed.member" class="group-items">
            <MemberItem
              v-for="m in regulars" :key="m.id" :member="m"
              :my-role="myRole" :my-id="authStore.user?.id"
              @set-role="handleSetRole" @mute="handleMute" @unmute="handleUnmute" @kick="handleKick" @call="handleCall"
            />
          </div>
        </transition>
      </div>
    </div>

    </template>

    <!-- Ban list dialog -->
    <el-dialog v-model="showBanDialog" title="黑名单管理" width="420px">
      <div v-if="roomsStore.bannedMembers.length === 0" class="ban-empty">暂无黑名单用户</div>
      <div v-for="ban in roomsStore.bannedMembers" :key="ban.id" class="ban-item">
        <div class="ban-info">
          <span class="ban-name">{{ ban.user?.username }}</span>
          <span class="ban-reason">{{ ban.reason || '无原因' }}</span>
        </div>
        <el-button size="small" type="primary" text @click="handleUnban(ban.user_id)">解除</el-button>
      </div>
    </el-dialog>
  </aside>
</template>

<script setup>
import { computed, ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { Loading, ArrowDown, DArrowRight, User, CopyDocument, RefreshRight } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoomsStore } from '../../stores/rooms.js';
import { useAuthStore } from '../../stores/auth.js';
import { getSocket } from '../../services/socket.js';
import { useVoiceCall } from '../../composables/useVoiceCall.js';
import MemberItem from './MemberItem.vue';

const roomsStore = useRoomsStore();
const authStore = useAuthStore();
const { startCall } = useVoiceCall();
const showBanDialog = ref(false);
const panelCollapsed = ref(false);
const collapsed = reactive({ owner: false, admin: false, member: false });

function toggleGroup(group) {
  collapsed[group] = !collapsed[group];
}

const members = computed(() => roomsStore.members);
const owners = computed(() => members.value.filter(m => m.role === 'owner'));
const admins = computed(() => members.value.filter(m => m.role === 'admin'));
const regulars = computed(() => members.value.filter(m => m.role === 'member'));

const myRole = computed(() => {
  const me = members.value.find(m => m.User?.id === authStore.user?.id || m.user_id === authStore.user?.id);
  return me?.role || null;
});

function loadMembers() {
  if (roomsStore.currentRoomId) {
    roomsStore.fetchMembers(roomsStore.currentRoomId);
  }
}

watch(() => roomsStore.currentRoomId, (id) => {
  if (id) loadMembers();
}, { immediate: true });

watch(showBanDialog, (val) => {
  if (val && roomsStore.currentRoomId) {
    roomsStore.fetchBannedMembers(roomsStore.currentRoomId).catch(() => {});
  }
});

// Listen for real-time member updates
function onMemberUpdated(data) {
  if (data.roomId === roomsStore.currentRoomId) {
    loadMembers();
  }
}

function onMemberKicked(data) {
  if (data.roomId === roomsStore.currentRoomId) {
    if (data.userId === authStore.user?.id) {
      ElMessage.warning('你已被踢出房间');
      roomsStore.clearCurrentRoom();
    } else {
      loadMembers();
    }
  }
}

onMounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.on('room:member_updated', onMemberUpdated);
    socket.on('room:member_kicked', onMemberKicked);
  }
});

onUnmounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.off('room:member_updated', onMemberUpdated);
    socket.off('room:member_kicked', onMemberKicked);
  }
});

async function handleSetRole(userId, role) {
  try {
    await roomsStore.setMemberRole(roomsStore.currentRoomId, userId, role);
    ElMessage.success('角色已更新');
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '操作失败');
  }
}

async function handleMute(userId) {
  try {
    await roomsStore.muteMember(roomsStore.currentRoomId, userId);
    ElMessage.success('已禁言');
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '操作失败');
  }
}

async function handleUnmute(userId) {
  try {
    await roomsStore.unmuteMember(roomsStore.currentRoomId, userId);
    ElMessage.success('已取消禁言');
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '操作失败');
  }
}

async function handleKick(userId, username) {
  try {
    await ElMessageBox.confirm(
      `确定要踢出「${username}」并加入黑名单吗？`,
      '踢出成员',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    await roomsStore.kickMember(roomsStore.currentRoomId, userId);
    ElMessage.success('已踢出');
  } catch (err) {
    if (err === 'cancel') return;
    ElMessage.error(err.response?.data?.error?.message || '操作失败');
  }
}

function handleCall(userId, username, avatarUrl) {
  startCall(userId, username, avatarUrl);
}

function copyInviteCode() {
  const code = roomsStore.currentRoom?.invite_code;
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      ElMessage.success('邀请码已复制');
    });
  }
}

async function handleRegenerateCode() {
  try {
    await ElMessageBox.confirm(
      '重新生成邀请码后，旧邀请码将失效。确定要继续吗？',
      '重新生成邀请码',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    await roomsStore.regenerateInviteCode(roomsStore.currentRoomId);
    ElMessage.success('邀请码已更新');
  } catch (err) {
    if (err === 'cancel') return;
    ElMessage.error(err.response?.data?.error?.message || '操作失败');
  }
}

async function handleUnban(userId) {
  try {
    await roomsStore.unbanMember(roomsStore.currentRoomId, userId);
    ElMessage.success('已解除黑名单');
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '操作失败');
  }
}
</script>

<style scoped>
.member-panel {
  width: 240px;
  background: var(--bg-2);
  border-left: 1px solid var(--hair);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
  flex-shrink: 0;
}
.member-panel.panel-collapsed {
  width: 52px;
}
.panel-toggle-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 0;
  cursor: pointer;
  color: var(--ink-3);
  transition: color .15s, background .15s;
}
.panel-toggle-bar:hover {
  color: var(--brand);
  background: rgba(64,158,255,.06);
}
.toggle-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(64,158,255,.15);
  color: var(--brand);
  font-family: var(--font-mono);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--hair);
}
.panel-header h4 {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0;
  white-space: nowrap;
}
.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.panel-header-actions :deep(.el-button) {
  color: var(--ink-3) !important;
  font-size: 12px !important;
}
.panel-header-actions :deep(.el-button:hover) {
  color: var(--brand) !important;
}
.invite-code-section {
  padding: 14px 18px;
  border-bottom: 1px solid var(--hair);
  background: linear-gradient(180deg, rgba(64,158,255,.04), rgba(64,158,255,.10));
}
.invite-code-label {
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--brand-lo);
  margin-bottom: 6px;
}
.invite-code-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.invite-code-value {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--ink);
  flex: 1;
}
.invite-code-row :deep(.el-button) {
  color: var(--brand) !important;
}
.panel-loading {
  display: flex;
  justify-content: center;
  padding: 32px;
  color: var(--brand);
}
.member-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0 12px;
}
.member-list::-webkit-scrollbar { width: 6px; }
.member-list::-webkit-scrollbar-thumb {
  background: rgba(11,30,63,.10);
  border-radius: 3px;
}
.member-group {
  margin-bottom: 4px;
}
.group-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 18px;
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: background .15s, color .15s;
}
.group-label:hover {
  background: rgba(64,158,255,.06);
  color: var(--ink-3);
}
.group-arrow {
  font-size: 11px;
  transition: transform 0.25s;
  flex-shrink: 0;
}
.group-arrow.collapsed {
  transform: rotate(-90deg);
}
.group-items {
  overflow: hidden;
}
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
}
.ban-empty {
  text-align: center;
  padding: 24px;
  color: var(--muted);
  font-size: 13px;
}
.ban-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px;
  border-bottom: 1px solid var(--hair);
}
.ban-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ban-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}
.ban-reason {
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 768px) {
  .member-panel {
    display: none;
  }
}
</style>
