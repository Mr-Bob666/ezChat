<template>
  <aside class="app-sidebar" :class="{ 'mobile-hidden': !mobileOpen }">
    <div class="sidebar-brand">
      <span class="brand-mark"><img :src="logoUrl" alt="ezChat" /></span>
      <span class="brand-name">ezChat</span>
    </div>
    <div class="sidebar-header">
      <h3>我的房间</h3>
      <div class="sidebar-actions">
        <button class="icon-btn primary" title="创建房间" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
        </button>
        <button class="icon-btn" title="通过邀请码加入" @click="showJoinCodeDialog = true">
          <el-icon><Link /></el-icon>
        </button>
        <button class="icon-btn mobile-close" :title="'关闭'" @click="$emit('close')">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>
    <div class="room-list">
      <!-- Loading skeleton -->
      <div v-if="roomsStore.loading" class="room-skeleton">
        <div v-for="i in 5" :key="i" class="skeleton-item">
          <div class="skeleton-icon"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
      <div
        v-for="room in roomsStore.rooms"
        :key="room.id"
        class="room-item"
        :class="{ active: roomsStore.currentRoomId === room.id }"
        @click="handleSelectRoom(room)"
      >
        <span class="hashicon">
          <el-icon v-if="room.is_private"><Lock /></el-icon>
          <template v-else>#</template>
        </span>
        <span class="room-name">{{ room.name }}</span>
        <span class="room-members" v-if="room.member_count">{{ room.member_count }}</span>
        <button
          v-if="room.created_by === authStore.user?.id"
          class="room-delete-btn"
          title="删除房间"
          @click.stop="handleDeleteRoom(room)"
        >
          <el-icon><Delete /></el-icon>
        </button>
      </div>
      <div v-if="!roomsStore.loading && roomsStore.rooms.length === 0" class="room-empty">
        <div class="empty-icon">#</div>
        <p>暂无房间</p>
        <span>点击右上角 + 创建你的第一个房间</span>
      </div>
    </div>

    <!-- Create Room Dialog -->
    <el-dialog v-model="showCreateDialog" title="创建房间" width="400px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" @submit.prevent="handleCreateRoom">
        <el-form-item prop="name" label="房间名">
          <el-input v-model="createForm.name" placeholder="输入房间名" />
        </el-form-item>
        <el-form-item prop="description" label="描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="房间描述（可选）" />
        </el-form-item>
        <el-form-item prop="is_private" label="私密房间">
          <el-switch v-model="createForm.is_private" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateRoom">创建</el-button>
      </template>
    </el-dialog>

    <!-- Join by Invite Code Dialog -->
    <el-dialog v-model="showJoinCodeDialog" title="通过邀请码加入" width="400px">
      <el-form @submit.prevent="handleJoinByCode">
        <el-form-item label="邀请码">
          <el-input
            v-model="joinCodeForm.invite_code"
            placeholder="输入8位邀请码"
            maxlength="8"
            style="text-transform: uppercase; letter-spacing: 2px;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showJoinCodeDialog = false">取消</el-button>
        <el-button type="primary" :loading="joiningByCode" @click="handleJoinByCode">加入</el-button>
      </template>
    </el-dialog>
  </aside>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Plus, Close, Delete, Link, Lock } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoomsStore } from '../../stores/rooms.js';
import { useAuthStore } from '../../stores/auth.js';
import logoUrl from '../../assets/images/landing-logo.png';

defineProps({
  mobileOpen: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);
const roomsStore = useRoomsStore();
const authStore = useAuthStore();
const showCreateDialog = ref(false);
const creating = ref(false);
const createFormRef = ref(null);
const showJoinCodeDialog = ref(false);
const joiningByCode = ref(false);
const joinCodeForm = reactive({ invite_code: '' });

const createForm = reactive({
  name: '',
  description: '',
  is_private: false,
});

const createRules = {
  name: [
    { required: true, message: '请输入房间名', trigger: 'blur' },
    { min: 1, max: 100, message: '房间名长度为1-100个字符', trigger: 'blur' },
  ],
};

async function handleSelectRoom(room) {
  try {
    await roomsStore.joinRoom(room.id);
    await roomsStore.selectRoom(room.id);
    emit('close'); // Close mobile sidebar after selection
  } catch (err) {
    ElMessage.error('加入房间失败');
  }
}

async function handleDeleteRoom(room) {
  try {
    await ElMessageBox.confirm(
      `确定要删除房间「${room.name}」吗？房间内的所有消息将被永久删除。`,
      '删除房间',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    );
    await roomsStore.deleteRoom(room.id);
    ElMessage.success('房间已删除');
  } catch (err) {
    if (err === 'cancel') return;
    ElMessage.error(err.response?.data?.error?.message || '删除失败');
  }
}

async function handleCreateRoom() {
  const valid = await createFormRef.value.validate().catch(() => false);
  if (!valid) return;

  creating.value = true;
  try {
    const room = await roomsStore.createRoom(createForm);
    showCreateDialog.value = false;
    createForm.name = '';
    createForm.description = '';
    createForm.is_private = false;

    if (room.invite_code) {
      ElMessageBox.alert(
        `房间创建成功！邀请码：${room.invite_code}`,
        '私密房间邀请码',
        { confirmButtonText: '知道了', type: 'success' }
      );
    } else {
      ElMessage.success('房间创建成功');
    }

    await roomsStore.selectRoom(room.id);
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '创建失败');
  } finally {
    creating.value = false;
  }
}

async function handleJoinByCode() {
  const code = joinCodeForm.invite_code.trim();
  if (!code || code.length !== 8) {
    ElMessage.warning('请输入8位邀请码');
    return;
  }
  joiningByCode.value = true;
  try {
    const room = await roomsStore.joinByInviteCode(code);
    showJoinCodeDialog.value = false;
    joinCodeForm.invite_code = '';
    ElMessage.success('加入成功');
    await roomsStore.selectRoom(room.id);
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '邀请码无效');
  } finally {
    joiningByCode.value = false;
  }
}
</script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-2);
  border-right: 1px solid var(--hair);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.brand-mark {
  width: 30px; height: 30px;
  display: grid; place-items: center;
}
.brand-mark img {
  width: 100%; height: 100%; object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(64,158,255,.40));
}
.brand-name {
  font-size: 17px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 18px 12px;
}
.sidebar-header h3 {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
}
.sidebar-actions {
  display: flex;
  gap: 6px;
}
.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  border: 1px solid var(--hair);
  background: rgba(255,255,255,.6);
  color: var(--ink-3);
  cursor: pointer;
  transition: all .2s ease;
  font-size: 14px;
}
.icon-btn:hover {
  border-color: rgba(64,158,255,.4);
  color: var(--brand);
  background: #fff;
  transform: translateY(-1px);
}
.icon-btn.primary {
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 14px rgba(64,158,255,.35);
}
.icon-btn.primary:hover {
  background: linear-gradient(180deg, var(--brand), var(--brand-lo));
  box-shadow: 0 10px 20px rgba(64,158,255,.45);
}
.mobile-close { display: none; }

.room-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.room-list::-webkit-scrollbar { width: 6px; }
.room-list::-webkit-scrollbar-thumb {
  background: rgba(11,30,63,.12);
  border-radius: 3px;
}
.room-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--ink-3);
  transition: background .2s, color .2s, transform .2s;
  position: relative;
  font-size: 14px;
}
.room-item:hover {
  background: rgba(64,158,255,.08);
  color: var(--ink);
}
.room-item.active {
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  color: #fff;
  box-shadow: 0 6px 14px rgba(64,158,255,.30);
}
.hashicon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: rgba(64,158,255,.15);
  color: var(--brand);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  transition: background .2s, color .2s;
}
.hashicon :deep(.el-icon) { font-size: 13px; }
.room-item.active .hashicon {
  background: rgba(255,255,255,.22);
  color: #fff;
}
.room-name {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.room-members {
  font-size: 11px;
  background: rgba(64,158,255,.12);
  color: var(--brand);
  padding: 1px 8px;
  border-radius: 10px;
  font-weight: 600;
  font-family: var(--font-mono);
}
.room-item.active .room-members {
  background: rgba(255,255,255,.25);
  color: #fff;
}
.room-delete-btn {
  opacity: 0;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  color: var(--danger);
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: opacity .2s, background .2s;
  flex-shrink: 0;
  margin-left: -4px;
}
.room-delete-btn :deep(.el-icon) { font-size: 13px; }
.room-delete-btn:hover { background: rgba(245,108,108,.12); }
.room-item:hover .room-delete-btn { opacity: 1; }
.room-item.active .room-delete-btn { color: rgba(255,255,255,.85); }
.room-item.active .room-delete-btn:hover { background: rgba(255,255,255,.18); }

.room-empty {
  text-align: center;
  padding: 32px 16px;
  color: var(--muted);
  font-size: 13px;
}
.room-empty .empty-icon {
  width: 48px; height: 48px;
  margin: 0 auto 12px;
  border-radius: 14px;
  background: rgba(64,158,255,.10);
  color: var(--brand);
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
}
.room-empty p {
  font-weight: 600;
  color: var(--ink-3);
  margin-bottom: 4px;
}
.room-empty span {
  font-size: 12px;
  color: var(--muted);
}

/* Skeleton loading */
.room-skeleton {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.skeleton-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
}
.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--bg-2) 25%, var(--bg-3) 50%, var(--bg-2) 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite;
}
.skeleton-text {
  flex: 1;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--bg-2) 25%, var(--bg-3) 50%, var(--bg-2) 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite;
}
@keyframes skeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(0);
    background: #fff;
    box-shadow: 4px 0 30px rgba(11,30,63,0.15);
  }
  .app-sidebar.mobile-hidden {
    transform: translateX(-100%);
  }
  .mobile-close {
    display: inline-grid;
  }
}
</style>
