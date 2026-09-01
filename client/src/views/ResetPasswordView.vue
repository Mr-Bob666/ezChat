<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">ezChat</h2>
      <p class="auth-subtitle">重置密码</p>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleReset">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="注册邮箱" prefix-icon="Message" size="large" />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="6 位验证码" prefix-icon="Key" size="large" maxlength="6" />
            <el-button size="large" :disabled="cooldown > 0 || sending" :loading="sending" @click="handleSendCode">
              {{ cooldown > 0 ? `${cooldown}s` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="新密码 (至少6位)" prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" native-type="submit" style="width: 100%">
            重置密码
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { sendCode, resetPassword } from '../services/auth.js';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const sending = ref(false);
const cooldown = ref(0);
let timer = null;

const form = reactive({
  email: '',
  code: '',
  newPassword: '',
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
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
  if (!form.email) {
    ElMessage.warning('请先输入邮箱');
    return;
  }
  sending.value = true;
  try {
    await sendCode(form.email, 'reset');
    ElMessage.success('验证码已发送，请查收邮箱');
    startCooldown(60);
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '发送失败');
  } finally {
    sending.value = false;
  }
}

async function handleReset() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await resetPassword({ email: form.email, code: form.code, newPassword: form.newPassword });
    ElMessage.success('密码已重置，请重新登录');
    router.push('/login');
  } catch (err) {
    const msg = err.response?.data?.error?.message || '重置失败';
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
