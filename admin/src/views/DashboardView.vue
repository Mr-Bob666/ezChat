<template>
  <div v-loading="loading" class="dashboard">
    <div class="page-header">
      <h2 class="page-title">数据总览</h2>
      <p class="page-subtitle">实时掌握平台运行状况</p>
    </div>
    <div class="cards">
      <div v-for="card in cards" :key="card.label" class="card">
        <div class="icon-wrap" :style="{ background: card.bg, color: card.color }">
          <el-icon :size="26"><component :is="card.icon" /></el-icon>
        </div>
        <div class="info">
          <div class="value">{{ card.value }}</div>
          <div class="label">{{ card.label }}</div>
        </div>
        <div class="glow" :style="{ background: card.bg }"></div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">在线人数趋势</h3>
          <p class="chart-subtitle">近 7 天每日最高在线人数</p>
        </div>
        <div class="chart-legend">
          <span class="legend-dot"></span>最高在线
        </div>
      </div>
      <div v-if="trendEmpty" class="chart-empty">暂无数据，有用户上线后自动记录</div>
      <svg v-else :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#409eff" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#409eff" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- 横向网格线 + Y 轴刻度 -->
        <g v-for="tick in yTicks" :key="tick.value">
          <line
            :x1="padding.left" :x2="chartWidth - padding.right"
            :y1="tick.y" :y2="tick.y"
            stroke="#ebeef5" stroke-dasharray="4 4"
          />
          <text :x="padding.left - 10" :y="tick.y + 4" text-anchor="end" class="axis-text">
            {{ tick.value }}
          </text>
        </g>

        <!-- 面积 + 折线 -->
        <path :d="areaPath" fill="url(#areaGradient)" />
        <path :d="linePath" fill="none" stroke="#409eff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

        <!-- 数据点 + X 轴标签 -->
        <g v-for="p in points" :key="p.date">
          <circle :cx="p.x" :cy="p.y" r="8" fill="transparent">
            <title>{{ p.date }} 最高在线 {{ p.peak }} 人</title>
          </circle>
          <circle :cx="p.x" :cy="p.y" r="4" fill="#fff" stroke="#409eff" stroke-width="2.5">
            <title>{{ p.date }} 最高在线 {{ p.peak }} 人</title>
          </circle>
          <text :x="p.x" :y="p.y - 12" text-anchor="middle" class="point-text">{{ p.peak }}</text>
          <text :x="p.x" :y="chartHeight - 8" text-anchor="middle" class="axis-text">
            {{ p.date.slice(5) }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { User, Connection, ChatDotRound, ChatLineRound, Calendar } from '@element-plus/icons-vue';
import api from '../services/api.js';

const loading = ref(false);
const stats = ref({});
const trend = ref([]);

const cards = computed(() => [
  { label: '总用户数', value: stats.value.userCount ?? '-', color: '#409eff', bg: '#ecf5ff', icon: User },
  { label: '在线用户', value: stats.value.onlineCount ?? '-', color: '#67c23a', bg: '#f0f9eb', icon: Connection },
  { label: '房间总数', value: stats.value.roomCount ?? '-', color: '#e6a23c', bg: '#fdf6ec', icon: ChatDotRound },
  { label: '消息总数', value: stats.value.messageCount ?? '-', color: '#f56c6c', bg: '#fef0f0', icon: ChatLineRound },
  { label: '今日消息', value: stats.value.todayMessageCount ?? '-', color: '#9b59b6', bg: '#f4ecf7', icon: Calendar },
]);

const chartWidth = 720;
const chartHeight = 240;
const padding = { top: 28, right: 24, bottom: 32, left: 44 };

const trendEmpty = computed(() => trend.value.length === 0 || trend.value.every((t) => t.peak === 0));

// Y 轴最大值取 4 的倍数，保证刻度是整数
const yMax = computed(() => {
  const max = Math.max(0, ...trend.value.map((t) => t.peak));
  return Math.max(4, Math.ceil(max / 4) * 4);
});

const yTicks = computed(() => {
  const ticks = [];
  for (let i = 0; i <= 4; i++) {
    const value = (yMax.value / 4) * i;
    const ratio = value / yMax.value;
    ticks.push({
      value,
      y: padding.top + (1 - ratio) * (chartHeight - padding.top - padding.bottom),
    });
  }
  return ticks;
});

const points = computed(() => {
  const n = trend.value.length;
  return trend.value.map((t, i) => {
    const x = padding.left + (i * (chartWidth - padding.left - padding.right)) / Math.max(n - 1, 1);
    const y = padding.top + (1 - t.peak / yMax.value) * (chartHeight - padding.top - padding.bottom);
    return { x, y, ...t };
  });
});

const linePath = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
);

const areaPath = computed(() => {
  if (points.value.length === 0) return '';
  const bottom = chartHeight - padding.bottom;
  const first = points.value[0];
  const last = points.value[points.value.length - 1];
  return `${linePath.value} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
});

onMounted(async () => {
  loading.value = true;
  try {
    const [statsData, trendData] = await Promise.all([
      api.get('/stats'),
      api.get('/stats/online-trend'),
    ]);
    stats.value = statsData;
    trend.value = trendData;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  padding-bottom: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
}

.icon-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
}

.value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.label {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
}

.chart-card {
  margin-top: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #409eff;
}

.chart {
  width: 100%;
  height: 260px;
  display: block;
}

.axis-text {
  font-size: 11px;
  fill: #909399;
}

.point-text {
  font-size: 11px;
  font-weight: 600;
  fill: #409eff;
}

.chart-empty {
  padding: 60px 0;
  text-align: center;
  font-size: 13px;
  color: #909399;
}
</style>
