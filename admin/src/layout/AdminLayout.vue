<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo">ezChat 后台</div>
      <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff">
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/rooms">
          <el-icon><ChatDotRound /></el-icon>
          <span>房间管理</span>
        </el-menu-item>
        <el-menu-item index="/messages">
          <el-icon><Message /></el-icon>
          <span>消息管理</span>
        </el-menu-item>
        <el-menu-item index="/recommend">
          <el-icon><Star /></el-icon>
          <span>房间推荐</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="title">{{ route.meta.title }}</span>
        <div class="right">
          <span class="username">{{ adminInfo?.username }}</span>
          <el-button type="danger" text @click="logout">退出登录</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DataAnalysis, User, ChatDotRound, Message, Star } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const adminInfo = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('adminInfo'));
  } catch {
    return null;
  }
});

function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminInfo');
  router.push('/login');
}
</script>

<style scoped>
.layout {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.el-menu {
  border-right: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  color: #606266;
}
</style>
