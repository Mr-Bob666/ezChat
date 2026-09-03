<template>
  <div>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索用户" clearable style="width: 220px" @keyup.enter="searchUsers" />
      <el-button type="primary" @click="searchUsers">搜索用户</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="10">
        <el-card shadow="never" header="选择用户">
          <el-table :data="users" v-loading="userLoading" highlight-current-row @current-change="selectUser" height="500">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never" :header="selectedUser ? `为「${selectedUser.username}」推荐的房间` : '推荐结果'">
          <el-empty v-if="!selectedUser" description="请先在左侧选择一个用户" />
          <el-table v-else :data="recommendations" v-loading="recLoading" height="500">
            <el-table-column label="房间名" width="160">
              <template #default="{ row }">{{ row.room.name }}</template>
            </el-table-column>
            <el-table-column label="描述" show-overflow-tooltip>
              <template #default="{ row }">{{ row.room.description || '-' }}</template>
            </el-table-column>
            <el-table-column prop="score" label="匹配分" width="90" />
            <el-table-column prop="reason" label="推荐理由" width="200" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api.js';

const keyword = ref('');
const users = ref([]);
const userLoading = ref(false);
const selectedUser = ref(null);
const recommendations = ref([]);
const recLoading = ref(false);

async function searchUsers() {
  userLoading.value = true;
  try {
    const data = await api.get('/users', { params: { keyword: keyword.value, page: 1, pageSize: 50 } });
    users.value = data.users;
  } finally {
    userLoading.value = false;
  }
}

async function selectUser(user) {
  if (!user) return;
  selectedUser.value = user;
  recLoading.value = true;
  recommendations.value = [];
  try {
    const data = await api.get(`/recommend/${user.id}`);
    recommendations.value = data.recommendations;
  } finally {
    recLoading.value = false;
  }
}

onMounted(searchUsers);
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
