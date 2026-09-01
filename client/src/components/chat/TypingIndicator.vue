<template>
  <div class="typing-indicator" v-if="typingUsers.length > 0">
    <span class="typing-dots">
      <span></span><span></span><span></span>
    </span>
    <span class="typing-text">{{ typingText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  typingUsers: { type: Array, default: () => [] },
});

const typingText = computed(() => {
  const names = props.typingUsers.map((u) => u.username);
  if (names.length === 1) return `${names[0]} 正在输入...`;
  if (names.length === 2) return `${names[0]} 和 ${names[1]} 正在输入...`;
  return `${names.length} 人正在输入...`;
});
</script>

<style scoped>
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 24px 4px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}
.typing-dots {
  display: inline-flex;
  gap: 3px;
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--bg-2);
  border: 1px solid var(--hair);
}
.typing-dots span {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--brand);
  animation: typing 1.2s ease-in-out infinite;
}
.typing-dots span:nth-child(2) { animation-delay: 0.18s; }
.typing-dots span:nth-child(3) { animation-delay: 0.36s; }
@keyframes typing {
  0%, 100% { opacity: .25; transform: scale(.85); }
  50%      { opacity: 1;   transform: scale(1.1); }
}
.typing-text {
  font-style: italic;
}
</style>
