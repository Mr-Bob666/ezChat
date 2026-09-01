<template>
  <div class="date-separator">
    <span class="date-text">{{ date }}</span>
  </div>
</template>

<script setup>
defineProps({
  date: { type: String, required: true },
});
</script>

<style scoped>
.date-separator {
  display: flex;
  align-items: center;
  margin: 18px 0 10px;
}
.date-separator::before,
.date-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--hair);
}
.date-text {
  padding: 4px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  color: var(--muted);
  background: var(--bg-2);
  border: 1px solid var(--hair);
  border-radius: 999px;
  white-space: nowrap;
  font-family: var(--font-mono);
}
</style>
