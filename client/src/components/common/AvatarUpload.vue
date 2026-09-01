<template>
  <el-dialog v-model="visible" title="个人设置" width="420px" :before-close="handleClose">
    <div class="profile-settings">
      <div class="avatar-section">
        <div class="avatar-preview" @click="triggerFileInput">
          <el-avatar :size="100" :src="previewUrl || undefined">
            {{ authStore.username.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="avatar-overlay">
            <el-icon :size="24"><Camera /></el-icon>
            <span>更换头像</span>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          hidden
          @change="handleFileChange"
        />
        <p class="avatar-tip">点击头像更换，支持 jpg/png/gif/webp，最大 2MB</p>
      </div>
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ authStore.username }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ authStore.user?.email }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="uploading" :disabled="!selectedFile" @click="handleUpload">
        保存头像
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Camera } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const fileInput = ref(null);
const selectedFile = ref(null);
const localPreview = ref('');
const uploading = ref(false);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const previewUrl = computed(() => localPreview.value || authStore.avatarUrl);

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 2MB');
    return;
  }

  selectedFile.value = file;
  localPreview.value = URL.createObjectURL(file);
}

async function handleUpload() {
  if (!selectedFile.value) return;
  uploading.value = true;
  try {
    await authStore.updateAvatar(selectedFile.value);
    ElMessage.success('头像更新成功');
    selectedFile.value = null;
    localPreview.value = '';
    visible.value = false;
  } catch {
    ElMessage.error('头像上传失败，请重试');
  } finally {
    uploading.value = false;
  }
}

function handleClose() {
  selectedFile.value = null;
  if (localPreview.value) {
    URL.revokeObjectURL(localPreview.value);
    localPreview.value = '';
  }
  visible.value = false;
}
</script>

<style scoped>
.profile-settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.avatar-preview {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}
.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}
.avatar-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}
.info-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.info-label {
  width: 60px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.info-value {
  font-size: 14px;
  color: var(--text-primary);
}
</style>
