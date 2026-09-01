<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">ezChat</h2>
      <p class="auth-subtitle">创建新账号</p>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" prefix-icon="Message" size="large" />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="6 位验证码" prefix-icon="Key" size="large" maxlength="6" />
            <el-button size="large" :disabled="cooldown > 0 || sending" :loading="sending" @click="handleSendCode">
              {{ cooldown > 0 ? `${cooldown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码 (至少6位)" prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" native-type="submit" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth.js';
import { sendCode } from '../services/auth.js';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);
const sending = ref(false);
const cooldown = ref(0);
let timer = null;

const form = reactive({
  username: '',
  email: '',
  code: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度为3-30个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为6-50个字符', trigger: 'blur' },
  ],
};

function startCooldown(seconds) {
  cooldown.value = seconds;
  timer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

async function handleSendCode() {
  await formRef.value.validateField('email').catch(() => { throw new Error(); }).catch(() => null);
  if (!form.email) {
    ElMessage.warning('请先输入邮箱');
    return;
  }
  sending.value = true;
  try {
    await sendCode(form.email, 'register');
    ElMessage.success('验证码已发送，请查收邮箱');
    startCooldown(60);
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '发送失败');
  } finally {
    sending.value = false;
  }
}

async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await authStore.register(form.username, form.email, form.password, form.code);
    router.push('/chat');
  } catch (err) {
    const msg = err.response?.data?.error?.message || '注册失败';
    ElMessage.error(msg);
  } finally {
    loading.value = false;
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #98ccff 100%);
}
.auth-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.auth-title {
  text-align: center;
  font-size: 28px;
  color: #303133;
  margin-bottom: 4px;
}
.auth-subtitle {
  text-align: center;
  color: #909399;
  margin-bottom: 30px;
}
.auth-footer {
  text-align: center;
  color: #909399;
  margin-top: 16px;
}
.code-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.code-row .el-input {
  flex: 1;
}
.code-row .el-button {
  flex-shrink: 0;
  min-width: 110px;
}
</style>
