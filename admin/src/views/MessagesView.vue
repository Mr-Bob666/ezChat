<template>
  <div>
    <div class="toolbar">
      <el-input v-model="filters.roomId" placeholder="房间 ID" clearable style="width: 140px" @keyup.enter="load(1)" />
      <el-input v-model="filters.userId" placeholder="用户 ID" clearable style="width: 140px" @keyup.enter="load(1)" />
      <el-button type="primary" @click="load(1)">筛选</el-button>
    </div>

    <el-table v-loading="loading" :data="messages" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="房间" width="140">
        <template #default="{ row }">{{ row.room?.name || `房间 ${row.room_id}` }}</template>
      </el-table-column>
      <el-table-column label="发送者" width="140">
        <template #default="{ row }">{{ row.sender?.username || `用户 ${row.user_id}` }}</template>
      </el-table-column>
      <el-table-column label="内容">
        <template #default="{ row }">
          <span v-if="row.is_recalled" class="recalled">[已撤回]</span>
          <el-image
            v-else-if="row.type === 'image' && row.image_url"
            :src="row.image_url"
            :preview-src-list="[row.image_url]"
            fit="cover"
            style="width: 60px; height: 60px"
          />
          <span v-else>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="remove(row)">删除</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../services/api.js';

const loading = ref(false);
const messages = ref([]);
const filters = reactive({ roomId: '', userId: '' });
const page = ref(1);
const pageSize = 20;
const total = ref(0);

function formatTime(t) {
  return t ? new Date(t).toLocaleString('zh-CN') : '-';
}

async function load(p = page.value) {
  page.value = p;
  loading.value = true;
  try {
    const data = await api.get('/messages', {
      params: {
        roomId: filters.roomId || undefined,
        userId: filters.userId || undefined,
        page: p,
        pageSize,
      },
    });
    messages.value = data.messages;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

async function remove(message) {
  await ElMessageBox.confirm('确定删除这条消息吗？', '提示', { type: 'warning' });
  await api.delete(`/messages/${message.id}`);
  ElMessage.success('消息已删除');
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

.recalled {
  color: #909399;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
