<template>
  <div>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索用户名 / 邮箱" clearable style="width: 260px" @keyup.enter="load(1)" @clear="load(1)" />
      <el-button type="primary" @click="load(1)">搜索</el-button>
    </div>

    <el-table v-loading="loading" :data="users" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.is_disabled" type="danger">已禁用</el-tag>
          <el-tag v-else-if="row.is_online" type="success">在线</el-tag>
          <el-tag v-else type="info">离线</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_seen" label="最后在线" width="180">
        <template #default="{ row }">{{ formatTime(row.last_seen) }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button v-if="!row.is_disabled" type="danger" size="small" @click="toggleDisabled(row, true)">禁用</el-button>
          <el-button v-else type="success" size="small" @click="toggleDisabled(row, false)">启用</el-button>
          <el-button size="small" @click="openResetDialog(row)">重置密码</el-button>
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

    <el-dialog v-model="resetDialog.visible" title="重置密码" width="400px">
      <p>为用户 <b>{{ resetDialog.user?.username }}</b> 设置新密码：</p>
      <el-input v-model="resetDialog.newPassword" type="password" show-password placeholder="新密码（至少 6 位）" style="margin-top: 12px" />
      <template #footer>
        <el-button @click="resetDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="resetDialog.loading" @click="submitReset">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../services/api.js';

const loading = ref(false);
const users = ref([]);
const keyword = ref('');
const page = ref(1);
const pageSize = 10;
const total = ref(0);

const resetDialog = reactive({ visible: false, user: null, newPassword: '', loading: false });

function formatTime(t) {
  return t ? new Date(t).toLocaleString('zh-CN') : '-';
}

async function load(p = page.value) {
  page.value = p;
  loading.value = true;
  try {
    const data = await api.get('/users', { params: { keyword: keyword.value, page: p, pageSize } });
    users.value = data.users;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function toggleDisabled(user, disabled) {
  const action = disabled ? '禁用' : '启用';
  await ElMessageBox.confirm(`确定${action}用户「${user.username}」吗？`, '提示', { type: 'warning' });
  await api.put(`/users/${user.id}/${disabled ? 'disable' : 'enable'}`);
  ElMessage.success(`已${action}`);
  load();
}

function openResetDialog(user) {
  resetDialog.user = user;
  resetDialog.newPassword = '';
  resetDialog.visible = true;
}

async function submitReset() {
  resetDialog.loading = true;
  try {
    await api.put(`/users/${resetDialog.user.id}/reset-password`, { newPassword: resetDialog.newPassword });
    ElMessage.success('密码重置成功');
    resetDialog.visible = false;
  } catch {
    // 错误提示由拦截器统一处理
  } finally {
    resetDialog.loading = false;
  }
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
