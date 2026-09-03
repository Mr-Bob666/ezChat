<template>
  <div v-loading="loading">
    <div class="cards">
      <el-card v-for="card in cards" :key="card.label" shadow="hover" class="card">
        <div class="stat">
          <div class="value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="label">{{ card.label }}</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api.js';

const loading = ref(false);
const stats = ref({});

const cards = computed(() => [
  { label: '总用户数', value: stats.value.userCount ?? '-', color: '#409eff' },
  { label: '在线用户', value: stats.value.onlineCount ?? '-', color: '#67c23a' },
  { label: '房间总数', value: stats.value.roomCount ?? '-', color: '#e6a23c' },
  { label: '消息总数', value: stats.value.messageCount ?? '-', color: '#f56c6c' },
  { label: '今日消息', value: stats.value.todayMessageCount ?? '-', color: '#9b59b6' },
]);

onMounted(async () => {
  loading.value = true;
  try {
    stats.value = await api.get('/stats');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.cards {
  display: flex;
  gap: 16px;
}

.card {
  flex: 1;
}

.stat {
  text-align: center;
  padding: 12px 0;
}

.value {
  font-size: 32px;
  font-weight: bold;
}

.label {
  margin-top: 8px;
  color: #909399;
}
</style>
