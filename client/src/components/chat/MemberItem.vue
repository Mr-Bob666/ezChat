<template>
  <div class="member-item" :class="{ muted: member.is_muted }">
    <div class="member-avatar" :class="{ online: user.is_online }">
      <img v-if="user.avatar_url" :src="user.avatar_url" class="member-avatar-img" />
      <template v-else>{{ user.username?.charAt(0)?.toUpperCase() }}</template>
    </div>
    <div class="member-info">
      <span class="member-name">{{ user.username }}</span>
      <span v-if="member.is_muted" class="muted-tag">已禁言</span>
    </div>
    <button
      v-if="isOther && user.is_online"
      class="call-btn"
      title="语音通话"
      @click="emit('call', user.id, user.username, user.avatar_url)"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.1.31.03.66-.25 1.02l-2.2 2.2z"/></svg>
    </button>
    <el-dropdown v-if="canManage" trigger="click" @command="handleCommand" @click.stop>
      <el-button :icon="MoreFilled" circle size="small" text class="action-btn" />
      <template #dropdown>
        <el-dropdown-menu>
          <!-- Role operations -->
          <template v-if="myRole === 'owner' && member.role === 'member'">
            <el-dropdown-item command="promote">设为管理员</el-dropdown-item>
          </template>
          <template v-if="myRole === 'owner' && member.role === 'admin'">
            <el-dropdown-item command="demote">取消管理员</el-dropdown-item>
          </template>
          <!-- Mute -->
          <el-dropdown-item v-if="!member.is_muted" command="mute">禁言</el-dropdown-item>
          <el-dropdown-item v-else command="unmute">取消禁言</el-dropdown-item>
          <!-- Kick -->
          <el-dropdown-item command="kick" divided>
            <span style="color: var(--danger)">踢出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { MoreFilled } from '@element-plus/icons-vue';

const props = defineProps({
  member: { type: Object, required: true },
  myRole: { type: String, default: null },
  myId: { type: Number, default: null },
});

const emit = defineEmits(['set-role', 'mute', 'unmute', 'kick', 'call']);

const user = computed(() => props.member.User || {});
const isOther = computed(() => user.value.id !== props.myId);

const ROLE_PRIORITY = { owner: 3, admin: 2, member: 1 };

const canManage = computed(() => {
  if (!props.myRole || props.myRole === 'member') return false;
  if (user.value.id === props.myId) return false;
  if (props.member.role === 'owner') return false;
  if (props.myRole === 'admin' && props.member.role === 'admin') return false;
  return ROLE_PRIORITY[props.myRole] > ROLE_PRIORITY[props.member.role];
});

function handleCommand(cmd) {
  const uid = user.value.id;
  switch (cmd) {
    case 'promote': emit('set-role', uid, 'admin'); break;
    case 'demote': emit('set-role', uid, 'member'); break;
    case 'mute': emit('mute', uid); break;
    case 'unmute': emit('unmute', uid); break;
    case 'kick': emit('kick', uid, user.value.username); break;
  }
}
</script>

<style scoped>
.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  margin: 0 6px;
  border-radius: 10px;
  cursor: default;
  transition: background 0.15s;
}
.member-item:hover {
  background: rgba(64,158,255,.08);
}
.member-item.muted {
  opacity: 0.55;
}
.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-3);
  color: var(--ink-3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  position: relative;
  flex-shrink: 0;
  transition: filter .25s;
}
.member-avatar.online {
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep));
  color: #fff;
  box-shadow: 0 4px 10px rgba(64,158,255,.30);
}
.member-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.member-avatar::after {
  content: '';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #c1c8d3;
  border: 2px solid var(--bg);
}
.member-avatar.online::after {
  background: #22c55e;
}
.member-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.member-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.member-item.muted .member-name { color: var(--muted); }
.muted-tag {
  font-size: 10px;
  color: var(--warning);
  background: rgba(230,162,60,.12);
  border: 1px solid rgba(230,162,60,.30);
  padding: 1px 7px;
  border-radius: 999px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: .04em;
}
.call-btn {
  opacity: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64,158,255,.10);
  color: var(--brand);
  transition: opacity 0.15s, background 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.call-btn:hover {
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  color: #fff;
  transform: scale(1.06);
  box-shadow: 0 6px 14px rgba(64,158,255,.35);
}
.call-btn svg {
  width: 14px;
  height: 14px;
}
.member-item:hover .call-btn {
  opacity: 1;
}
.action-btn {
  opacity: 0;
  transition: opacity 0.15s;
}
.action-btn :deep(.el-icon) {
  color: var(--ink-3);
}
.member-item:hover .action-btn {
  opacity: 1;
}
</style>
