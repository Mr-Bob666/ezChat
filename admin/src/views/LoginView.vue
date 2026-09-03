<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>ezChat 后台管理</h2>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" native-type="submit">
          登 录
        </el-button>
        <el-button class="login-btn" style="margin-left: 0; margin-top: 12px" @click="skipLogin">
          跳过登录（开发调试）
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import api from '../services/api.js';

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

async function handleLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }
  loading.value = true;
  try {
    const data = await api.post('/login', form);
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminInfo', JSON.stringify(data.admin));
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch {
    // 错误提示由拦截器统一处理
  } finally {
    loading.value = false;
  }
}

function skipLogin() {
  localStorage.setItem('adminToken', 'dev-bypass');
  localStorage.setItem('adminInfo', JSON.stringify({ id: 0, username: 'dev-admin' }));
  router.push('/dashboard');
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.login-card {
  width: 380px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
}
</style>
