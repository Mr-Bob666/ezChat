<template>
  <div>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索房间名" clearable style="width: 260px" @keyup.enter="load(1)" @clear="load(1)" />
      <el-button type="primary" @click="load(1)">搜索</el-button>
    </div>

    <el-table v-loading="loading" :data="rooms" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="房间名" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag :type="row.is_private ? 'warning' : 'success'">{{ row.is_private ? '私密' : '公开' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="memberCount" label="成员数" width="90" />
      <el-table-column label="创建者" width="120">
        <template #default="{ row }">{{ row.creator?.username || '-' }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170">
        <template #default="{ row }">
          <el-button size="small" @click="openMembers(row)">成员</el-button>
          <el-button type="danger" size="small" @click="dissolve(row)">解散</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      layout="total, prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="load"
    />

    <el-dialog v-model="membersDialog.visible" :title="`「${membersDialog.room?.name}」成员列表`" width="600px">
      <el-table v-loading="membersDialog.loading" :data="membersDialog.members" border max-height="400">
        <el-table-column label="用户名">
          <template #default="{ row }">{{ row.User?.username }}</template>
        </el-table-column>
        <el-table-column label="邮箱">
          <template #default="{ row }">{{ row.User?.email }}</template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="{ owner: 'danger', admin: 'warning', member: 'info' }[row.role]">
              {{ { owner: '房主', admin: '管理员', member: '成员' }[row.role] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joined_at" label="加入时间" width="180">
          <template #default="{ row }">{{ formatTime(row.joined_at) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../services/api.js';

const loading = ref(false);
const rooms = ref([]);
const keyword = ref('');
const page = ref(1);
const pageSize = 10;
const total = ref(0);

const membersDialog = reactive({ visible: false, loading: false, room: null, members: [] });

function formatTime(t) {
  return t ? new Date(t).toLocaleString('zh-CN') : '-';
}

async function load(p = page.value) {
  page.value = p;
  loading.value = true;
  try {
    const data = await api.get('/rooms', { params: { keyword: keyword.value, page: p, pageSize } });
    rooms.value = data.rooms;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function openMembers(room) {
  membersDialog.room = room;
  membersDialog.visible = true;
  membersDialog.loading = true;
  try {
    const data = await api.get(`/rooms/${room.id}/members`);
    membersDialog.members = data.members;
  } finally {
    membersDialog.loading = false;
  }
}

async function dissolve(room) {
  await ElMessageBox.confirm(`确定解散房间「${room.name}」吗？该操作会删除所有消息且不可恢复。`, '警告', {
    type: 'error',
    confirmButtonText: '解散',
  });
  await api.delete(`/rooms/${room.id}`);
  ElMessage.success('房间已解散');
  load();
}

onMounted(() => load(1));
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
